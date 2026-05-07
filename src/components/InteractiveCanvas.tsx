import { useEffect, useRef } from "react";

/**
 * Cursor-reactive dot+line halo. The OLD animation: each dot in a sparse
 * grid draws a short line toward the mouse, dot size scales with distance.
 *
 * Differences from earlier revisions:
 *   - Dots/lines are only RENDERED inside `influenceRadius` of the cursor
 *     (no global dot field across the page).
 *   - Default colour is the brand gold so the halo reads like the wave's
 *     pixels following the cursor — `mix-blend-mode: difference` is gone.
 *   - No white spotlight halo behind the cursor.
 *
 * Performance: capped DPR (≤1.5), IntersectionObserver pauses offscreen,
 * mouse position synced once per frame. Grid kept dense enough that the
 * halo always has a few dozen dots inside the radius.
 */
interface InteractiveCanvasProps {
  gridWidth?: number;
  gridHeight?: number;
  dotColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  padding?: number;
  /** Cursor influence radius in CSS pixels (controls dot size + render gating). */
  influenceRadius?: number;
  /** Min/max dot radius in CSS pixels — far edge of halo vs near-cursor dots. */
  minRadius?: number;
  maxRadius?: number;
}

type Dot = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
};

const CAP_DPR = 1.5;

export function InteractiveCanvas({
  gridWidth = 90,
  gridHeight = 90,
  dotColor = "#d4b87a",
  lineColor = "rgba(212, 184, 122, 0.75)",
  backgroundColor = "transparent",
  padding = 0,
  influenceRadius = 220,
  minRadius = 0.5,
  maxRadius = 2.2,
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const pendingMouseRef = useRef({ x: -9999, y: -9999 });
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const ratio = Math.min(window.devicePixelRatio || 1, CAP_DPR);
    const influenceCanvas = influenceRadius * ratio;

    let visible = true;
    let raf = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? window.innerHeight;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      createDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pendingMouseRef.current = {
        x: (e.clientX - rect.left) * ratio,
        y: (e.clientY - rect.top) * ratio,
      };
    };

    const handleMouseLeave = () => {
      pendingMouseRef.current = { x: -9999, y: -9999 };
    };

    const createDots = () => {
      dotsRef.current = [];
      const w = canvas.width / ratio;
      const h = canvas.height / ratio;

      for (let i = 0; i < gridWidth; i++) {
        const x = Math.floor(((w - padding * 2) / (gridWidth - 1)) * i + padding);

        for (let j = 0; j < gridHeight; j++) {
          const y = Math.floor(((h - padding * 2) / (gridHeight - 1)) * j + padding);

          dotsRef.current.push({
            x: x * ratio,
            y: y * ratio,
            r: minRadius,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      if (!visible) {
        raf = 0;
        return;
      }

      mouseRef.current = pendingMouseRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Cursor outside the canvas: nothing to draw.
      if (mx < 0 && my < 0) {
        raf = requestAnimationFrame(animate);
        return;
      }

      const dots = dotsRef.current;
      const radiusRange = maxRadius - minRadius;
      const inHalo: Dot[] = [];

      // Pass 1 — find dots in halo, compute size + line endpoint, stroke lines.
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;

        const dX = dot.x - mx;
        const dY = dot.y - my;
        const d = Math.sqrt(dX * dX + dY * dY);
        if (d > influenceCanvas) continue;

        const t = 1 - d / influenceCanvas;
        const pullCanvas = Math.min(d, 4 * ratio) * t;
        const angle = Math.atan2(my - dot.y, mx - dot.x);
        dot.vx = pullCanvas * Math.cos(angle);
        dot.vy = pullCanvas * Math.sin(angle);
        dot.r = minRadius + radiusRange * t;

        ctx.beginPath();
        ctx.moveTo(dot.x / ratio, dot.y / ratio);
        ctx.lineTo((dot.x + dot.vx) / ratio, (dot.y + dot.vy) / ratio);
        ctx.stroke();

        inHalo.push(dot);
      }

      // Pass 2 — fill all in-halo dots in one batched path, gold colour.
      if (inHalo.length) {
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        for (let i = 0; i < inHalo.length; i++) {
          const dot = inHalo[i];
          if (!dot) continue;
          const cxCss = (dot.x + dot.vx) / ratio;
          const cyCss = (dot.y + dot.vy) / ratio;
          ctx.moveTo(cxCss + dot.r, cyCss);
          ctx.arc(cxCss, cyCss, dot.r, 0, 2 * Math.PI, false);
        }
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (visible && !raf) {
          raf = requestAnimationFrame(animate);
        }
      },
      { root: null, threshold: 0, rootMargin: "80px" },
    );
    io.observe(canvas);

    if (visible) raf = requestAnimationFrame(animate);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [
    gridWidth,
    gridHeight,
    dotColor,
    lineColor,
    backgroundColor,
    padding,
    influenceRadius,
    minRadius,
    maxRadius,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
