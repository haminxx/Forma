import { useEffect, useRef } from "react";

/**
 * Cheap animated gold "pixel wave" that fills the bottom half of its parent.
 *
 * Each frame we walk every column once, evaluate a 2-octave sine wave for
 * the wave crest at that column, and fill pixel squares only from the crest
 * downwards. Anything above the crest is `clearRect`'d implicitly (we skip
 * those rows entirely). On a 1920×1080 viewport that's ≈ 192 columns × ~50
 * rows = ~9 600 fillRect calls per frame — well under what 60 fps allows.
 *
 * Pairs with `<CursorInverter>` mounted in the same `isolate` parent: the
 * inverter blends in `difference` against this layer too, so the pixels under
 * the cursor invert from gold to a deep blue, matching the dot/text effect.
 */
type PixelWaveProps = {
  pixelSize?: number;
  color?: string;
};

export function PixelWave({
  pixelSize = 10,
  color = "212, 184, 122", // gold rgb
}: PixelWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? window.innerHeight;
      width = w;
      height = h;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) * 0.001; // seconds

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / pixelSize);
      const baseLine = height * 0.55; // wave centre line

      for (let i = 0; i < cols; i++) {
        const x = i * pixelSize;

        // Two octaves of sine at different speeds and wavelengths.
        const wave =
          Math.sin(x * 0.012 + t * 0.85) * 28 +
          Math.sin(x * 0.028 + t * 0.5) * 14;
        const crest = baseLine + wave;

        // Bright crest band (top 1 row) — denser gold near the crest line.
        const crestRow = Math.floor(crest / pixelSize);
        const yCrest = crestRow * pixelSize;
        if (yCrest >= 0 && yCrest < height) {
          ctx.fillStyle = `rgba(${color}, 0.55)`;
          ctx.fillRect(x, yCrest, pixelSize - 1, pixelSize - 1);
        }

        // Body underneath: alpha falls off with distance from the crest so
        // the wave fades into the page rather than ending in a hard edge.
        const startRow = crestRow + 1;
        const endRow = Math.ceil(height / pixelSize);
        for (let j = startRow; j < endRow; j++) {
          const y = j * pixelSize;
          const depth = (y - crest) / 240;
          const alpha = Math.max(0, 0.32 - depth * 0.32);
          if (alpha < 0.02) break; // nothing left to draw further down
          ctx.fillStyle = `rgba(${color}, ${alpha})`;
          ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
    };
  }, [pixelSize, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
