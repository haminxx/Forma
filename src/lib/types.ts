// Mirror of src-tauri/src/model.rs. Keep in sync.

export type Category =
  | "component"
  | "pattern"
  | "style"
  | "motion"
  | "architecture"
  | "image_gen"
  | "other";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Suggestion {
  id: string;
  term_id: string;
  canonical: string;
  category: Category;
  definition: string;
  replacement: string;
  original_text: string;
  original_span: [number, number];
  confidence: number;
  animation_asset: string | null;
  live_preview_id: string | null;
  rect: Rect | null;
}

export interface UserProfile {
  role: string;
  experience: string;
  frameworks: {
    frontend: string;
    styling: string;
    animation: string;
    design_system: string;
  };
  aesthetic_preference: string;
  active_packs: string[];
  whitelisted_apps: Array<{ name: string; process: string; url: string | null }>;
  suggestion_threshold: number;
  auto_accept_threshold: number | null;
  show_animations: boolean;
  expand_delay_ms: number;
  theme: string;
}

export interface PackSummary {
  id: string;
  name: string;
  version: string;
  term_count: number;
}

export type OverlayLevel = "hidden" | "dot" | "pill" | "card" | "live";
