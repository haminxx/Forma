//! Database schema and migrations.
//!
//! Migrations are forward-only and tracked in the `schema_migrations`
//! table. Each migration is a single SQL script; new migrations must
//! be appended, never reordered.

use anyhow::{Context, Result};
use rusqlite::Connection;

const MIGRATIONS: &[(&str, &str)] = &[
    (
        "0001_initial",
        r#"
        CREATE TABLE IF NOT EXISTS packs (
            id             TEXT PRIMARY KEY,
            name           TEXT NOT NULL,
            description    TEXT,
            version        TEXT NOT NULL,
            term_count     INTEGER NOT NULL DEFAULT 0,
            installed_at   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS terms (
            id                TEXT PRIMARY KEY,
            canonical_name    TEXT NOT NULL,
            domain            TEXT NOT NULL,
            subdomain         TEXT,
            description       TEXT NOT NULL,
            aliases           TEXT NOT NULL DEFAULT '[]',
            vague_triggers    TEXT NOT NULL DEFAULT '[]',
            context_keywords  TEXT NOT NULL DEFAULT '[]',
            related_terms     TEXT NOT NULL DEFAULT '[]',
            specificity       REAL NOT NULL DEFAULT 0.5,
            adoption          REAL NOT NULL DEFAULT 0.5,
            example_prompt    TEXT,
            replacement       TEXT,
            animation_asset   TEXT,
            live_preview_id   TEXT,
            source_url        TEXT,
            pack_id           TEXT NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
            created_at        TEXT NOT NULL,
            updated_at        TEXT NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_terms_canonical ON terms(canonical_name);
        CREATE INDEX IF NOT EXISTS idx_terms_domain ON terms(domain);
        CREATE INDEX IF NOT EXISTS idx_terms_pack ON terms(pack_id);

        CREATE TABLE IF NOT EXISTS vague_patterns (
            id               TEXT PRIMARY KEY,
            pattern          TEXT NOT NULL,
            term_id          TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
            base_confidence  REAL NOT NULL DEFAULT 0.7,
            domain_hint      TEXT,
            created_at       TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_patterns_term ON vague_patterns(term_id);

        CREATE TABLE IF NOT EXISTS user_prefs (
            term_id       TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
            action        TEXT NOT NULL,
            custom_value  TEXT,
            context       TEXT,
            created_at    TEXT NOT NULL,
            PRIMARY KEY (term_id, action)
        );

        CREATE TABLE IF NOT EXISTS interactions (
            id             TEXT PRIMARY KEY,
            term_id        TEXT REFERENCES terms(id) ON DELETE SET NULL,
            category       TEXT NOT NULL,
            action         TEXT NOT NULL,
            original_text  TEXT NOT NULL,
            replacement    TEXT,
            app_context    TEXT,
            timestamp      TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_interactions_term ON interactions(term_id);
        CREATE INDEX IF NOT EXISTS idx_interactions_ts   ON interactions(timestamp);

        -- FTS5 mirror of terms.
        CREATE VIRTUAL TABLE IF NOT EXISTS terms_fts USING fts5(
            term_id UNINDEXED,
            canonical_name,
            aliases,
            vague_triggers,
            description,
            tokenize = 'unicode61 remove_diacritics 2'
        );
        "#,
    ),
    (
        "0002_embeddings",
        r#"
        -- Reserved for Phase 7 (sqlite-vss).
        CREATE TABLE IF NOT EXISTS term_embeddings (
            term_id    TEXT PRIMARY KEY REFERENCES terms(id) ON DELETE CASCADE,
            embedding  BLOB NOT NULL,
            model      TEXT NOT NULL,
            dim        INTEGER NOT NULL
        );
        "#,
    ),
];

pub fn run_migrations(conn: &mut Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            name TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL
        )",
        (),
    )?;

    for (name, sql) in MIGRATIONS {
        let already_applied: bool = conn
            .query_row(
                "SELECT 1 FROM schema_migrations WHERE name = ?1",
                [name],
                |_| Ok(true),
            )
            .unwrap_or(false);
        if already_applied {
            continue;
        }

        let tx = conn.transaction()?;
        tx.execute_batch(sql)
            .with_context(|| format!("running migration {name}"))?;
        tx.execute(
            "INSERT INTO schema_migrations (name, applied_at) VALUES (?1, datetime('now'))",
            [name],
        )?;
        tx.commit()?;
        tracing::info!(migration = %name, "applied migration");
    }
    Ok(())
}
