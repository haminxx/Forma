import { lazy, type ComponentType } from "react";

/**
 * Maps `term.live_preview_id` → a lazy-loaded local React component
 * that renders an interactive 21st.dev-style demo for that term.
 *
 * Add new entries by dropping a file into `src/previews/<id>.tsx` and
 * registering it below. A Vite `import.meta.glob` alternative could
 * auto-discover, but an explicit registry keeps bundle splitting
 * predictable.
 */
const registry: Record<string, () => Promise<{ default: ComponentType }>> = {
  popover: () => import("@/previews/popover"),
  "glass-popover": () => import("@/previews/glass-popover"),
  drawer: () => import("@/previews/drawer"),
  masonry: () => import("@/previews/masonry"),
};

export function loadPreview(id: string): ComponentType | null {
  const entry = registry[id];
  if (!entry) return null;
  return lazy(entry);
}

export function hasLivePreview(id: string | null | undefined): boolean {
  if (!id) return false;
  return id in registry;
}
