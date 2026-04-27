//! Text selection.
//!
//! Strategy B (keyboard sim) is implemented here. Strategy A (UIA
//! `TextRange.Select`) is a Phase 7+ upgrade that will require hoisting
//! the live element reference from The Eyes.

use anyhow::Result;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

pub fn select_backward(char_count: usize) -> Result<()> {
    let mut e = Enigo::new(&Settings::default())?;
    e.key(Key::Shift, Direction::Press).ok();
    for _ in 0..char_count {
        e.key(Key::LeftArrow, Direction::Click).ok();
    }
    e.key(Key::Shift, Direction::Release).ok();
    Ok(())
}
