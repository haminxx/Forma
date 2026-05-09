import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * "Powered by" — scroll-driven horizontal marquee.
 *
 * Per latest direction:
 *   - PNG logos removed; the strip now scrolls brand NAMES as text
 *     labels (cleaner against the dark page bg, no per-logo invert
 *     juggling).
 *   - Heading reduced to just "Powered by".
 *
 * Direction is bound to page scroll:
 *   - Scrolling DOWN (scrollY ↑) → strip translates LEFT (labels move
 *     right relative to viewport).
 *   - Scrolling UP (scrollY ↓)   → strip translates RIGHT (labels move
 *     left relative to viewport).
 *
 * `prefers-reduced-motion` short-circuits to a static centred row.
 */

const PLATFORMS = [
  "Vercel v0",
  "Replit",
  "Bolt",
  "Lovable",
  "Manus",
  "Figma Make",
  "Base 44",
  "Tempo",
] as const;

export function PoweredBy({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Comfortable drift: every 4 px of scroll → 1 px of horizontal travel.
  const x = useTransform(scrollY, [0, 8000], [0, -2000]);

  // Triple the list so the strip never visually "ends" at either
  // extreme of the addressable scroll range.
  const tripled = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

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
          Powered by
        </p>
        <span
          aria-hidden
          className="h-px w-12 bg-gradient-to-l from-transparent via-[#d4b87a]/40 to-transparent"
        />
      </div>

      <div className="relative">
        {/* Edge-mask: fade out at both sides so labels enter / exit on
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
          {tripled.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="shrink-0"
            >
              <span
                className="select-none text-base font-semibold tracking-[0.18em] text-white/70 transition-colors duration-200 hover:text-white sm:text-lg"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}
              >
                {name}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
