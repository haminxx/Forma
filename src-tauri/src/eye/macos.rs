//! macOS Accessibility backend (Phase 10).
//!
//! Real implementation will use `objc2` + the `AXUIElement` C API to:
//!   1. Check `AXIsProcessTrusted()` and prompt if needed.
//!   2. Create an `AXObserver` for `kAXFocusedUIElementChangedNotification`.
//!   3. Read `kAXValueAttribute`, `kAXSelectedTextRangeAttribute`,
//!      `kAXBoundsForRangeParameterizedAttribute`.
//!
//! The skeleton here keeps compilation green on macOS hosts and
//! yields no events.

use anyhow::Result;

use super::{EyeEvent, EyeSession};

pub fn start_session() -> Result<Box<dyn EyeSession>> {
    Ok(Box::new(MacEye))
}

pub struct MacEye;

impl EyeSession for MacEye {
    fn run(self: Box<Self>, _emit: Box<dyn FnMut(EyeEvent) + Send>) {
        tracing::warn!(
            "macOS Eyes backend is a stub (Phase 10). See src-tauri/src/eye/macos.rs."
        );
        loop {
            std::thread::sleep(std::time::Duration::from_secs(60));
        }
    }
}
