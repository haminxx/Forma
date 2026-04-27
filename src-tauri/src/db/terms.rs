//! CRUD for the `terms`, `packs`, and `terms_fts` tables.

use anyhow::Result;
use rusqlite::{params, Connection, Transaction};
use serde::{Deserialize, Serialize};

use crate::db::Db;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackFile {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    pub version: String,
    pub terms: Vec<TermFile>,
    #[serde(default)]
    pub vague_patterns: Vec<PatternFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TermFile {
    pub id: String,
    pub canonical_name: String,
    pub domain: String,
    #[serde(default)]
    pub subdomain: Option<String>,
    pub description: String,
    #[serde(default)]
    pub aliases: Vec<String>,
    #[serde(default)]
    pub vague_triggers: Vec<String>,
    #[serde(default)]
    pub context_keywords: Vec<String>,
    #[serde(default)]
    pub related_terms: Vec<String>,
    #[serde(default = "default_specificity")]
    pub specificity: f32,
    #[serde(default = "default_adoption")]
    pub adoption: f32,
    #[serde(default)]
    pub example_prompt: Option<String>,
    #[serde(default)]
    pub replacement: Option<String>,
    #[serde(default)]
    pub animation_asset: Option<String>,
    #[serde(default)]
    pub live_preview_id: Option<String>,
    #[serde(default)]
    pub source_url: Option<String>,
}

fn default_specificity() -> f32 {
    0.75
}
fn default_adoption() -> f32 {
    0.75
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternFile {
    pub id: String,
    pub pattern: String,
    pub term_id: String,
    #[serde(default = "default_pattern_confidence")]
    pub base_confidence: f32,
    #[serde(default)]
    pub domain_hint: Option<String>,
}

fn default_pattern_confidence() -> f32 {
    0.7
}

/// A term as loaded from the DB with its JSON arrays parsed.
#[derive(Debug, Clone)]
pub struct Term {
    pub id: String,
    pub canonical_name: String,
    pub domain: String,
    pub description: String,
    pub aliases: Vec<String>,
    pub vague_triggers: Vec<String>,
    pub context_keywords: Vec<String>,
    pub specificity: f32,
    pub adoption: f32,
    pub replacement: String,
    pub animation_asset: Option<String>,
    pub live_preview_id: Option<String>,
}

pub fn upsert_pack(tx: &Transaction, pack: &PackFile) -> Result<()> {
    tx.execute(
        "INSERT INTO packs (id, name, description, version, term_count, installed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             description = excluded.description,
             version = excluded.version,
             term_count = excluded.term_count",
        params![
            pack.id,
            pack.name,
            pack.description,
            pack.version,
            pack.terms.len() as i64
        ],
    )?;

    for term in &pack.terms {
        let aliases = serde_json::to_string(&term.aliases)?;
        let vague_triggers = serde_json::to_string(&term.vague_triggers)?;
        let context_keywords = serde_json::to_string(&term.context_keywords)?;
        let related_terms = serde_json::to_string(&term.related_terms)?;
        let replacement = term
            .replacement
            .clone()
            .unwrap_or_else(|| term.canonical_name.clone());

        tx.execute(
            "INSERT INTO terms (
                id, canonical_name, domain, subdomain, description,
                aliases, vague_triggers, context_keywords, related_terms,
                specificity, adoption, example_prompt, replacement,
                animation_asset, live_preview_id, source_url, pack_id,
                created_at, updated_at
             ) VALUES (
                ?1, ?2, ?3, ?4, ?5,
                ?6, ?7, ?8, ?9,
                ?10, ?11, ?12, ?13,
                ?14, ?15, ?16, ?17,
                datetime('now'), datetime('now')
             )
             ON CONFLICT(id) DO UPDATE SET
                canonical_name  = excluded.canonical_name,
                domain          = excluded.domain,
                subdomain       = excluded.subdomain,
                description     = excluded.description,
                aliases         = excluded.aliases,
                vague_triggers  = excluded.vague_triggers,
                context_keywords= excluded.context_keywords,
                related_terms   = excluded.related_terms,
                specificity     = excluded.specificity,
                adoption        = excluded.adoption,
                example_prompt  = excluded.example_prompt,
                replacement     = excluded.replacement,
                animation_asset = excluded.animation_asset,
                live_preview_id = excluded.live_preview_id,
                source_url      = excluded.source_url,
                pack_id         = excluded.pack_id,
                updated_at      = datetime('now')",
            params![
                term.id,
                term.canonical_name,
                term.domain,
                term.subdomain,
                term.description,
                aliases,
                vague_triggers,
                context_keywords,
                related_terms,
                term.specificity,
                term.adoption,
                term.example_prompt,
                replacement,
                term.animation_asset,
                term.live_preview_id,
                term.source_url,
                pack.id,
            ],
        )?;

        // Refresh the FTS row.
        tx.execute(
            "DELETE FROM terms_fts WHERE term_id = ?1",
            params![term.id],
        )?;
        tx.execute(
            "INSERT INTO terms_fts (term_id, canonical_name, aliases, vague_triggers, description)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                term.id,
                term.canonical_name,
                term.aliases.join(" "),
                term.vague_triggers.join(" "),
                term.description,
            ],
        )?;
    }

    for pat in &pack.vague_patterns {
        tx.execute(
            "INSERT INTO vague_patterns (id, pattern, term_id, base_confidence, domain_hint, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))
             ON CONFLICT(id) DO UPDATE SET
                pattern = excluded.pattern,
                term_id = excluded.term_id,
                base_confidence = excluded.base_confidence,
                domain_hint = excluded.domain_hint",
            params![
                pat.id,
                pat.pattern,
                pat.term_id,
                pat.base_confidence,
                pat.domain_hint,
            ],
        )?;
    }

    Ok(())
}

