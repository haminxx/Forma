//! Vague-pattern lookups (Layer C of the matcher).

use anyhow::Result;
use rusqlite::params;

use crate::db::Db;

#[derive(Debug, Clone)]
pub struct VaguePattern {
    pub id: String,
    pub pattern: String,
    pub term_id: String,
    pub base_confidence: f32,
    pub domain_hint: Option<String>,
}

impl Db {
    pub fn load_vague_patterns(&self) -> Result<Vec<VaguePattern>> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT id, pattern, term_id, base_confidence, domain_hint
             FROM vague_patterns",
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(VaguePattern {
                id: row.get(0)?,
                pattern: row.get(1)?,
                term_id: row.get(2)?,
                base_confidence: row.get(3)?,
                domain_hint: row.get(4)?,
            })
        })?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r?);
        }
        Ok(out)
    }

    pub fn list_pack_ids(&self) -> Result<Vec<(String, String, String, i64)>> {
        let conn = self.conn.lock();
        let mut stmt =
            conn.prepare("SELECT id, name, version, term_count FROM packs ORDER BY name")?;
        let rows = stmt.query_map(params![], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
            ))
        })?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r?);
        }
        Ok(out)
    }
}
