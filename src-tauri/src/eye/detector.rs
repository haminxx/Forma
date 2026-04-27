//! Prompt-field detection heuristic (`Idea.md` §6.2).
//!
//! Produces a score in [0, 100] that indicates how likely the current
//! focus is "a prompt input for an AI tool" as opposed to a search bar,
//! filename field, URL bar, etc.

use crate::model::{FocusContext, WhitelistedApp};

pub struct Signals<'a> {
    pub ctx: &'a FocusContext,
    pub text: &'a str,
    pub whitelist: &'a [WhitelistedApp],
}

pub fn score(sig: Signals<'_>) -> u8 {
    let mut s: u16 = 0;

    let app_match = sig.whitelist.iter().any(|w| {
        let process_hit = sig
            .ctx
            .process_name
            .eq_ignore_ascii_case(&w.process);
        let url_hit = match (&w.url, &sig.ctx.url) {
            (Some(want), Some(got)) => got.contains(want),
            _ => false,
        };
        process_hit && (w.url.is_none() || url_hit)
    });
    if app_match {
        s += 50;
    }

    if sig
        .ctx
        .window_title
        .to_lowercase()
        .contains("prompt")
    {
        s += 5;
    }

    // +15 imperative verbs
    let verbs = ["build", "create", "make", "design", "generate", "add"];
    let lc = sig.text.to_lowercase();
    if verbs.iter().any(|v| lc.split_whitespace().any(|w| w == *v)) {
        s += 15;
    }

    // +10 length
    if sig.text.len() > 30 {
        s += 10;
    }

    // +5 UI nouns
    let nouns = [
        "button", "page", "menu", "sidebar", "header", "footer", "card",
        "modal", "drawer", "toast", "grid", "form", "table", "popover",
    ];
    if nouns.iter().any(|n| lc.contains(n)) {
        s += 5;
    }

    s.min(100) as u8
}

pub fn is_prompt(s: u8) -> bool {
    s >= 50
}
