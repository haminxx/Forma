//! Overlay window lifecycle.
//!
//! We keep a single full-screen transparent window (`"overlay"`) that
//! the React app paints into. The invariant: **by default, the window
//! is entirely click-through**; it only captures mouse events while a
//! React element claims a sub-rect via
//! [`crate::commands::report_ui_rects`].

use anyhow::{Context, Result};
use parking_lot::Mutex;
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize};

use crate::model::Rect;

pub struct Overlay {
    app: AppHandle,
    ui_rects: Mutex<Vec<Rect>>,
}

impl Overlay {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            ui_rects: Mutex::new(Vec::new()),
        }
    }

    /// Size the overlay to cover the primary monitor and enable click-through.
    pub fn prepare(&self) -> Result<()> {
        let window = self
            .app
            .get_webview_window("overlay")
            .context("no overlay window")?;

        if let Some(monitor) = window
            .primary_monitor()
            .ok()
            .flatten()
            .or_else(|| window.current_monitor().ok().flatten())
        {
            let size = monitor.size();
            let pos = monitor.position();
            window.set_position(PhysicalPosition::new(pos.x, pos.y)).ok();
            window
                .set_size(PhysicalSize::new(size.width, size.height))
                .ok();
        }

        // Start fully click-through.
        window.set_ignore_cursor_events(true).ok();
        Ok(())
    }

    pub fn show(&self) -> Result<()> {
        if let Some(w) = self.app.get_webview_window("overlay") {
            w.show()?;
        }
        Ok(())
    }

    pub fn hide_all(&self) -> Result<()> {
        if let Some(w) = self.app.get_webview_window("overlay") {
            w.hide().ok();
        }
        Ok(())
    }

    /// Called from `commands::report_ui_rects`. Whenever the set of
    /// UI-claiming rects is non-empty AND the cursor is inside one,
    /// click-through is disabled; otherwise it's enabled.
    ///
    /// For the MVP we simply switch: "any visible UI rect → capture
    /// clicks". Per-frame mouse polling lives in [`positioning`].
    pub fn set_ui_rects(&self, rects: Vec<Rect>) -> Result<()> {
        *self.ui_rects.lock() = rects.clone();
        let window = self
            .app
            .get_webview_window("overlay")
            .context("no overlay window")?;
        let ignore = rects.is_empty();
        window.set_ignore_cursor_events(ignore)?;
        Ok(())
    }

    pub fn ui_rects(&self) -> Vec<Rect> {
        self.ui_rects.lock().clone()
    }
}
