//! The Hands: clipboard-safe text replacement.

pub mod clipboard;
pub mod injection;
pub mod selection;

use std::thread::sleep;
use std::time::Duration;

use anyhow::{Context, Result};

use crate::model::Suggestion;

pub struct Hands;

impl Hands {
    pub fn new() -> Self {
        Self
    }

    /// Execute the full accept flow:
    ///
    /// 1. Cache user's clipboard.
    /// 2. Select the original span (Shift+Arrow fallback only for now —
    ///    UIA TextRange.Select lives in the Eyes module and will be
    ///    hoisted into [`selection`] in Phase 7).
    /// 3. Write replacement to clipboard.
    /// 4. Paste (Ctrl+V / Cmd+V).
    /// 5. Restore clipboard after a short delay.
    pub fn apply(&self, suggestion: &Suggestion) -> Result<()> {
        let original = clipboard::read().unwrap_or_default();

        // Step 2: select backwards over the original phrase. The caller
        // must have positioned the caret at the END of the phrase; our
        // eye module emits suggestions on pauses so this is usually true.
        let char_count = suggestion.original_text.chars().count();
        selection::select_backward(char_count).context("selection")?;

        // Step 3: put replacement on clipboard.
        clipboard::write(&suggestion.replacement).context("clipboard write")?;

        // Step 4: paste.
        injection::paste().context("paste")?;

        // Step 5: restore after the paste settles. 120 ms is enough for
        // most apps; we wrap in a watchdog in Phase 12.
        sleep(Duration::from_millis(120));
        clipboard::write(&original).ok();
        Ok(())
    }
}
