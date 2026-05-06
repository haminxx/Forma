import { useEffect, useRef } from "react";

/**
 * Stitch-style breathing, cursor-reactive dot field.
 *
 * Tokens lifted from the designlang extract of stitch.withgoogle.com:
 *   - background  #191a1f  (stitch.bg)
 *   - dot color   #ffffff  (stitch.fg, dimmed via per-dot alpha)
 *   - material    flat (no shadows, no glow)
 *
 * Implementation notes:
 *   - Single full-bleed <canvas>. Resizes on viewport change + DPR.
 *   - Each dot has a base position on a regular grid plus a per-dot phase
 *     used by the breathing curve, so the field looks alive without scrolling.
 *   - Cursor proximity boosts a dot's brightness and radius, falling off
 *     smoothly with distance (Gaussian-ish on squared distance).
 *   - One requestAnimationFrame loop. No React state mutations during draw.
 *   - prefers-reduced-motion → static grid (single paint, no rAF loop).
 *
 * Knobs (kept as constants — no props by design; YAGNI per Karpathy "simplicity
 * first". Add props the day a second caller needs different settings.)
 */

const SPACING = 28;          // px between dot centers
const BASE_RADIUS = 0.9;     // px
const MAX_RADIUS = 2.6;      // px when fully lit by cursor
const BASE_ALPHA = 0.22;     // resting dot alpha
const MAX_ALPHA = 1.0;       // peak under cursor
const BREATH_HZ = 0.18;      // breaths per second (period ≈ 5.5s)
const BREATH_AMP = 0.14;     // alpha amplitude added/subtracted while breathing
const CURSOR_RADIUS_PX = 220; // influence falloff radius
const PARALLAX = 0.04;       // per-dot vertical drift in px·s⁻¹ scaled by phase

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let widthCss = 0;
    let heightCss = 0;

    type Dot = { x: number; y: number; phase: number };
    let dots: Dot[] = [];

    const buildDots = () => {
      dots = [];
      const cols = Math.ceil(widthCss / SPACING) + 2;
      const rows = Math.ceil(heightCss / SPACING) + 2;
      const offsetX = (widthCss - (cols - 1) * SPACING) / 2;
      const offsetY = (heightCss - (rows - 1) * SPACING) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: offsetX + c * SPACING,
            y: offsetY + r * SPACING,
            // Deterministic-ish phase so neighbors don't pulse in lockstep.
            phase: ((c * 37 + r * 91) % 360) * (Math.PI / 180),
          });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      widthCss = window.innerWidth;
      heightCss = window.innerHeight;
      canvas.width = Math.floor(widthCss * dpr);
      canvas.height = Math.floor(heightCss * dpr);
      canvas.style.width = `${widthCss}px`;
      canvas.style.height = `${heightCss}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    };

    let mouseX = -10000;
    let mouseY = -10000;
    const handleMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    const handleLeave = () => {
      mouseX = -10000;
      mouseY = -10000;
    };
    const handleTouch = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      mouseX = t.clientX;
      mouseY = t.clientY;
    };

    const cursorRadiusSq = CURSOR_RADIUS_PX * CURSOR_RADIUS_PX;

    const draw = (tMs: number) => {
      const tSec = tMs / 1000;

      ctx.fillStyle = "#191a1f";
      ctx.fillRect(0, 0, widthCss, heightCss);

      const breathTwoPi = BREATH_HZ * 2 * Math.PI;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]!;

        const breath = Math.sin(tSec * breathTwoPi + d.phase);
        const driftY = reduceMotion ? 0 : Math.sin(tSec * 0.4 + d.phase) * PARALLAX * SPACING;

        const dx = d.x - mouseX;
        const dy = d.y + driftY - mouseY;
        const distSq = dx * dx + dy * dy;
        const proximity =
          distSq >= cursorRadiusSq ? 0 : 1 - distSq / cursorRadiusSq;

        const alpha =
          BASE_ALPHA + breath * BREATH_AMP + proximity * (MAX_ALPHA - BASE_ALPHA);
        const radius = BASE_RADIUS + proximity * (MAX_RADIUS - BASE_RADIUS);

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.arc(d.x, d.y + driftY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = (tMs: number) => {
      draw(tMs);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("touchmove", handleTouch, { passive: true });

    if (reduceMotion) {
      // Single static frame; no loop.
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("touchmove", handleTouch);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
