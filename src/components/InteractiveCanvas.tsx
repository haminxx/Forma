import { useEffect, useRef } from "react";

/**
 * Cursor-reactive dot grid with vector lines from each dot toward the mouse.
 * Dots use `mix-blend-mode: difference` so bright areas invert colours beneath.
 *
 * Performance: capped DPR (≤1.5), smaller grid (90×90), IntersectionObserver
 * pauses the animation loop offscreen, mouse position synced once per frame,
 * single pass computes distance + vector once per dot, alpha bucketing, lines
 * only near the cursor.
 */
interface InteractiveCanvasProps {
  gridWidth?: number;
  gridHeight?: number;
  dotColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  padding?: number;
  maxDistance?: number;
  dotSizeMultiplier?: number;
  /** Cursor influence radius in CSS pixels (distance-based dot opacity). */
  influenceRadius?: number;
}

type Dot = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  size: number;
  /** Offset toward cursor this frame (device pixels). */
  vx: number;
  vy: number;
};

const CAP_DPR = 1.5;
// Higher base alpha so the dot field reads as evenly filled across the
// whole section — including the top area above the heading — instead of
// fading into the bg where the cursor isn't. ALPHA_RANGE still gives the
// cursor neighbourhood a brighter halo on top.
const BASE_ALPHA = 0.78;
const ALPHA_RANGE = 0.22;

const BUCKET_EDGES = [0.82, 0.9, 0.96] as const;

function bucketIndexForAlpha(a: number): number {
  if (a < BUCKET_EDGES[0]) return 0;
  if (a < BUCKET_EDGES[1]) return 1;
  if (a < BUCKET_EDGES[2]) return 2;
  return 3;
}

function bucketAlphaValue(bucket: number): number {
  switch (bucket) {
    case 0:
      return 0.78;
    case 1:
      return 0.86;
    case 2:
      return 0.92;
    default:
      return 1;
  }
}

export function InteractiveCanvas({
  gridWidth = 90,
  gridHeight = 90,
  dotColor = "#ffffff",
  lineColor = "rgba(255, 255, 255, 0.16)",
  backgroundColor = "transparent",
  padding = 0,
  maxDistance = 2,
  dotSizeMultiplier = 200,
  influenceRadius = 220,
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pendingMouseRef = useRef({ x: 0, y: 0 });
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
            ox: x * ratio,
            oy: y * ratio,
            size: 1,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const drawCircle = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.closePath();
    };

    const buckets: Dot[][] = [[], [], [], []];

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

      for (let b = 0; b < 4; b++) buckets[b].length = 0;

      // One pass: distance + vector once per dot; stroke lines in radius; bucket fills.
      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i];
        if (!dot) continue;

        const dX = dot.x - mx;
        const dY = dot.y - my;
        const d = Math.sqrt(dX * dX + dY * dY);

        let size = (dotSizeMultiplier - d) / 20;
        if (size < 1) size = 1;
        dot.size = size;

        const angleRad = Math.atan2(my - dot.y, mx - dot.x);
        const distance = d > maxDistance ? maxDistance : d;
        dot.vx = distance * Math.cos(angleRad);
        dot.vy = distance * Math.sin(angleRad);

        if (d <= influenceCanvas) {
          ctx.beginPath();
          ctx.moveTo(dot.x / ratio, dot.y / ratio);
          ctx.lineTo((dot.x + dot.vx) / ratio, (dot.y + dot.vy) / ratio);
          ctx.strokeStyle = lineColor;
          ctx.globalAlpha = BASE_ALPHA + ALPHA_RANGE * (1 - Math.min(1, d / influenceCanvas));
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.closePath();
        }

        const t = Math.min(1, d / influenceCanvas);
        const alpha = BASE_ALPHA + ALPHA_RANGE * (1 - t);
        const bi = bucketIndexForAlpha(alpha);
        const list = buckets[bi];
        if (list) list.push(dot);
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = dotColor;

      for (let bi = 0; bi < 4; bi++) {
        const list = buckets[bi];
        if (!list?.length) continue;
        ctx.globalAlpha = bucketAlphaValue(bi);
        for (let j = 0; j < list.length; j++) {
          const dot = list[j];
          if (!dot) continue;
          drawCircle(
            (dot.x + dot.vx) / ratio,
            (dot.y + dot.vy) / ratio,
            dot.size / 2,
          );
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

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
      if (raf) cancelAnimationFrame(raf);
    };
  }, [
    gridWidth,
    gridHeight,
    dotColor,
    lineColor,
    backgroundColor,
    padding,
    maxDistance,
    dotSizeMultiplier,
    influenceRadius,
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
