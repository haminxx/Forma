//! Keystroke simulation via `enigo`.

use anyhow::{Context, Result};
use enigo::{Direction, Enigo, Key, Keyboard, Settings};

fn enigo() -> Result<Enigo> {
    Enigo::new(&Settings::default()).context("enigo init")
}

pub fn paste() -> Result<()> {
    let mut e = enigo()?;
    #[cfg(target_os = "macos")]
    let modifier = Key::Meta;
    #[cfg(not(target_os = "macos"))]
    let modifier = Key::Control;

    e.key(modifier, Direction::Press).ok();
    e.key(Key::Unicode('v'), Direction::Click).ok();
    e.key(modifier, Direction::Release).ok();
    Ok(())
}

pub fn backspace(times: usize) -> Result<()> {
    let mut e = enigo()?;
    for _ in 0..times {
        e.key(Key::Backspace, Direction::Click).ok();
    }
    Ok(())
}
