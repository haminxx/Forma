//! The Eyes: OS accessibility hooks.
//!
//! A platform-agnostic [`EyeSession`] trait is implemented once per OS
//! behind `#[cfg(target_os = …)]`. [`spawn`] picks the right impl at
//! runtime and drives the detect → diff → brain → emit loop on a
//! dedicated thread.

pub mod detector;
pub mod differ;

#[cfg(target_os = "windows")]
pub mod windows;
#[cfg(target_os = "windows")]
pub use self::windows as platform;

#[cfg(target_os = "macos")]
pub mod macos;
#[cfg(target_os = "macos")]
pub use self::macos as platform;

#[cfg(target_os = "linux")]
pub mod linux;
#[cfg(target_os = "linux")]
pub use self::linux as platform;

use std::sync::Arc;
use std::time::Duration;

use parking_lot::RwLock;
use tauri::{AppHandle, Emitter};
use tracing::{debug, info, warn};

use crate::brain::Brain;
use crate::face::Overlay;
use crate::model::{FocusContext, Rect, Suggestion, UserProfile};

/// Wiring passed into the Eyes thread.
pub struct Wiring {
    pub app: AppHandle,
    pub brain: Arc<Brain>,
    pub profile: Arc<RwLock<UserProfile>>,
    pub overlay: Arc<Overlay>,
}

/// A captured snapshot of the focused text element.
#[derive(Debug, Clone, Default)]
pub struct TextSnapshot {
    pub text: String,
    pub caret_char_offset: Option<usize>,
    pub caret_rect: Option<Rect>,
    pub element_bounds: Option<Rect>,
}

/// Trait each OS backend implements.
pub trait EyeSession: Send {
    /// Run until cancelled. Called on its own OS thread.
    fn run(self: Box<Self>, emit: Box<dyn FnMut(EyeEvent) + Send>);
}

#[derive(Debug, Clone)]
pub enum EyeEvent {
    FocusChanged(FocusContext),
    TextChanged(TextSnapshot),
    FocusLost,
}

/// Spawn the platform backend in its own thread.
pub fn spawn(wiring: Wiring) {
    #[cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]
    {
        let w = wiring;
        std::thread::Builder::new()
            .name("lexis-eye".into())
            .spawn(move || {
                if let Err(e) = run_eye_loop(w) {
                    warn!("Eye loop exited: {e:?}");
                }
            })
            .expect("failed to spawn lexis-eye thread");
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        tracing::warn!("Eye backend unavailable on this target");
    }
}

#[cfg(any(target_os = "windows", target_os = "macos", target_os = "linux"))]
fn run_eye_loop(w: Wiring) -> anyhow::Result<()> {
    info!("starting eye loop");
    let session = platform::start_session()?;
    let (tx, rx) = crossbeam_channel::unbounded::<EyeEvent>();
    let tx_run = tx.clone();

    // Run session on another thread so we can drain events here.
    std::thread::Builder::new()
        .name("lexis-eye-native".into())
        .spawn(move || {
            let emit: Box<dyn FnMut(EyeEvent) + Send> =
                Box::new(move |ev| {
                    let _ = tx_run.send(ev);
                });
            session.run(emit);
        })?;

    let mut current_ctx = FocusContext::default();
    let mut last_text = String::new();
    let mut pending: Option<TextSnapshot> = None;
    let debounce = Duration::from_millis(250);

    loop {
        let wait = if pending.is_some() {
            debounce
        } else {
            Duration::from_secs(60)
        };
        let recv_result = rx.recv_timeout(wait);

        match recv_result {
            Ok(ev) => match ev {
                EyeEvent::FocusChanged(ctx) => {
                    debug!("focus changed: {:?}", ctx.process_name);
                    if !ctx.is_prompt_field {
                        w.overlay.hide_all().ok();
                    }
                    current_ctx = ctx;
                    last_text.clear();
                    pending = None;
                }
                EyeEvent::TextChanged(snap) => {
                    pending = Some(snap);
                }
                EyeEvent::FocusLost => {
                    w.overlay.hide_all().ok();
                    current_ctx = FocusContext::default();
                    last_text.clear();
                    pending = None;
                }
            },
            Err(crossbeam_channel::RecvTimeoutError::Timeout) => {
                // Debounce fire.
                if let Some(snap) = pending.take() {
                    if snap.text == last_text {
                        continue;
                    }
                    last_text = snap.text.clone();

                    let mut ctx = current_ctx.clone();
                    ctx.caret_rect = snap.caret_rect;

                    let suggestions = w.brain.analyze(&snap.text, &ctx);
                    emit_suggestions(&w.app, &w.overlay, suggestions, &ctx);
                }
            }
            Err(crossbeam_channel::RecvTimeoutError::Disconnected) => {
                warn!("eye native thread disconnected");
                break Ok(());
            }
        }
    }
}

fn emit_suggestions(
    app: &AppHandle,
    overlay: &Arc<Overlay>,
    mut suggestions: Vec<Suggestion>,
    ctx: &FocusContext,
) {
    // Attach the caret rect as a best-effort anchor. A real impl will
    // compute per-phrase bounds via UIA text ranges; here we fall back
    // to the caret.
    for s in &mut suggestions {
        if s.rect.is_none() {
            s.rect = ctx.caret_rect;
        }
    }

    if suggestions.is_empty() {
        app.emit("lexis://suggestions-cleared", ()).ok();
        return;
    }

    if let Err(e) = overlay.show() {
        warn!("overlay show failed: {e:?}");
    }
    if let Err(e) = app.emit("lexis://suggestions", &suggestions) {
        warn!("failed to emit suggestions: {e:?}");
    }
}
