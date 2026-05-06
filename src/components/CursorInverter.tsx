import { useEffect, useRef } from "react";

/**
 * Solid white circle that follows the mouse with `mix-blend-mode: difference`,
 * scoped to its absolutely positioned parent. Beneath it: gold pixels, white
 * dots, and white text — all of which invert (gold → blue-purple, white →
 * black, dark bg → light) inside the circle, giving the "cursor inverts the
 * area" effect cleanly without the gaps the dot canvas left.
 *
 * Implementation notes:
 *   - Listens to `pointermove` on `window` and translates a single transform
 *     once per frame via rAF so we don't invalidate paint dozens of times
 *     per move on high-DPI mice.
 *   - Hides itself when the cursor is outside the parent's bounding box, so
 *     it never bleeds into adjacent sections.
 *   - Lives inside an `isolate` parent so the difference blend doesn't leak.
 */
type CursorInverterProps = {
  size?: number;
};

export function CursorInverter({ size = 56 }: CursorInverterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    let pending = false;

    const apply = () => {
      if (!el) return;
      el.style.transform = `translate3d(${pendingX}px, ${pendingY}px, 0)`;
      pending = false;
    };

    const handleMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        if (el.style.opacity !== "0") el.style.opacity = "0";
        return;
      }
      if (el.style.opacity !== "1") el.style.opacity = "1";

      pendingX = e.clientX - rect.left - size / 2;
      pendingY = e.clientY - rect.top - size / 2;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(apply);
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [size]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 rounded-full bg-white opacity-0 transition-opacity duration-150"
      style={{
        width: size,
        height: size,
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    />
  );
}
