import type {
  PackSummary,
  Rect,
  Suggestion,
  UserProfile,
} from "./types";

/**
 * Mock data used when the frontend is rendered outside of Tauri (e.g.
 * the Vercel demo build). The shapes mirror what the Rust backend
 * normally emits over IPC.
 */

/** Where the fake "prompt input" sits in the demo backdrop. The
 *  overlay anchors itself relative to this rect. */
export function demoTargetRect(): Rect {
  if (typeof window === "undefined") {
    return { x: 200, y: 320, width: 520, height: 44 };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(560, vw - 64);
  const height = 48;
  return {
    x: Math.max(32, vw / 2 - width / 2),
    y: Math.min(vh - 220, Math.max(280, vh * 0.55)),
    width,
    height,
  };
}

export function demoSuggestions(): Suggestion[] {
  const rect = demoTargetRect();
  return [
    {
      id: "demo-1",
      term_id: "glass-popover",
      canonical: "Glass popover",
      category: "component",
      definition:
        "A floating contextual surface with a frosted-glass background, anchored to a trigger element.",
      replacement: "glass popover",
      original_text: "blurry transparent box that shows options on hover",
      original_span: [0, 51],
      confidence: 0.92,
      animation_asset: null,
      live_preview_id: "glass-popover",
      rect,
    },
    {
      id: "demo-2",
      term_id: "drawer",
      canonical: "Drawer",
      category: "component",
      definition:
        "A panel that slides in from the edge of the screen, typically used for secondary navigation or filters.",
      replacement: "drawer",
      original_text: "menu that slides in from the right",
      original_span: [0, 34],
      confidence: 0.88,
      animation_asset: null,
      live_preview_id: "drawer",
      rect,
    },
    {
      id: "demo-3",
      term_id: "masonry",
      canonical: "Masonry grid",
      category: "pattern",
      definition:
        "A grid layout where items have variable heights and pack together vertically without uniform rows.",
      replacement: "masonry grid",
      original_text: "Pinterest-style staggered photo wall",
      original_span: [0, 36],
      confidence: 0.81,
      animation_asset: null,
      live_preview_id: "masonry",
      rect,
    },
  ];
}

export const demoProfile: UserProfile = {
  role: "Designer / front-end engineer",
  experience: "intermediate",
  frameworks: {
    frontend: "React",
    styling: "Tailwind CSS",
    animation: "Framer Motion",
    design_system: "shadcn/ui",
  },
  aesthetic_preference: "minimal, glassmorphic",
  active_packs: ["ui-components", "layout-patterns"],
  whitelisted_apps: [
    { name: "ChatGPT", process: "chrome", url: "chat.openai.com" },
    { name: "Claude", process: "chrome", url: "claude.ai" },
    { name: "v0", process: "chrome", url: "v0.dev" },
  ],
  suggestion_threshold: 0.6,
  auto_accept_threshold: null,
  show_animations: true,
  expand_delay_ms: 800,
  theme: "dark",
};

export const demoPacks: PackSummary[] = [
  { id: "ui-components", name: "UI Components", version: "0.1.0", term_count: 142 },
  { id: "layout-patterns", name: "Layout Patterns", version: "0.1.0", term_count: 38 },
  { id: "motion-vocab", name: "Motion Vocabulary", version: "0.1.0", term_count: 56 },
];

/** Crude keyword matcher used by the Settings "Try it" demo. */
export function demoAnalyze(text: string): Suggestion[] {
  const t = text.toLowerCase();
  const all = demoSuggestions();
  const hits: Suggestion[] = [];
  if (/blur|frost|glass|transparent.*(box|panel|popover)/.test(t)) {
    hits.push(all[0]);
  }
  if (/slide.*(in|from)|drawer|side panel/.test(t)) {
    hits.push(all[1]);
  }
  if (/masonry|pinterest|staggered|photo wall|grid/.test(t)) {
    hits.push(all[2]);
  }
  return hits;
}
