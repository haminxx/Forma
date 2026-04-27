//! Stage 4: context disambiguation.
//!
//! Applies per-candidate bonuses based on:
//!   * `FocusContext` (app / URL)
//!   * Surrounding text keywords
//!   * User profile (framework / design system)
//!
//! Skeleton implementation — wired in for Phase 7 polish.

use crate::brain::matcher::MatchCandidate;
use crate::db::terms::Term;
use crate::model::FocusContext;

pub fn apply_context_bonus(
    candidate: &MatchCandidate,
    term: &Term,
    ctx: &FocusContext,
    surrounding: &str,
) -> f32 {
    let mut bonus = 0.0f32;

    // +0.05 if any context keyword is present in the surrounding text.
    let surrounding = surrounding.to_lowercase();
    for kw in &term.context_keywords {
        if surrounding.contains(&kw.to_lowercase()) {
            bonus += 0.03;
        }
    }

    // +0.04 if the app/URL strongly implies the domain.
    if term.domain == "component" && ctx.is_prompt_field {
        bonus += 0.02;
    }

    candidate.score + bonus.min(0.15)
}
