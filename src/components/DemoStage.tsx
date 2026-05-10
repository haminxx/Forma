import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { DemoSplit } from "./DemoSplit";
import { cn } from "@/lib/utils";

/**
 * DemoStage — peek-then-expand scroll wrapper around `DemoSplit`.
 *
 * Backdrop: none in the sticky strip — `HomePage` paints a bottom-anchored
 * mirror of the hero radial (`cssInvertedHeroTrackBackdrop`) only **below** the hero overlap;
 * shared animated gradient stays visible
 * behind the card until you scroll into the lower track.
 *
 * Mechanic:
 *   - 170vh outer section. The user scrolls *through* the demo while
 *     a sticky inner panel stays locked to the viewport.
 *   - `useScroll` over the section drives a 0 → 1 progress that's
 *     mapped to scale (0.7 → 1) + y (+18 → 0) — **no opacity** so the
 *     floating window stays fully solid while peeking over the hero.
 *     The panel scales up and locks at viewport centre.
 *   - On initial page load the floating card additionally plays a
 *     one-time slide-up entrance, delayed until *after* the hero's
 *     stagger settles — this is the "land last" animation requested
 *     by the brief. The entrance lives on an outer wrapper so the
 *     scroll-driven transforms on the inner wrapper aren't disturbed.
 *   - prefers-reduced-motion short-circuits to the resting state.
 *   - `top-24` (6rem ≈ 96px) keeps the sticky panel below PillNav (~88px tall).
 *   - The inner flex uses `items-start` + viewport‑relative `padding-top`
 *     so the Vibe / Forma toggle + window chrome sit visibly **lower**
 *     in the band between the navbar and viewport bottom edge.
 */
export function DemoStage({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 1]);
  /** Slightly higher peek than before so the card lands a bit higher on first paint. */
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, 0]);

  return (
    <div
      ref={sectionRef}
      className={cn("relative w-full", className)}
      style={{ minHeight: "170vh" }}
    >
      {/* Sticky panel — pinned to viewport at top: 6rem so it sits
          below the floating navbar. */}
      {/* Pass clicks through empty sticky band so hero CTAs stay clickable where
          this section overlaps `#home` (negative margin on HomePage). */}
      <div className="pointer-events-none sticky top-24 h-[calc(100vh-6rem)] overflow-hidden bg-transparent px-3 sm:px-6">
        <div className="relative flex h-full w-full items-start justify-center pt-[clamp(0.35rem,1.75vh,1.65rem)] sm:pt-[clamp(0.5rem,2.25vh,2rem)]">
          {/* Outer wrapper: one-time slide-up entrance that fires after
              the hero's stagger has finished. Hero entrance is ~1.1s
              from page load (delayChildren 0.18 + 4 × stagger 0.12 +
              duration 0.45), so we delay by 1.4s to land the card last. */}
          <motion.div
            initial={
              reduced ? undefined : { opacity: 0, y: 96, scale: 0.94 }
            }
            animate={
              reduced ? undefined : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{
              duration: 0.95,
              delay: 1.4,
              ease: [0.22, 0.68, 0, 1],
            }}
            className="pointer-events-auto relative w-full max-w-[min(98vw,92rem)]"
          >
            {/* Inner wrapper: scroll-driven peek-then-expand transforms.
                Kept on a separate motion node so the entrance and the
                scroll motion don't fight over the same `style.y`. */}
            <motion.div
              style={
                reduced
                  ? undefined
                  : { scale, y, transformOrigin: "50% 100%" }
              }
              className="relative w-full"
            >
              {/* Toggle + chrome live in `DemoSplit`: only the 3-pane window
                  is bordered — avoids a tall slab of `#0d0e12` above the pill. */}
              <DemoSplit
                scrollYProgress={scrollYProgress}
                reducedMotion={reduced}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
