import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";

/**
 * ScrollColorBackground — harmonic.ai-style scroll-driven page background.
 *
 * Mounts a `position: fixed` div behind all content that interpolates a
 * radial-gradient between palette stops as the user scrolls the page.
 * One stop per section, so the gradient hands off from charcoal (home)
 * through warm gold (sandbox/solution) into cool teal (about/docs)
 * without any visible per-section seams.
 *
 * Why this beats the per-section EdgeGlow stack:
 *   - Single source of truth for the page-level palette.
 *   - The gradient interpolation is continuous; you can never see a
 *     hard horizontal line at a section boundary.
 *   - Cheap: a single `transform` on a fixed-position div, no per-frame
 *     React re-render, framer-motion drives the CSS variable directly.
 *
 * `prefers-reduced-motion` short-circuits to a static charcoal canvas
 * so animation-sensitive users still get a usable page bg.
 */
export function ScrollColorBackground() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Eight stops to cover seven sections + a bit of overshoot at the top
  // and bottom. Section anchors (rough scroll progress):
  //   0.00  home
  //   0.14  demo
  //   0.28  sandbox        — first warm gold peak
  //   0.42  problem        — back to dark
  //   0.57  solution       — second warm gold peak (deepest)
  //   0.71  about          — first cool teal hint
  //   0.85  docs           — deepest cool teal
  //   1.00  end            — settles back to charcoal
  const stops = [0, 0.14, 0.28, 0.42, 0.57, 0.71, 0.85, 1];

  // Each stop is a fully-formed CSS background string. Using radial
  // gradients (instead of flat fills) so even the dark sections still
  // have a soft glow centred behind the content rail.
  const bgs = [
    "radial-gradient(120% 110% at 50% 50%, #1c1d23 0%, #131418 60%, #0e0f12 100%)", // home
    "radial-gradient(130% 110% at 50% 40%, #1d1f27 0%, #141520 55%, #0e0f15 100%)", // demo
    "radial-gradient(120% 110% at 50% 30%, rgba(212,184,122,0.55) 0%, #2b261a 50%, #131216 100%)", // sandbox (gold halo)
    "radial-gradient(130% 110% at 50% 50%, #20212a 0%, #14151c 60%, #0d0e12 100%)", // problem
    "radial-gradient(140% 130% at 50% 35%, rgba(212,184,122,0.85) 0%, rgba(150,124,75,0.55) 45%, #2c2519 80%, #18120c 100%)", // solution (gold dominant)
    "radial-gradient(130% 110% at 50% 0%, rgba(94,177,191,0.32) 0%, #161e26 55%, #0e1217 100%)", // about (teal hint)
    "radial-gradient(130% 120% at 50% 100%, rgba(94,177,191,0.42) 0%, #142028 55%, #0c1015 100%)", // docs (deep teal)
    "radial-gradient(120% 110% at 50% 50%, #131520 0%, #0d0e13 60%, #08090c 100%)", // end
  ];

  const background = useTransform(scrollYProgress, stops, bgs);

  if (reduced) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: bgs[0] }}
      />
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background }}
    />
  );
}
