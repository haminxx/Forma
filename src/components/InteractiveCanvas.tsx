import { useEffect, useRef } from "react";

/**
 * Cursor-reactive dot grid with vector lines from each dot toward the mouse.
 * Mirrors the user's reference snippet (gridWidth/Height = 120, multiplier
 * = 200) but with three surgical fixes versus the raw paste:
 *   - Positioned `absolute` so the canvas stays scoped to its parent
 *     section (the original `fixed` covers the viewport).
 *   - Resize uses `setTransform` instead of cumulative `ctx.scale` (the
 *     original compounded DPR on every resize).
 *   - The pasted code attaches a `circleMethod` to `ctx` via `(ctx as any)`;
 *     we inline a typed `drawCircle` instead.
 *
 * The colour-inversion-on-cursor effect is provided by `mix-blend-mode:
 * difference` on the canvas: bright dots become "the inverse colour of
 * whatever is beneath them" — text turns black under white dots, gold
 * pixels turn dark blue, and the dark site bg lifts to a near-white dot.
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
}

type Dot = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  size?: number;
  angle?: number;
};

export function InteractiveCanvas({
  // Pure-white dots so `mix-blend-mode: difference` produces a clean
  // inversion against text, gold pixels, and the dark bg alike.
  gridWidth = 120,
  gridHeight = 120,
  dotColor = "#ffffff",
  lineColor = "rgba(255, 255, 255, 0.16)",
  backgroundColor = "transparent",
  padding = 0,
  maxDistance = 2,
  dotSizeMultiplier = 200,
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;

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
      mouseRef.current.x = (e.clientX - rect.left) * ratio;
      mouseRef.current.y = (e.clientY - rect.top) * ratio;
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
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const getDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getAngle = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dX = b.x - a.x;
      const dY = b.y - a.y;
      return (Math.atan2(dY, dX) / Math.PI) * 180;
    };

    const getVector = (dot: Dot) => {
      const d = getDistance(dot, mouseRef.current);
      let size = (dotSizeMultiplier - d) / 20;
      if (size < 1) size = 1;
      dot.size = size;
      dot.angle = getAngle(dot, mouseRef.current);

      const distance = d > maxDistance ? maxDistance : d;
      return {
        x: distance * Math.cos((dot.angle * Math.PI) / 180),
        y: distance * Math.sin((dot.angle * Math.PI) / 180),
      };
    };

    const drawCircle = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.closePath();
    };

    let raf = 0;
    const animate = () => {
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = dotColor;

      // Lines from each dot toward the mouse-warped target.
      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i];
        if (!dot) continue;
        const v = getVector(dot);

        ctx.beginPath();
        ctx.moveTo(dot.x / ratio, dot.y / ratio);
        ctx.lineTo((dot.x + v.x) / ratio, (dot.y + v.y) / ratio);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
      }

      // Dots themselves.
      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i];
        if (!dot) continue;
        const v = getVector(dot);
        drawCircle(
          (dot.x + v.x) / ratio,
          (dot.y + v.y) / ratio,
          (dot.size ?? 1) / 2,
        );
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
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
