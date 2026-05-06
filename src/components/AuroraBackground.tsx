import { useEffect, useRef } from "react";

/**
 * Stitch-inspired ambient background.
 *
 * Visual layers (back → front):
 *   1. solid charcoal page bg (handled by body)
 *   2. three pastel orbs that drift on independent loops + parallax with cursor
 *   3. dim base dot grid that breathes globally
 *   4. brighter dot grid masked to a circle around the cursor (spotlight)
 *   5. subtle radial vignette so screen edges fade to pure black
 *
 * Mouse position is published as CSS custom properties (`--mx` / `--my`) on
 * `document.body` so the dot-grid spotlight mask can follow the cursor without
 * React re-rendering. A single rAF loop lerps current → target for smoothness.
 */
export function AuroraBackground() {
  const blueRef = useRef<HTMLDivElement | null>(null);
  const purpleRef = useRef<HTMLDivElement | null>(null);
  const pinkRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const body = document.body;
    if (!body) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let targetX = 0.5;
    let targetY = 0.5;
    let curX = 0.5;
    let curY = 0.5;
    let raf = 0;

    const handleMove = (event: MouseEvent) => {
      targetX = event.clientX / Math.max(1, window.innerWidth);
      targetY = event.clientY / Math.max(1, window.innerHeight);
    };

    const handleLeave = () => {
      targetX = 0.5;
      targetY = 0.5;
    };

    const tick = () => {
      const ease = reduceMotion ? 1 : 0.07;
      curX += (targetX - curX) * ease;
      curY += (targetY - curY) * ease;

      body.style.setProperty("--mx", `${(curX * 100).toFixed(2)}%`);
      body.style.setProperty("--my", `${(curY * 100).toFixed(2)}%`);

      const orbParallax = (depth: number) => {
        const dx = (curX - 0.5) * depth;
        const dy = (curY - 0.5) * depth;
        return `translate3d(${dx.toFixed(2)}%, ${dy.toFixed(2)}%, 0)`;
      };

      if (blueRef.current) blueRef.current.style.translate = "";
      if (blueRef.current) blueRef.current.style.transform = orbParallax(-18);
      if (purpleRef.current) purpleRef.current.style.transform = orbParallax(12);
      if (pinkRef.current) pinkRef.current.style.transform = orbParallax(-9);

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(raf);
      body.style.removeProperty("--mx");
      body.style.removeProperty("--my");
    };
  }, []);

  return (
    <div className="aurora-root" aria-hidden="true">
      {/* Parallax wrappers — orbs themselves keep their own drift keyframes. */}
      <div
        ref={blueRef}
        className="absolute inset-0"
        style={{ transition: "transform 0.4s linear" }}
      >
        <div className="aurora-orb aurora-orb--blue" />
      </div>
      <div
        ref={purpleRef}
        className="absolute inset-0"
        style={{ transition: "transform 0.4s linear" }}
      >
        <div className="aurora-orb aurora-orb--purple" />
      </div>
      <div
        ref={pinkRef}
        className="absolute inset-0"
        style={{ transition: "transform 0.4s linear" }}
      >
        <div className="aurora-orb aurora-orb--pink" />
      </div>

      <div className="aurora-dots" />
      <div className="aurora-dots-spotlight" />
      <div className="aurora-vignette" />
    </div>
  );
}
