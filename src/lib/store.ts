import { create } from "zustand";
import type { OverlayLevel, Rect, Suggestion } from "./types";

export interface LexisState {
  suggestions: Suggestion[];
  activeId: string | null;
  level: OverlayLevel;

  receiveSuggestions: (s: Suggestion[]) => void;
  clear: () => void;
  setLevel: (l: OverlayLevel) => void;
  setActive: (id: string | null) => void;
  trackRect: (id: string, rect: DOMRect | null) => void;
}

const interactiveRects = new Map<string, DOMRect>();

/**
 * Hook installed by ipc.ts at startup. We keep it pluggable so the
 * store stays free of Tauri-specific imports (helps unit tests and
 * Storybook).
 */
export type RectReporter = (rects: Rect[]) => void;
let rectReporter: RectReporter = () => {};

export function installRectReporter(fn: RectReporter) {
  rectReporter = fn;
}

function publishRects() {
  const rects = Array.from(interactiveRects.values()).map((r) => ({
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
  }));
  try {
    rectReporter(rects);
  } catch {
    /* suppress */
  }
}

export const useLexisStore = create<LexisState>((set) => ({
  suggestions: [],
  activeId: null,
  level: "hidden",

  receiveSuggestions: (s) =>
    set({
      suggestions: s,
      activeId: s[0]?.id ?? null,
      level: s.length ? "dot" : "hidden",
    }),

  clear: () => {
    interactiveRects.clear();
    publishRects();
    set({ suggestions: [], activeId: null, level: "hidden" });
  },

  setLevel: (level) => set({ level }),
  setActive: (id) => set({ activeId: id }),

  trackRect: (id, rect) => {
    if (rect) interactiveRects.set(id, rect);
    else interactiveRects.delete(id);
    publishRects();
  },
}));
