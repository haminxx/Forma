//! Stage 5: final scoring and best-candidate selection.
//!
//! We combine raw matcher confidence with:
//!   * term specificity (higher = more precise term wins tiebreak)
//!   * term adoption    (more-used terms are safer defaults)
//!   * context bonuses from [`super::context`]
//!   * learned bias from past user accepts/rejects (TODO Phase 9 — DB
//!     hook intentionally left unused here so we can swap it in cleanly)

use crate::brain::matcher::MatchCandidate;
use crate::db::Db;
use crate::model::FocusContext;

pub fn pick_best(
    candidates: &[MatchCandidate],
    _ctx: &FocusContext,
) -> Option<MatchCandidate> {
    candidates
        .iter()
        .cloned()
        .max_by(|a, b| {
            a.score
                .partial_cmp(&b.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        })
}

/// Same as [`pick_best`], but applies per-term learned bias from the
/// interactions table. Preferred in the live pipeline; [`pick_best`]
/// kept for pure/unit-tested use.
pub fn pick_best_with_learning(
    candidates: &[MatchCandidate],
    _ctx: &FocusContext,
    db: &Db,
) -> Option<MatchCandidate> {
    candidates
        .iter()
        .cloned()
        .map(|mut c| {
            let bias = db.term_learned_bias(&c.term_id).unwrap_or(0.0);
            c.score = (c.score + bias).clamp(0.0, 1.0);
            c
        })
        .max_by(|a, b| {
            a.score
                .partial_cmp(&b.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        })
}
