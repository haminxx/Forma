import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * "Powered by" — scroll-driven horizontal marquee of Forma's tech-stack
 * brand marks (Llama, FastAPI, DigitalOcean, Railway, AMD).
 *
 * Per latest direction the previous text-label marquee was replaced
 * with logo files in /public/logos (PNG or SVG). Each entry carries an
 * optional `invert` flag for marks that ship dark-on-light (Llama, AMD,
 * Railway wordmark) — CSS `filter: invert(1) brightness(1.05)` flips them
 * to light so they read against the dark page bg.
 *
 * Direction is bound to page scroll:
 *   - Scrolling DOWN (scrollY ↑) → strip translates LEFT
 *   - Scrolling UP   (scrollY ↓) → strip translates RIGHT
 */

type StackLogo = {
  name: string;
  src: string;
  /** Apply CSS invert(1) for black-on-light source PNGs. */
  invert?: boolean;
  /** Optional max height override for visually heavy / light marks. */
  heightClass?: string;
  /** Nudge visual weight to align with siblings (wide wordmarks). */
  scale?: number;
};

const STACK: StackLogo[] = [
  { name: "Llama", src: "/logos/llama.png", invert: true, scale: 2 },
  { name: "FastAPI", src: "/logos/fastapi.png" },
  { name: "DigitalOcean", src: "/logos/digitalocean.svg", scale: 1.06 },
  { name: "Railway", src: "/logos/railway.svg", invert: true, scale: 1.06 },
  { name: "AMD", src: "/logos/amd.png", invert: true },
];

export function PoweredBy({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Comfortable drift: every 4 px of scroll → 1 px of horizontal travel.
  const x = useTransform(scrollY, [0, 8000], [0, -2000]);

  // Triple the list so the strip never visually "ends" at either
  // extreme of the addressable scroll range.
  const tripled = [...STACK, ...STACK, ...STACK];

  return (
    <section
      aria-label="Powered by"
      className={cn(
        "relative w-full overflow-hidden bg-black py-10 sm:py-14",
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
        {/* Edge-mask: fade out at both sides so logos enter / exit on
            soft seams instead of hitting a hard viewport edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent"
        />

        <motion.ul
          className="flex w-max items-center gap-14 px-12 sm:gap-20 sm:px-16"
          style={reduced ? undefined : { x }}
        >
          {tripled.map((logo, i) => (
            <li
              key={`${logo.name}-${i}`}
              className="flex min-h-[5.25rem] shrink-0 items-center justify-center overflow-visible sm:min-h-[6rem]"
            >
              <span
                className="flex items-center justify-center overflow-visible"
                style={
                  logo.scale != null && logo.scale !== 1
                    ? {
                        transform: `scale(${logo.scale})`,
                        transformOrigin: "center center",
                      }
                    : undefined
                }
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
                  className={cn(
                    "pointer-events-none w-auto select-none object-contain opacity-80 transition-opacity duration-200 hover:opacity-100",
                    logo.heightClass ?? "h-9 sm:h-11",
                  )}
                />
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
