import { useEffect, useRef } from "react";

/**
 * Cursor-reactive dot grid + radial cursor glow, blended with `difference`.
 *
 * Visual model:
 *   - Dots are ALWAYS full opaque white. The `mix-blend-mode: difference`
 *     filter on the canvas inverts whatever sits beneath, so a dot reads as
 *     dark amber on the gold wave, near-white on the dark page bg, and
 *     black on hovered text. White was the only colour that would invert
 *     consistently in every region.
 *   - The "fade" comes from dot RADIUS, not alpha. Far dots are tiny (~0.4 px),
 *     dots near the cursor swell to ~1.8 px. Lines also only draw inside the
 *     influence radius. Reducing alpha would dampen the difference blend.
 *   - A radial spotlight is also drawn at the cursor in white — under the
 *     difference blend, that creates a "halo of inverted colour" exactly
 *     where the user is pointing.
 *
 * Performance: capped DPR (≤1.5), 90×90 grid by default, IntersectionObserver
 * pauses the loop offscreen, mouse position synced once per frame.
 */
interface InteractiveCanvasProps {
  gridWidth?: number;
  gridHeight?: number;
  dotColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  padding?: number;
  /** Cursor influence radius in CSS pixels (controls dot size + line gating). */
  influenceRadius?: number;
  /** Min/max dot radius in CSS pixels — far dots vs near-cursor dots. */
  minRadius?: number;
  maxRadius?: number;
  /** Radial cursor spotlight — radius + peak alpha (alpha pre-difference). */
  spotlightRadius?: number;
  spotlightAlpha?: number;
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
  dotColor = "#ffffff",
  lineColor = "rgba(255, 255, 255, 0.8)",
  backgroundColor = "transparent",
  padding = 0,
  influenceRadius = 220,
  minRadius = 0.4,
  maxRadius = 1.9,
  spotlightRadius = 180,
  spotlightAlpha = 0.45,
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

      // Spotlight halo at the cursor (drawn in CSS px space).
      if (mx > -1 && my > -1) {
        const cx = mx / ratio;
        const cy = my / ratio;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, spotlightRadius);
        grad.addColorStop(0, `rgba(255,255,255,${spotlightAlpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(
          cx - spotlightRadius,
          cy - spotlightRadius,
          spotlightRadius * 2,
          spotlightRadius * 2,
        );
      }

      const dots = dotsRef.current;
      const radiusRange = maxRadius - minRadius;

      // ── Lines pass (only within influence) ─────────────────────────────
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;

        const dX = dot.x - mx;
        const dY = dot.y - my;
        const d = Math.sqrt(dX * dX + dY * dY);

        if (d <= influenceCanvas) {
          const t = 1 - d / influenceCanvas;
          // pull line endpoint slightly toward cursor for a subtle field effect
          const pullCanvas = Math.min(d, 4 * ratio) * t;
          const angle = Math.atan2(my - dot.y, mx - dot.x);
          dot.vx = pullCanvas * Math.cos(angle);
          dot.vy = pullCanvas * Math.sin(angle);
          dot.r = minRadius + radiusRange * t;

          ctx.beginPath();
          ctx.moveTo(dot.x / ratio, dot.y / ratio);
          ctx.lineTo((dot.x + dot.vx) / ratio, (dot.y + dot.vy) / ratio);
          ctx.stroke();
        } else {
          dot.vx = 0;
          dot.vy = 0;
          dot.r = minRadius;
        }
      }

      // ── Dot pass: full opaque white so `difference` inverts cleanly ───
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;
        const cxCss = (dot.x + dot.vx) / ratio;
        const cyCss = (dot.y + dot.vy) / ratio;
        ctx.moveTo(cxCss + dot.r, cyCss);
        ctx.arc(cxCss, cyCss, dot.r, 0, 2 * Math.PI, false);
      }
      ctx.fill();

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
    spotlightRadius,
    spotlightAlpha,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "difference" }}
    />
  );
}
