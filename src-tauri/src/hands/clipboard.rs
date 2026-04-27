//! Clipboard cache / restore.

use anyhow::{Context, Result};
use arboard::Clipboard;
use parking_lot::Mutex;

static CLIPBOARD: once_cell::sync::Lazy<Mutex<Option<Clipboard>>> =
    once_cell::sync::Lazy::new(|| Mutex::new(Clipboard::new().ok()));

pub fn read() -> Result<String> {
    let mut guard = CLIPBOARD.lock();
    if guard.is_none() {
        *guard = Some(Clipboard::new().context("clipboard init")?);
    }
    Ok(guard.as_mut().unwrap().get_text().unwrap_or_default())
}

pub fn write(text: &str) -> Result<()> {
    let mut guard = CLIPBOARD.lock();
    if guard.is_none() {
        *guard = Some(Clipboard::new().context("clipboard init")?);
    }
    guard
        .as_mut()
        .unwrap()
        .set_text(text.to_string())
        .context("clipboard write")
}
