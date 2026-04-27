//! Lexis backend library.
//!
//! The four organs:
//!
//! * [`eye`]   — OS accessibility hooks. Watches focus, reads text, reports caret rects.
//! * [`brain`] — segmentation, phrase extraction, matching, scoring.
//! * [`face`]  — overlay window lifecycle and click-through hit-test.
//! * [`hands`] — text replacement via clipboard + keystroke simulation.
//!
//! They are wired together by [`AppState`] in this crate root, with Tauri
//! commands living in [`commands`].

pub mod brain;
pub mod commands;
pub mod db;
pub mod eye;
pub mod face;
pub mod hands;
pub mod model;

use std::sync::Arc;

use parking_lot::RwLock;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tracing::{info, warn};

use crate::brain::Brain;
use crate::db::Db;
use crate::face::Overlay;
use crate::hands::Hands;
use crate::model::UserProfile;

/// The shared application state handed to every Tauri command.
pub struct AppState {
    pub db: Arc<Db>,
    pub brain: Arc<Brain>,
    pub hands: Arc<Hands>,
    pub overlay: Arc<Overlay>,
    pub profile: Arc<RwLock<UserProfile>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,lexis_lib=debug".into()),
        )
        .init();

    info!("Starting Lexis");

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // --- DB bootstrap -------------------------------------------------
            let db_path = app
                .path()
                .app_data_dir()
                .expect("no app data dir")
                .join("lexis.db");
            std::fs::create_dir_all(db_path.parent().unwrap()).ok();
            let db = Arc::new(Db::open(&db_path).expect("failed to open database"));
            db.migrate().expect("migration failed");

            // Seed bundled packs on first run.
            let packs_dir = app
                .path()
                .resource_dir()
                .expect("no resource dir")
                .join("packs");
            if packs_dir.exists() {
                if let Err(e) = db.seed_packs(&packs_dir) {
                    warn!("pack seeding failed: {e:?}");
                }
            }

            // --- Profile ------------------------------------------------------
            let profile = Arc::new(RwLock::new(
                UserProfile::load_or_default(app.path().app_data_dir().unwrap()),
            ));

            // --- Brain --------------------------------------------------------
            let brain = Arc::new(Brain::new(db.clone()));

            // --- Hands --------------------------------------------------------
            let hands = Arc::new(Hands::new());

            // --- Overlay ------------------------------------------------------
            let overlay = Arc::new(Overlay::new(app_handle.clone()));
            overlay.prepare().ok();

            // --- System tray --------------------------------------------------
            let tray_menu = build_tray_menu(app)?;
            let mut tray_builder = TrayIconBuilder::with_id("lexis-tray")
                .tooltip("Lexis — listening")
                .menu(&tray_menu);
            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }
            let _tray = tray_builder
                .on_menu_event({
                    let handle = app_handle.clone();
                    move |_app, event| match event.id.as_ref() {
                        "open-settings" => {
                            if let Some(w) = handle.get_webview_window("settings") {
                                w.show().ok();
                                w.set_focus().ok();
                            }
                        }
                        "quit" => handle.exit(0),
                        _ => {}
                    }
                })
                .on_tray_icon_event(|_tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        // Later: toggle panel.
                    }
                })
                .build(app)?;

            // --- Shared state -------------------------------------------------
            app.manage(AppState {
                db: db.clone(),
                brain: brain.clone(),
                hands: hands.clone(),
                overlay: overlay.clone(),
                profile: profile.clone(),
            });

            // --- The Eyes (spawn on its own thread/runtime) -------------------
            eye::spawn(eye::Wiring {
                app: app_handle.clone(),
                brain: brain.clone(),
                profile: profile.clone(),
                overlay: overlay.clone(),
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Settings window: just hide.
                if window.label() == "settings" {
                    window.hide().ok();
                    api.prevent_close();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::analyze_text,
            commands::accept_suggestion,
            commands::dismiss_suggestion,
            commands::set_click_through,
            commands::report_ui_rects,
            commands::get_profile,
            commands::update_profile,
            commands::list_packs,
            commands::term_details,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Lexis");
}

fn build_tray_menu<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<Menu<R>> {
    let open_settings = MenuItem::with_id(app, "open-settings", "Settings…", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Lexis", true, None::<&str>)?;
    Menu::with_items(app, &[&open_settings, &quit])
}
