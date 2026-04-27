//! Interaction logging and learning loop (`Idea.md` §6.8).

use anyhow::Result;
use rusqlite::params;

use crate::db::Db;

/// Monotonic-ish id: nanos since epoch, hex-encoded. Good enough for
/// a single-user local log; not collision-safe across machines.
fn gen_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("i_{nanos:032x}")
}

#[derive(Debug, Clone, Copy)]
pub enum Action {
    Accepted,
    Rejected,
    Modified,
    Dismissed,
}

impl Action {
    fn as_str(self) -> &'static str {
        match self {
            Self::Accepted => "accepted",
            Self::Rejected => "rejected",
            Self::Modified => "modified",
            Self::Dismissed => "dismissed",
        }
    }
}

impl Db {
    pub fn log_interaction(
        &self,
        term_id: &str,
        category: &str,
        action: Action,
        original_text: &str,
        replacement: Option<&str>,
        app_context: Option<&str>,
    ) -> Result<()> {
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO interactions (id, term_id, category, action, original_text, replacement, app_context, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now'))",
            params![
                gen_id(),
                term_id,
                category,
                action.as_str(),
                original_text,
                replacement,
                app_context,
            ],
        )?;
        Ok(())
    }

    /// Per-term delta applied on top of the matcher's base confidence.
    /// Positive after repeated accepts, negative after repeated rejects.
    pub fn term_learned_bias(&self, term_id: &str) -> Result<f32> {
        let conn = self.conn.lock();
        let (acc, rej): (i64, i64) = conn
            .query_row(
                "SELECT
                   SUM(CASE WHEN action = 'accepted' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END)
                 FROM interactions WHERE term_id = ?1",
                params![term_id],
                |row| {
                    Ok((
                        row.get::<_, Option<i64>>(0)?.unwrap_or(0),
                        row.get::<_, Option<i64>>(1)?.unwrap_or(0),
                    ))
                },
            )
            .unwrap_or((0, 0));
        Ok((acc as f32) * 0.02 - (rej as f32) * 0.05)
    }
}
