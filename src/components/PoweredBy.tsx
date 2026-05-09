import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * "Powered by" — scroll-driven horizontal logo marquee inspired by
 * Anchor.ai's "Trusted by leading Sales, Solutions, and Security
 * teams" rail.
 *
 * Direction is bound to page scroll:
 *   - Scrolling DOWN (scrollY ↑)  → strip translates LEFT (logos move
 *     right relative to viewport).
 *   - Scrolling UP (scrollY ↓)    → strip translates RIGHT (logos move
 *     left relative to viewport).
 *
 * Implementation: framer-motion `useScroll` returns the live scrollY
 * progress; `useTransform` maps it linearly to translateX. We render
 * three copies of the logo set so the strip looks continuous even at
 * the extremes of the scroll range.
 *
 * `prefers-reduced-motion` short-circuits to a static centred row so
 * vestibular-sensitive users still see every brand.
 */

type LogoEntry = {
  name: string;
  src: string;
  invert?: boolean;
};

// Same 8 brand marks as `LogoCloud`, plus the same `invert` config so
// the black-on-anything PNGs (v0, bolt, manus) render light against
// the dark page bg.
const LOGOS: LogoEntry[] = [
  { name: "Vercel v0", src: "/logos/v0.png", invert: true },
  { name: "Replit", src: "/logos/replit.png" },
  { name: "Bolt", src: "/logos/bolt.png", invert: true },
  { name: "Lovable", src: "/logos/lovable.png" },
  { name: "Manus", src: "/logos/manus.png", invert: true },
  { name: "Figma Make", src: "/logos/figma-make.png" },
  { name: "Base 44", src: "/logos/base44.png" },
  { name: "Tempo", src: "/logos/tempo.png" },
];

export function PoweredBy({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Map every 4 px of scroll to 1 px of horizontal travel so the
  // strip drifts at a comfortable, readable pace. The negative sign
  // means scroll-down moves the strip left (logos visually right).
  // Total addressable scroll for the marquee is the section height
  // plus a little buffer; 8000 px covers the full landing scroll.
  const x = useTransform(scrollY, [0, 8000], [0, -2000]);

  // Render the logo list 3× so the marquee never visually "ends" at
  // either extreme of the scroll range.
  const tripled = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section
      aria-label="Powered by"
      className={cn(
        "relative w-full overflow-hidden bg-[#0a0a0c] py-10 sm:py-14",
        className,
      )}
    >
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-center gap-3 px-6">
        <span
          aria-hidden
          className="h-px w-12 bg-gradient-to-r from-transparent via-[#d4b87a]/40 to-transparent"
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">
          Powered by · 8 vibe-coding surfaces Forma understands
        </p>
        <span
          aria-hidden
          className="h-px w-12 bg-gradient-to-l from-transparent via-[#d4b87a]/40 to-transparent"
        />
      </div>

      <div className="relative">
        {/* Edge-mask: fade out at both sides so logos enter / exit on
            soft seams instead of hitting a hard viewport edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0a0a0c] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0a0a0c] to-transparent"
        />

        <motion.ul
          className="flex w-max items-center gap-12 px-12 sm:gap-16 sm:px-16"
          style={reduced ? undefined : { x }}
        >
          {tripled.map((logo, i) => (
            <li
              key={`${logo.name}-${i}`}
              className="flex h-12 shrink-0 items-center justify-center"
            >
              <img
                src={logo.src}
                alt={logo.name}
                loading="lazy"
                style={
                  logo.invert
                    ? { filter: "invert(1) brightness(1.05)" }
                    : undefined
                }
                className="pointer-events-none h-9 w-auto select-none object-contain opacity-80 transition-opacity duration-200 hover:opacity-100 sm:h-10"
              />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
