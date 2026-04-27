//! Linux AT-SPI2 backend (Phase 11).
//!
//! Real implementation will use the `atspi` crate to subscribe to
//! `object:state-changed:focused` and `object:text-changed:*` signals
//! over DBus, and read text/caret extents via `Text` and `Component`
//! interfaces.
//!
//! Wayland caveat: even with AT-SPI2, click-through overlay windows on
//! GNOME Mutter require a Shell extension; see the plan's §8.

use anyhow::Result;

use super::{EyeEvent, EyeSession};

pub fn start_session() -> Result<Box<dyn EyeSession>> {
    Ok(Box::new(LinuxEye))
}

pub struct LinuxEye;

impl EyeSession for LinuxEye {
    fn run(self: Box<Self>, _emit: Box<dyn FnMut(EyeEvent) + Send>) {
        tracing::warn!(
            "Linux Eyes backend is a stub (Phase 11). See src-tauri/src/eye/linux.rs."
        );
        loop {
            std::thread::sleep(std::time::Duration::from_secs(60));
        }
    }
}
