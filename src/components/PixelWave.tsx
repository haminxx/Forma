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
      const rowsTotal = Math.ceil(height / pixelSize);
      const baseLine = height * 0.55; // wave centre line

      // Pre-bake the body fill style — every column reuses the same colour
      // for everything beneath the crest, so we set it once.
      const bodyStyle = `rgba(${color}, 0.42)`;
      const crestStyle = `rgba(${color}, 0.85)`;

      for (let i = 0; i < cols; i++) {
        const x = i * pixelSize;

        // Two-octave sine — slower long wave + faster ripple.
        const wave =
          Math.sin(x * 0.012 + t * 0.85) * 28 +
          Math.sin(x * 0.028 + t * 0.5) * 14;
        const crest = baseLine + wave;
        const crestRow = Math.floor(crest / pixelSize);

        // Solid body fill: every pixel from one row below the crest down
        // to the section's bottom edge.
        ctx.fillStyle = bodyStyle;
        const bodyStart = crestRow + 1;
        for (let j = bodyStart; j < rowsTotal; j++) {
          ctx.fillRect(x, j * pixelSize, pixelSize - 1, pixelSize - 1);
        }

        // Bright crest band (one row right at the wave line).
        if (crestRow >= 0 && crestRow < rowsTotal) {
          ctx.fillStyle = crestStyle;
          ctx.fillRect(x, crestRow * pixelSize, pixelSize - 1, pixelSize - 1);
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
