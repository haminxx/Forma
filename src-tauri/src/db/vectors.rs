//! Vector search for Layer D (semantic matching).
//!
//! Phase 7 deliverable. Currently a stub: writes embeddings as raw
//! f32 blobs, reads them back for cosine similarity in Rust. When we
//! ship `sqlite-vss`, this module will delegate to the extension and
//! push the ANN into SQLite.

use anyhow::Result;
use rusqlite::params;

use crate::db::Db;

pub fn vec_to_blob(v: &[f32]) -> Vec<u8> {
    let mut out = Vec::with_capacity(v.len() * 4);
    for f in v {
        out.extend_from_slice(&f.to_le_bytes());
    }
    out
}

pub fn blob_to_vec(blob: &[u8]) -> Vec<f32> {
    blob.chunks_exact(4)
        .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
        .collect()
}

pub fn cosine(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    let (mut dot, mut na, mut nb) = (0.0_f32, 0.0_f32, 0.0_f32);
    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
        na += x * x;
        nb += y * y;
    }
    let denom = (na.sqrt() * nb.sqrt()).max(1e-9);
    dot / denom
}

impl Db {
    pub fn store_embedding(&self, term_id: &str, model: &str, embedding: &[f32]) -> Result<()> {
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO term_embeddings (term_id, embedding, model, dim)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(term_id) DO UPDATE SET
                embedding = excluded.embedding,
                model = excluded.model,
                dim = excluded.dim",
            params![term_id, vec_to_blob(embedding), model, embedding.len() as i64],
        )?;
        Ok(())
    }

    pub fn nearest_by_embedding(
        &self,
        query: &[f32],
        top_k: usize,
        threshold: f32,
    ) -> Result<Vec<(String, f32)>> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare("SELECT term_id, embedding FROM term_embeddings")?;
        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let blob: Vec<u8> = row.get(1)?;
            Ok((id, blob))
        })?;

        let mut scored: Vec<(String, f32)> = Vec::new();
        for r in rows {
            let (id, blob) = r?;
            let v = blob_to_vec(&blob);
            let score = cosine(query, &v);
            if score >= threshold {
                scored.push((id, score));
            }
        }
        scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        scored.truncate(top_k);
        Ok(scored)
    }
}
