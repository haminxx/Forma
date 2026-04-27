//! Stage 2: extract candidate noun / descriptive phrases from a segment.
//!
//! We don't yet ship a real POS tagger — for the CLI/MVP we use a
//! lightweight heuristic: slide a window of 2–7 words, then classify
//! each window based on presence of "vague markers" and "UI anchors".

use once_cell::sync::Lazy;
use regex::Regex;
use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Class {
    /// Likely already a specific term — skip.
    Known,
    /// Contains generic filler ("thing", "stuff", "box") — analyze.
    Vague,
    /// Multi-word descriptor that could map to a named component.
    Descriptive,
}

#[derive(Debug, Clone)]
pub struct Phrase {
    pub text: String,
    pub words: Vec<String>,
    pub start: usize,
    pub end: usize,
    pub classification: Class,
}

static VAGUE_WORDS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    [
        "thing", "things", "stuff", "something", "box", "boxes", "menu",
        "popup", "pop-up", "window", "panel", "bar", "section", "part",
        "widget", "area", "block", "chunk", "piece",
    ]
    .into_iter()
    .collect()
});

static UI_ANCHORS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    [
        "button", "card", "modal", "drawer", "sidebar", "header", "footer",
        "navbar", "nav", "list", "grid", "table", "form", "input", "select",
        "dropdown", "tooltip", "badge", "avatar", "tabs", "toast",
        "notification", "slider", "switch", "checkbox", "toggle", "calendar",
        "date", "menu", "popover", "dialog",
    ]
    .into_iter()
    .collect()
});

static STOPWORDS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    [
        "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
        "i", "you", "it", "this", "that", "these", "those", "to", "of", "in",
        "on", "at", "for", "with", "from", "by", "as", "and", "or", "but",
        "not", "no", "so", "do", "does", "did", "want", "make", "build",
        "create", "add", "please", "can", "could", "should", "would",
    ]
    .into_iter()
    .collect()
});

static WORD_RE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"[A-Za-z][A-Za-z0-9'\-]*").unwrap());

/// Sliding-window phrase extraction. Returns windows of 2..=6 tokens,
/// already classified, with byte-offsets into the input segment.
pub fn extract_phrases(segment: &str) -> Vec<Phrase> {
    let tokens: Vec<(usize, usize, String)> = WORD_RE
        .find_iter(segment)
        .map(|m| (m.start(), m.end(), m.as_str().to_lowercase()))
        .collect();

    if tokens.is_empty() {
        return Vec::new();
    }

    let mut out = Vec::new();
    let min_n = 2;
    let max_n = 6.min(tokens.len());

    for n in min_n..=max_n {
        for i in 0..=tokens.len().saturating_sub(n) {
            let window = &tokens[i..i + n];
            // Skip pure-stopword windows (everything filtered).
            let non_stop: Vec<&String> = window
                .iter()
                .map(|(_, _, w)| w)
                .filter(|w| !STOPWORDS.contains(w.as_str()))
                .collect();
            if non_stop.len() < 2 {
                continue;
            }

            let start = window.first().unwrap().0;
            let end = window.last().unwrap().1;
            let text = segment[start..end].to_string();
            let words: Vec<String> = window.iter().map(|(_, _, w)| w.clone()).collect();

            let has_vague = words.iter().any(|w| VAGUE_WORDS.contains(w.as_str()));
            let has_anchor = words.iter().any(|w| UI_ANCHORS.contains(w.as_str()));

            let class = match (has_vague, has_anchor) {
                (true, _) => Class::Vague,
                (false, true) => Class::Descriptive,
                (false, false) => {
                    if n >= 3 {
                        Class::Descriptive
                    } else {
                        continue;
                    }
                }
            };

            out.push(Phrase {
                text,
                words,
                start,
                end,
                classification: class,
            });
        }
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flags_vague_phrases() {
        let p = extract_phrases("a blurry transparent box that shows options");
        assert!(p
            .iter()
            .any(|x| x.classification == Class::Vague && x.text.contains("box")));
    }

    #[test]
    fn empty_for_gibberish() {
        assert!(extract_phrases("").is_empty());
    }
}
