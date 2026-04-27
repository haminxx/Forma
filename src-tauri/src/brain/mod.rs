//! The Brain: segmentation → extraction → matching → scoring.
//!
//! Pipeline (see `Idea.md` §6.3):
//!
//! ```text
//! text ──▶ segmenter ──▶ extractor ──▶ matcher ──▶ scorer ──▶ [Suggestion]
//!                                        │
//!                                        ├─ Layer A: exact/alias
//!                                        ├─ Layer B: FTS5
//!                                        ├─ Layer C: vague patterns (fuzzy)
//!                                        └─ Layer D: semantic (feature-gated)
//! ```

pub mod context;
pub mod embeddings;
pub mod extractor;
pub mod matcher;
pub mod scorer;
pub mod segmenter;

use std::sync::Arc;

use anyhow::Result;

use crate::db::Db;
use crate::model::{Category, FocusContext, Suggestion};

use self::matcher::{MatchCandidate, Matcher};

/// The entry point for text analysis. Holds precomputed indexes (terms,
/// vague patterns) loaded once at startup, rebuilt when packs change.
pub struct Brain {
    db: Arc<Db>,
    matcher: parking_lot::RwLock<Matcher>,
}

impl Brain {
    pub fn new(db: Arc<Db>) -> Self {
        let matcher = Matcher::build(&db).unwrap_or_else(|e| {
            tracing::error!("failed to build matcher: {e:?}");
            Matcher::empty()
        });
        Self {
            db,
            matcher: parking_lot::RwLock::new(matcher),
        }
    }

    /// Rebuild in-memory indexes. Call after installing a new pack.
    pub fn reindex(&self) -> Result<()> {
        let m = Matcher::build(&self.db)?;
        *self.matcher.write() = m;
        Ok(())
    }

    /// Analyze a chunk of text and return zero or more suggestions.
    ///
    /// Stateless — the caller (The Eyes) is responsible for debouncing
    /// and diffing so we only analyze when the user has stopped typing.
    pub fn analyze(&self, text: &str, ctx: &FocusContext) -> Vec<Suggestion> {
        if text.trim().is_empty() {
            return Vec::new();
        }

        let segments = segmenter::segment(text);
        let mut suggestions = Vec::new();

        for seg in segments {
            let phrases = extractor::extract_phrases(&seg.text);
            for phrase in phrases {
                if phrase.words.len() < 2 && phrase.classification != extractor::Class::Vague {
                    continue;
                }

                let matcher = self.matcher.read();
                let candidates: Vec<MatchCandidate> =
                    matcher.find(&phrase.text, &self.db, 5).unwrap_or_default();

                if let Some(best) =
                    scorer::pick_best_with_learning(&candidates, ctx, &self.db)
                {
                    if best.score < 0.55 {
                        continue;
                    }
                    let term = match self.db.get_term(&best.term_id).ok().flatten() {
                        Some(t) => t,
                        None => continue,
                    };

                    let span_start = seg.offset + phrase.start;
                    let span_end = seg.offset + phrase.end;

                    let replacement = if term.replacement.is_empty() {
                        term.canonical_name.clone()
                    } else {
                        term.replacement.clone()
                    };

                    suggestions.push(Suggestion {
                        id: format!("{}::{}", term.id, span_start),
                        term_id: term.id.clone(),
                        canonical: term.canonical_name.clone(),
                        category: Category::from_str_lossy(&term.domain),
                        definition: term.description.clone(),
                        replacement,
                        original_text: phrase.text.clone(),
                        original_span: (span_start, span_end),
                        confidence: best.score,
                        animation_asset: term.animation_asset.clone(),
                        live_preview_id: term.live_preview_id.clone(),
                        rect: None,
                    });
                }
            }
        }

        // Deduplicate: if the same term lands on overlapping spans, keep
        // the highest-confidence one.
        suggestions.sort_by(|a, b| {
            b.confidence
                .partial_cmp(&a.confidence)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        let mut seen = Vec::<(usize, usize)>::new();
        suggestions.retain(|s| {
            let overlap = seen
                .iter()
                .any(|r| spans_overlap(*r, s.original_span));
            if overlap {
                false
            } else {
                seen.push(s.original_span);
                true
            }
        });

        suggestions
    }
}

fn spans_overlap(a: (usize, usize), b: (usize, usize)) -> bool {
    a.0.max(b.0) < a.1.min(b.1)
}
