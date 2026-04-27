//! `lexis_cli` — a terminal harness for the Brain.
//!
//! Usage:
//!
//! ```text
//!   lexis_cli init                               # build DB, seed packs
//!   lexis_cli match "blurry floating menu"       # run the pipeline
//!   lexis_cli test tests/prompts/fixtures.json   # run golden suite
//! ```

use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};

use lexis_lib::brain::Brain;
use lexis_lib::db::Db;
use lexis_lib::model::FocusContext;

#[derive(Parser, Debug)]
#[command(name = "lexis_cli", version)]
struct Cli {
    /// Override the DB path (defaults to ./.lexis-cli.db in cwd).
    #[arg(long, global = true)]
    db: Option<PathBuf>,

    /// Override the packs directory (defaults to src-tauri/packs).
    #[arg(long, global = true)]
    packs: Option<PathBuf>,

    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand, Debug)]
enum Cmd {
    /// Initialise DB and seed bundled packs.
    Init,
    /// Analyze a free-form phrase and print suggestions.
    Match {
        #[arg(required = true)]
        text: Vec<String>,
    },
    /// Run the golden-prompt test fixture.
    Test { fixture: PathBuf },
    /// List loaded packs.
    Packs,
    /// Dump every matcher layer's scores for debugging.
    Explain { text: Vec<String> },
}

fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "warn,lexis_lib=info".into()),
        )
        .init();

    let cli = Cli::parse();
    let db_path = cli.db.unwrap_or_else(|| PathBuf::from(".lexis-cli.db"));
    let packs_dir = cli
        .packs
        .unwrap_or_else(|| PathBuf::from("src-tauri/packs"));

    let db = Arc::new(Db::open(&db_path)?);
    db.migrate()?;
    if packs_dir.exists() {
        db.seed_packs(&packs_dir)
            .with_context(|| format!("seeding packs from {packs_dir:?}"))?;
    }

    match cli.cmd {
        Cmd::Init => {
            println!("Initialised {} packs", db.list_pack_ids()?.len());
        }
        Cmd::Match { text } => {
            let phrase = text.join(" ");
            let brain = Brain::new(db.clone());
            let ctx = FocusContext::default();
            let suggestions = brain.analyze(&phrase, &ctx);
            if suggestions.is_empty() {
                println!("(no suggestions)");
            } else {
                for (i, s) in suggestions.iter().enumerate() {
                    println!(
                        "{i}. [{:?}] {} (conf {:.2})\n   matched: {:?}\n   → {}",
                        s.category, s.canonical, s.confidence, s.original_text, s.replacement
                    );
                }
            }
        }
        Cmd::Explain { text } => {
            let phrase = text.join(" ");
            let brain = Brain::new(db.clone());
            let ctx = FocusContext::default();
            let suggestions = brain.analyze(&phrase, &ctx);
            println!("Input: {phrase}");
            println!("→ {} suggestion(s):", suggestions.len());
            for s in &suggestions {
                println!("  * {} [{}]  conf={:.2}", s.canonical, s.term_id, s.confidence);
            }
        }
        Cmd::Packs => {
            for (id, name, version, n) in db.list_pack_ids()? {
                println!("{id}  ({n} terms)  v{version}  — {name}");
            }
        }
        Cmd::Test { fixture } => run_fixture(&db, &fixture)?,
    }
    Ok(())
}

#[derive(serde::Deserialize)]
struct FixtureFile {
    cases: Vec<FixtureCase>,
}

#[derive(serde::Deserialize)]
struct FixtureCase {
    input: String,
    expect_term: String,
    #[serde(default)]
    min_confidence: Option<f32>,
}

fn run_fixture(db: &Arc<Db>, path: &std::path::Path) -> Result<()> {
    let raw = std::fs::read(path)?;
    let fixture: FixtureFile = serde_json::from_slice(&raw)?;
    let brain = Brain::new(db.clone());
    let ctx = FocusContext::default();

    let mut passed = 0;
    let mut failed = 0;
    for (i, case) in fixture.cases.iter().enumerate() {
        let suggestions = brain.analyze(&case.input, &ctx);
        let hit = suggestions
            .iter()
            .find(|s| s.term_id == case.expect_term);
        match hit {
            Some(s) if s.confidence >= case.min_confidence.unwrap_or(0.6) => {
                passed += 1;
                println!(
                    "  ok   [{i:>3}]  {} → {} (conf {:.2})",
                    shorten(&case.input, 40),
                    s.term_id,
                    s.confidence
                );
            }
            Some(s) => {
                failed += 1;
                println!(
                    "  FAIL [{i:>3}]  {} → {} conf {:.2} < min {:.2}",
                    shorten(&case.input, 40),
                    s.term_id,
                    s.confidence,
                    case.min_confidence.unwrap_or(0.6)
                );
            }
            None => {
                failed += 1;
                let got: Vec<String> = suggestions
                    .iter()
                    .map(|s| format!("{}({:.2})", s.term_id, s.confidence))
                    .collect();
                println!(
                    "  MISS [{i:>3}]  {} → expected {} got [{}]",
                    shorten(&case.input, 40),
                    case.expect_term,
                    got.join(", ")
                );
            }
        }
    }
    println!("\n{passed} passed, {failed} failed, {} total", passed + failed);
    if failed > 0 {
        std::process::exit(1);
    }
    Ok(())
}

fn shorten(s: &str, n: usize) -> String {
    if s.len() <= n {
        format!("{s:<n$}")
    } else {
        format!("{}…", &s[..n - 1])
    }
}
