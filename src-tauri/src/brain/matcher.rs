//! Stage 3: multi-layer term matching (A/B/C/[D]).
//!
//! Layer A — exact alias / vague-trigger lookup (in-memory hashmap).
//! Layer B — FTS5 full-text search over `terms_fts`.
//! Layer C — fuzzy vague-pattern matcher (trigram + Levenshtein).
//! Layer D — semantic embedding similarity (feature = "semantic").

use std::collections::HashMap;

use anyhow::Result;
use strsim::{jaro_winkler, normalized_levenshtein};

use crate::db::{patterns::VaguePattern, terms::Term, Db};

#[derive(Debug, Clone)]
pub struct MatchCandidate {
    pub term_id: String,
    pub score: f32,
    pub layer: Layer,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Layer {
    Alias,
    VagueTrigger,
    Fts,
    Pattern,
    Semantic,
}

/// In-memory indexes precomputed from the DB at startup.
pub struct Matcher {
    /// Lowercased alias / vague-trigger text → term id.
    direct_index: HashMap<String, (String, f32)>,
    /// All terms, for fuzzy fallback.
    terms: Vec<Term>,
    /// Vague patterns for Layer C.
    patterns: Vec<VaguePattern>,
}

impl Matcher {
    pub fn empty() -> Self {
        Self {
            direct_index: HashMap::new(),
            terms: Vec::new(),
            patterns: Vec::new(),
        }
    }

    pub fn build(db: &Db) -> Result<Self> {
        let terms = db.load_all_terms()?;
        let patterns = db.load_vague_patterns()?;

        let mut direct_index = HashMap::new();
        for t in &terms {
            direct_index.insert(t.canonical_name.to_lowercase(), (t.id.clone(), 1.0));
            for a in &t.aliases {
                direct_index
                    .entry(a.to_lowercase())
                    .or_insert_with(|| (t.id.clone(), 0.95));
            }
            for v in &t.vague_triggers {
                direct_index
                    .entry(v.to_lowercase())
                    .or_insert_with(|| (t.id.clone(), 0.9));
            }
        }

        Ok(Self {
            direct_index,
            terms,
            patterns,
        })
    }

    /// Run all layers, merge, sort, return top `limit`.
    pub fn find(&self, phrase: &str, db: &Db, limit: usize) -> Result<Vec<MatchCandidate>> {
        self.find_with_embedding(phrase, db, limit, None)
    }

    /// Same as [`find`], but the caller may pre-embed the phrase and
    /// pass the vector for Layer D (semantic search). When `None`,
    /// Layer D is skipped entirely.
    pub fn find_with_embedding(
        &self,
        phrase: &str,
        db: &Db,
        limit: usize,
        query_embedding: Option<&[f32]>,
    ) -> Result<Vec<MatchCandidate>> {
        let mut all: Vec<MatchCandidate> = Vec::new();
        let key = phrase.to_lowercase();

        // Layer A — direct alias / trigger.
        if let Some((id, w)) = self.direct_index.get(&key) {
            all.push(MatchCandidate {
                term_id: id.clone(),
                score: *w,
                layer: Layer::Alias,
            });
        }

        // Layer A' — substring containment of a known alias/trigger.
        // Keeps "blurry transparent box that shows options" → uic.glass-popover.
        for (needle, (id, w)) in &self.direct_index {
            if needle.len() >= 6 && key.contains(needle) {
                all.push(MatchCandidate {
                    term_id: id.clone(),
                    score: *w * 0.93,
                    layer: Layer::VagueTrigger,
                });
            }
        }

        // Layer B — FTS5 BM25.
        if let Ok(rows) = db.fts_search_terms(phrase, limit * 2) {
            for (id, score) in rows {
                all.push(MatchCandidate {
                    term_id: id,
                    score: score * 0.8, // FTS alone is weaker than exact alias
                    layer: Layer::Fts,
                });
            }
        }

        // Layer C — fuzzy pattern.
        for p in &self.patterns {
            let sim = normalized_levenshtein(&key, &p.pattern.to_lowercase()) as f32;
            let jw = jaro_winkler(&key, &p.pattern.to_lowercase()) as f32;
            let combined = (sim * 0.4 + jw * 0.6) * p.base_confidence;
            if combined >= 0.65 {
                all.push(MatchCandidate {
                    term_id: p.term_id.clone(),
                    score: combined,
                    layer: Layer::Pattern,
                });
            }
        }

        // Layer C' — fuzzy match against every term's aliases / triggers.
        // Useful when the user's phrasing is close to but not identical to
        // a stored alias ("frosted popup" ~ "frosted popover").
        for t in &self.terms {
            for candidate_text in t.aliases.iter().chain(t.vague_triggers.iter()) {
                let lc = candidate_text.to_lowercase();
                if lc.len() < 6 {
                    continue;
                }
                let jw = jaro_winkler(&key, &lc) as f32;
                if jw >= 0.88 {
                    all.push(MatchCandidate {
                        term_id: t.id.clone(),
                        score: jw * 0.85,
                        layer: Layer::Pattern,
                    });
                }
            }
        }

        // Layer D — semantic similarity (optional).
        if let Some(q) = query_embedding {
            if !q.is_empty() {
                if let Ok(rows) = db.nearest_by_embedding(q, limit * 2, 0.65) {
                    for (id, score) in rows {
                        all.push(MatchCandidate {
                            term_id: id,
                            score,
                            layer: Layer::Semantic,
                        });
                    }
                }
            }
        }

        // Deduplicate by term_id, keep max score.
        let mut best: HashMap<String, MatchCandidate> = HashMap::new();
        for c in all {
            best.entry(c.term_id.clone())
                .and_modify(|cur| {
                    if c.score > cur.score {
                        *cur = c.clone();
                    }
                })
                .or_insert(c);
        }
        let mut out: Vec<MatchCandidate> = best.into_values().collect();
        out.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        out.truncate(limit);
        Ok(out)
    }
}
