import { useEffect, useRef } from "react";

/**
 * Animated gold "pixel wave" that fills the bottom half of its parent.
 *
 * Layers (back → front):
 *   1. Body fill below the main crest, using a vertical CanvasGradient
 *      that runs light gold near the wave line into a deeper amber down
 *      at the section's bottom edge.
 *   2. Bright crest band right at the main wave line (one pixel row).
 *   3. A secondary "ripple" wave drawn ~24 px above the main crest as a
 *      lighter, faster-moving line — adds the layered-wave feel without
 *      the cost of a full second body pass.
 *
 * Performance: two `ctx.fillStyle` writes per frame (one for the gradient
 * body, one for the bright crest/ripple). All crest indexes for the
 * column pass are cached in a Float32Array so the second/third passes
 * don't re-evaluate the sines.
 */
type PixelWaveProps = {
  pixelSize?: number;
};

export function PixelWave({ pixelSize = 10 }: PixelWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let bodyGradient: CanvasGradient | null = null;
    let crestGradient: CanvasGradient | null = null;

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

      // Vertical body gradient: light butter-gold near the wave line,
      // mid amber in the middle, deep amber close to the section floor.
      const grad = ctx.createLinearGradient(0, h * 0.5, 0, h);
      grad.addColorStop(0, "rgba(255, 220, 140, 0.70)");
      grad.addColorStop(0.45, "rgba(212, 170, 90, 0.58)");
      grad.addColorStop(1, "rgba(140, 90, 40, 0.42)");
      bodyGradient = grad;

      // Crest gradient — slight horizontal warmth shift so the wave line
      // doesn't read as a flat band.
      const crest = ctx.createLinearGradient(0, 0, w, 0);
      crest.addColorStop(0, "rgba(255, 230, 160, 0.85)");
      crest.addColorStop(0.5, "rgba(255, 215, 140, 0.95)");
      crest.addColorStop(1, "rgba(245, 195, 110, 0.85)");
      crestGradient = crest;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let raf = 0;
    const start = performance.now();

    let crestRows = new Int16Array(0);
    let rippleRows = new Int16Array(0);

    const draw = (now: number) => {
      const t = (now - start) * 0.001;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / pixelSize);
      const rowsTotal = Math.ceil(height / pixelSize);
      const baseLine = height * 0.55;

      if (crestRows.length !== cols) crestRows = new Int16Array(cols);
      if (rippleRows.length !== cols) rippleRows = new Int16Array(cols);

      // ───── Pass 1: cache crests + paint the gradient body ───────────
      if (bodyGradient) ctx.fillStyle = bodyGradient;
      for (let i = 0; i < cols; i++) {
        const x = i * pixelSize;

        // Main wave: two-octave sine.
        const main =
          Math.sin(x * 0.012 + t * 0.85) * 28 +
          Math.sin(x * 0.028 + t * 0.5) * 14;
        const crest = baseLine + main;
        const crestRow = Math.floor(crest / pixelSize);
        crestRows[i] = crestRow;

        // Ripple wave: faster, smaller amplitude, sits ~24 px above main.
        const ripple =
          Math.sin(x * 0.022 + t * 1.2) * 10 +
          Math.sin(x * 0.05 + t * 0.9) * 5;
        const rippleY = crest - 24 + ripple;
        rippleRows[i] = Math.floor(rippleY / pixelSize);

        const bodyStart = crestRow + 1;
        for (let j = bodyStart; j < rowsTotal; j++) {
          ctx.fillRect(x, j * pixelSize, pixelSize - 1, pixelSize - 1);
        }
      }

      // ───── Pass 2: bright main crest band ───────────────────────────
      if (crestGradient) ctx.fillStyle = crestGradient;
      for (let i = 0; i < cols; i++) {
        const crestRow = crestRows[i];
        if (crestRow >= 0 && crestRow < rowsTotal) {
          ctx.fillRect(
            i * pixelSize,
            crestRow * pixelSize,
            pixelSize - 1,
            pixelSize - 1,
          );
        }
      }

      // ───── Pass 3: secondary ripple line (lighter, smaller) ─────────
      ctx.fillStyle = "rgba(255, 235, 170, 0.55)";
      for (let i = 0; i < cols; i++) {
        const rippleRow = rippleRows[i];
        if (rippleRow >= 0 && rippleRow < rowsTotal) {
          ctx.fillRect(
            i * pixelSize,
            rippleRow * pixelSize,
            pixelSize - 1,
            pixelSize - 1,
          );
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
    };
  }, [pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
