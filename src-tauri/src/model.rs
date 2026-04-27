//! Shared data structures passed across Rust modules and over Tauri IPC.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Categories visible on suggestion cards — map to the colour keys in
/// `tailwind.config.js`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Category {
    Component,
    Pattern,
    Style,
    Motion,
    Architecture,
    ImageGen,
    Other,
}

impl Category {
    pub fn from_str_lossy(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "component" => Self::Component,
            "pattern" | "layout" | "layout-pattern" => Self::Pattern,
            "style" | "design-style" => Self::Style,
            "motion" | "animation" => Self::Motion,
            "architecture" => Self::Architecture,
            "image-gen" | "image" => Self::ImageGen,
            _ => Self::Other,
        }
    }
}

/// Pixel rect in screen coordinates.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// The minimum context about the focused element we persist while
/// the user is typing. Stored by The Eyes, consumed by The Hands.
#[derive(Debug, Clone, Default)]
pub struct FocusContext {
    pub process_name: String,
    pub window_title: String,
    pub app_bundle: String,
    pub url: Option<String>,
    pub is_prompt_field: bool,
    pub caret_rect: Option<Rect>,
}

/// A single suggestion emitted from the Brain to the Face.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Suggestion {
    pub id: String,
    pub term_id: String,
    pub canonical: String,
    pub category: Category,
    pub definition: String,
    pub replacement: String,
    pub original_text: String,
    pub original_span: (usize, usize),
    pub confidence: f32,
    pub animation_asset: Option<String>,
    pub live_preview_id: Option<String>,
    pub rect: Option<Rect>,
}

/// Persisted user preferences (see `Idea.md` §6.7).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfile {
    pub role: String,
    pub experience: String,
    pub frameworks: Frameworks,
    pub aesthetic_preference: String,
    pub active_packs: Vec<String>,
    pub whitelisted_apps: Vec<WhitelistedApp>,
    pub suggestion_threshold: f32,
    pub auto_accept_threshold: Option<f32>,
    pub show_animations: bool,
    pub expand_delay_ms: u32,
    pub theme: String,
    #[serde(skip)]
    pub storage_path: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Frameworks {
    pub frontend: String,
    pub styling: String,
    pub animation: String,
    pub design_system: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhitelistedApp {
    pub name: String,
    pub process: String,
    pub url: Option<String>,
}

impl UserProfile {
    pub fn load_or_default(app_data_dir: PathBuf) -> Self {
        let path = app_data_dir.join("profile.json");
        if let Ok(bytes) = std::fs::read(&path) {
            if let Ok(mut p) = serde_json::from_slice::<Self>(&bytes) {
                p.storage_path = path;
                return p;
            }
        }
        let mut default = Self::default();
        default.storage_path = path;
        default
    }

    pub fn save(&self) -> std::io::Result<()> {
        if let Some(parent) = self.storage_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&self.storage_path, serde_json::to_vec_pretty(self).unwrap())
    }
}

impl Default for UserProfile {
    fn default() -> Self {
        Self {
            role: "frontend_developer".into(),
            experience: "intermediate".into(),
            frameworks: Frameworks {
                frontend: "react".into(),
                styling: "tailwind".into(),
                animation: "framer-motion".into(),
                design_system: "shadcn".into(),
            },
            aesthetic_preference: "minimal_modern".into(),
            active_packs: vec![
                "ui-components".into(),
                "layout-patterns".into(),
                "design-styles".into(),
                "animation-terms".into(),
            ],
            whitelisted_apps: default_whitelist(),
            suggestion_threshold: 0.65,
            auto_accept_threshold: None,
            show_animations: true,
            expand_delay_ms: 800,
            theme: "dark".into(),
            storage_path: PathBuf::new(),
        }
    }
}

fn default_whitelist() -> Vec<WhitelistedApp> {
    vec![
        WhitelistedApp {
            name: "Cursor".into(),
            process: "Cursor.exe".into(),
            url: None,
        },
        WhitelistedApp {
            name: "VS Code".into(),
            process: "Code.exe".into(),
            url: None,
        },
        WhitelistedApp {
            name: "ChatGPT".into(),
            process: "chrome.exe".into(),
            url: Some("chat.openai.com".into()),
        },
        WhitelistedApp {
            name: "Claude".into(),
            process: "chrome.exe".into(),
            url: Some("claude.ai".into()),
        },
        WhitelistedApp {
            name: "v0".into(),
            process: "chrome.exe".into(),
            url: Some("v0.dev".into()),
        },
    ]
}

