import type { Rect } from "./types";

/**
 * Decide a top-left position anchored below a caret/element rect,
 * flipping above / shifting inward when we'd clip the viewport.
 */
export function anchorBelow(
  rect: Rect | null,
  size: { width: number; height: number },
): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;

  if (!rect) {
    return {
      x: Math.max(margin, vw / 2 - size.width / 2),
      y: Math.max(margin, vh / 2 - size.height / 2),
    };
  }

  let x = rect.x;
  let y = rect.y + rect.height + margin;

  if (x + size.width > vw - margin) {
    x = Math.max(margin, vw - size.width - margin);
  }
  if (y + size.height > vh - margin) {
    y = Math.max(margin, rect.y - size.height - margin);
  }
  return { x, y };
}
