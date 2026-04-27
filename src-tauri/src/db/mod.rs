//! SQLite storage layer. One connection pool, many query modules.

pub mod learning;
pub mod patterns;
pub mod schema;
pub mod terms;
pub mod vectors;

use std::path::Path;

use anyhow::{Context, Result};
use parking_lot::Mutex;
use rusqlite::Connection;
use tracing::info;

/// Thin wrapper around a single SQLite connection behind a mutex.
///
/// We intentionally do NOT use a pool: the entire matcher is expected
/// to run under ~5ms per query, so contention is negligible, and a
/// single connection keeps memory footprint flat at idle.
pub struct Db {
    pub(crate) conn: Mutex<Connection>,
}

impl Db {
    pub fn open(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)
            .with_context(|| format!("opening sqlite db at {path:?}"))?;
        conn.pragma_update(None, "journal_mode", "WAL").ok();
        conn.pragma_update(None, "synchronous", "NORMAL").ok();
        conn.pragma_update(None, "foreign_keys", "ON").ok();
        conn.pragma_update(None, "temp_store", "MEMORY").ok();
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Run any pending migrations to bring the schema up to HEAD.
    pub fn migrate(&self) -> Result<()> {
        let mut conn = self.conn.lock();
        schema::run_migrations(&mut conn)
    }

    /// Load every JSON pack in the given directory (non-recursive) into
    /// the `terms` and `packs` tables. Idempotent: packs are identified
    /// by `id`, duplicate inserts are ignored.
    pub fn seed_packs(&self, dir: &Path) -> Result<usize> {
        let mut loaded = 0usize;
        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) != Some("json") {
                continue;
            }
            let raw = std::fs::read(&path)?;
            let pack: terms::PackFile = serde_json::from_slice(&raw)
                .with_context(|| format!("parsing pack {path:?}"))?;
            self.install_pack(pack)?;
            loaded += 1;
        }
        info!("seeded {loaded} terminology packs");
        Ok(loaded)
    }

    pub fn install_pack(&self, pack: terms::PackFile) -> Result<()> {
        let mut conn = self.conn.lock();
        let tx = conn.transaction()?;
        terms::upsert_pack(&tx, &pack)?;
        tx.commit()?;
        Ok(())
    }
}
