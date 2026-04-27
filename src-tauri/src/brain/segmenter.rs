//! Stage 1: split raw text into sentences / clauses.

use unicode_segmentation::UnicodeSegmentation;

#[derive(Debug, Clone)]
pub struct Segment {
    pub text: String,
    /// Byte offset of this segment within the original input.
    pub offset: usize,
}

/// Split input into sentences first, then on strong clause boundaries
/// (", and ", ", with ", " — ", semicolon, em-dash).
pub fn segment(input: &str) -> Vec<Segment> {
    let mut out = Vec::new();
    for (sent_start, sentence) in input.split_sentence_bound_indices() {
        for clause in split_clauses(sentence, sent_start) {
            if !clause.text.trim().is_empty() {
                out.push(clause);
            }
        }
    }
    out
}

fn split_clauses(sentence: &str, base_offset: usize) -> Vec<Segment> {
    // Tokens that typically denote a weak boundary between descriptive
    // fragments in a UI prompt.
    let splitters = [", and ", ", with ", ", but ", "; ", " — ", " -- "];
    let mut out = Vec::new();
    let mut buf = sentence;
    let mut cursor = 0usize;

    'outer: loop {
        for sp in splitters.iter() {
            if let Some(idx) = buf.find(sp) {
                let chunk = &buf[..idx];
                out.push(Segment {
                    text: chunk.to_string(),
                    offset: base_offset + cursor,
                });
                cursor += idx + sp.len();
                buf = &buf[idx + sp.len()..];
                continue 'outer;
            }
        }
        break;
    }
    if !buf.is_empty() {
        out.push(Segment {
            text: buf.to_string(),
            offset: base_offset + cursor,
        });
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_on_sentences() {
        let s = segment("Add a drawer. Also a tooltip.");
        assert_eq!(s.len(), 2);
        assert!(s[0].text.starts_with("Add"));
        assert!(s[1].text.starts_with("Also"));
    }

    #[test]
    fn splits_on_clause_boundaries() {
        let s = segment("Build a menu that slides out from the right, with a gear icon trigger");
        assert!(s.len() >= 2);
    }
}