pub fn load_all(conn: &Connection) -> Result<Vec<Term>> {
    let mut stmt = conn.prepare(
        "SELECT id, canonical_name, domain, description,
                aliases, vague_triggers, context_keywords,
                specificity, adoption, replacement,
                animation_asset, live_preview_id
         FROM terms",
    )?;
    let rows = stmt.query_map([], |row| {
        let aliases: String = row.get(4)?;
        let vague: String = row.get(5)?;
        let ctx: String = row.get(6)?;
        Ok(Term {
            id: row.get(0)?,
            canonical_name: row.get(1)?,
            domain: row.get(2)?,
            description: row.get(3)?,
            aliases: serde_json::from_str(&aliases).unwrap_or_default(),
            vague_triggers: serde_json::from_str(&vague).unwrap_or_default(),
            context_keywords: serde_json::from_str(&ctx).unwrap_or_default(),
            specificity: row.get(7)?,
            adoption: row.get(8)?,
            replacement: row.get::<_, Option<String>>(9)?.unwrap_or_default(),
            animation_asset: row.get(10)?,
            live_preview_id: row.get(11)?,
        })
    })?;

    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

pub fn get(conn: &Connection, id: &str) -> Result<Option<Term>> {
    let mut stmt = conn.prepare(
        "SELECT id, canonical_name, domain, description,
                aliases, vague_triggers, context_keywords,
                specificity, adoption, replacement,
                animation_asset, live_preview_id
         FROM terms WHERE id = ?1",
    )?;
    let mut rows = stmt.query(params![id])?;
    if let Some(row) = rows.next()? {
        let aliases: String = row.get(4)?;
        let vague: String = row.get(5)?;
        let ctx: String = row.get(6)?;
        Ok(Some(Term {
            id: row.get(0)?,
            canonical_name: row.get(1)?,
            domain: row.get(2)?,
            description: row.get(3)?,
            aliases: serde_json::from_str(&aliases).unwrap_or_default(),
            vague_triggers: serde_json::from_str(&vague).unwrap_or_default(),
            context_keywords: serde_json::from_str(&ctx).unwrap_or_default(),
            specificity: row.get(7)?,
            adoption: row.get(8)?,
            replacement: row.get::<_, Option<String>>(9)?.unwrap_or_default(),
            animation_asset: row.get(10)?,
            live_preview_id: row.get(11)?,
        }))
    } else {
        Ok(None)
    }
}

/// Full-text search (Layer B). Returns candidate term IDs with a
/// rough FTS score in [0, 1].
pub fn fts_search(conn: &Connection, query: &str, limit: usize) -> Result<Vec<(String, f32)>> {
    let sanitized = sanitize_fts(query);
    if sanitized.is_empty() {
        return Ok(Vec::new());
    }
    let mut stmt = conn.prepare(
        "SELECT term_id, bm25(terms_fts) AS score
         FROM terms_fts
         WHERE terms_fts MATCH ?1
         ORDER BY score
         LIMIT ?2",
    )?;
    let rows = stmt.query_map(params![sanitized, limit as i64], |row| {
        let id: String = row.get(0)?;
        let bm25: f64 = row.get(1)?;
        // bm25 is LOWER = better; map to roughly [0,1].
        let norm = (1.0 / (1.0 + bm25.max(0.0))) as f32;
        Ok((id, norm))
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

fn sanitize_fts(query: &str) -> String {
    // FTS5 MATCH is picky. Quote every token to kill operators like `:` `"` `*`.
    query
        .split_whitespace()
        .filter(|w| w.chars().any(|c| c.is_alphanumeric()))
        .map(|w| {
            let clean: String = w
                .chars()
                .filter(|c| c.is_alphanumeric() || *c == '-')
                .collect();
            format!("\"{clean}\"")
        })
        .collect::<Vec<_>>()
        .join(" OR ")
}

impl Db {
    pub fn load_all_terms(&self) -> Result<Vec<Term>> {
        load_all(&self.conn.lock())
    }
    pub fn get_term(&self, id: &str) -> Result<Option<Term>> {
        get(&self.conn.lock(), id)
    }
    pub fn fts_search_terms(&self, query: &str, limit: usize) -> Result<Vec<(String, f32)>> {
        fts_search(&self.conn.lock(), query, limit)
    }
}
