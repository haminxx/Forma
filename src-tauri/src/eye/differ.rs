//! Minimal diff between two text snapshots. Used to cheaply detect
//! whether a new snapshot contains user-meaningful new content.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Diff<'a> {
    pub changed: bool,
    pub inserted: &'a str,
    pub deleted_len: usize,
    pub common_prefix: usize,
    pub common_suffix: usize,
}

pub fn diff<'a>(old: &str, new: &'a str) -> Diff<'a> {
    if old == new {
        return Diff {
            changed: false,
            inserted: "",
            deleted_len: 0,
            common_prefix: old.len(),
            common_suffix: 0,
        };
    }

    let o = old.as_bytes();
    let n = new.as_bytes();
    let mut p = 0usize;
    while p < o.len() && p < n.len() && o[p] == n[p] {
        p += 1;
    }
    let mut s = 0usize;
    while s < o.len() - p && s < n.len() - p && o[o.len() - 1 - s] == n[n.len() - 1 - s] {
        s += 1;
    }

    // Align to char boundaries.
    let p = floor_char_boundary(new, p);
    let s = floor_char_boundary(new, new.len() - s) - p;
    let inserted = &new[p..p + s.min(new.len() - p)];

    Diff {
        changed: true,
        inserted,
        deleted_len: old.len().saturating_sub(new.len()),
        common_prefix: p,
        common_suffix: new.len().saturating_sub(p + inserted.len()),
    }
}

fn floor_char_boundary(s: &str, mut i: usize) -> usize {
    while i > 0 && !s.is_char_boundary(i) {
        i -= 1;
    }
    i.min(s.len())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn no_change() {
        let d = diff("hello", "hello");
        assert!(!d.changed);
    }

    #[test]
    fn append() {
        let d = diff("hello", "hello world");
        assert!(d.changed);
        assert_eq!(d.inserted, " world");
    }
}
