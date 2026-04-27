//! Tauri `#[command]` surface — the only Rust code exposed to the
//! React overlay via `invoke(...)`.
//!
//! Keep this thin: commands should dispatch to the organ responsible
//! for the work and return plain `Result<T, String>`.

use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use tracing::warn;

use crate::db::learning::Action;
use crate::model::{FocusContext, Rect, Suggestion, UserProfile};
use crate::AppState;

#[derive(Debug, Clone, Deserialize)]
pub struct AnalyzeRequest {
    pub text: String,
    #[serde(default)]
    pub app: Option<String>,
    #[serde(default)]
    pub url: Option<String>,
}

/// Direct text analysis — primarily for the settings "try it" box and
/// for tests. The live flow runs through [`crate::eye`] without going
/// through this command.
#[tauri::command]
pub fn analyze_text(state: State<AppState>, req: AnalyzeRequest) -> Vec<Suggestion> {
    let ctx = FocusContext {
        process_name: req.app.clone().unwrap_or_default(),
        window_title: String::new(),
        app_bundle: String::new(),
        url: req.url.clone(),
        is_prompt_field: true,
        caret_rect: None,
    };
    state.brain.analyze(&req.text, &ctx)
}

#[derive(Debug, Clone, Deserialize)]
pub struct AcceptRequest {
    pub suggestion: Suggestion,
}

#[tauri::command]
pub fn accept_suggestion(state: State<AppState>, req: AcceptRequest) -> Result<(), String> {
    let s = &req.suggestion;
    state
        .hands
        .apply(s)
        .map_err(|e| e.to_string())?;
    let category = category_key(s.category);
    state
        .db
        .log_interaction(
            &s.term_id,
            category,
            Action::Accepted,
            &s.original_text,
            Some(&s.replacement),
            None,
        )
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn category_key(c: crate::model::Category) -> &'static str {
    match c {
        crate::model::Category::Component => "component",
        crate::model::Category::Pattern => "pattern",
        crate::model::Category::Style => "style",
        crate::model::Category::Motion => "motion",
        crate::model::Category::Architecture => "architecture",
        crate::model::Category::ImageGen => "image_gen",
        crate::model::Category::Other => "other",
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct DismissRequest {
    pub term_id: String,
    pub original_text: String,
    #[serde(default)]
    pub reason: Option<String>,
}

#[tauri::command]
pub fn dismiss_suggestion(state: State<AppState>, req: DismissRequest) -> Result<(), String> {
    let category = state
        .db
        .get_term(&req.term_id)
        .ok()
        .flatten()
        .map(|t| t.domain)
        .unwrap_or_else(|| "other".to_string());
    state
        .db
        .log_interaction(
            &req.term_id,
            &category,
            Action::Dismissed,
            &req.original_text,
            None,
            req.reason.as_deref(),
        )
        .map_err(|e| e.to_string())
}

#[derive(Debug, Clone, Deserialize)]
pub struct ClickThroughRequest {
    pub enable: bool,
}

/// Called from React when the overlay card shows/hides — we flip
/// `ignore_cursor_events` on the overlay window so the user can
/// interact with the card.
#[tauri::command]
pub fn set_click_through(
    app: tauri::AppHandle,
    req: ClickThroughRequest,
) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("overlay") {
        w.set_ignore_cursor_events(req.enable)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Debug, Clone, Deserialize)]
pub struct ReportRectsRequest {
    pub rects: Vec<Rect>,
}

/// React reports the on-screen rects of every currently-interactive UI
/// element. Rust uses the list to toggle click-through.
#[tauri::command]
pub fn report_ui_rects(
    state: State<AppState>,
    req: ReportRectsRequest,
) -> Result<(), String> {
    state
        .overlay
        .set_ui_rects(req.rects)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_profile(state: State<AppState>) -> UserProfile {
    state.profile.read().clone()
}

#[tauri::command]
pub fn update_profile(state: State<AppState>, profile: UserProfile) -> Result<(), String> {
    let mut p = profile;
    // Preserve the storage path (not serialised).
    p.storage_path = state.profile.read().storage_path.clone();
    if let Err(e) = p.save() {
        warn!("profile save failed: {e:?}");
    }
    *state.profile.write() = p;
    Ok(())
}

#[derive(Debug, Clone, Serialize)]
pub struct PackSummary {
    pub id: String,
    pub name: String,
    pub version: String,
    pub term_count: i64,
}

#[tauri::command]
pub fn list_packs(state: State<AppState>) -> Result<Vec<PackSummary>, String> {
    let rows = state.db.list_pack_ids().map_err(|e| e.to_string())?;
    Ok(rows
        .into_iter()
        .map(|(id, name, version, term_count)| PackSummary {
            id,
            name,
            version,
            term_count,
        })
        .collect())
}

#[tauri::command]
pub fn term_details(state: State<AppState>, term_id: String) -> Result<Option<Suggestion>, String> {
    match state.db.get_term(&term_id).map_err(|e| e.to_string())? {
        Some(t) => Ok(Some(Suggestion {
            id: format!("preview::{term_id}"),
            term_id: t.id.clone(),
            canonical: t.canonical_name.clone(),
            category: crate::model::Category::from_str_lossy(&t.domain),
            definition: t.description.clone(),
            replacement: if t.replacement.is_empty() {
                t.canonical_name.clone()
            } else {
                t.replacement.clone()
            },
            original_text: String::new(),
            original_span: (0, 0),
            confidence: 1.0,
            animation_asset: t.animation_asset,
            live_preview_id: t.live_preview_id,
            rect: None,
        })),
        None => Ok(None),
    }
}
