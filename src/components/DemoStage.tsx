import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { DemoSplit } from "./DemoSplit";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { cn } from "@/lib/utils";

/**
 * DemoStage — peek-then-expand scroll wrapper around `DemoSplit`.
 *
 * Backdrop:
 *   - The sticky panel uses the same `AnimatedGradientBackground` as
 *     the hero (warm gold palette), bound to the panel — no page-level
 *     sticky stack and no extra radial overlay (those caused incorrect
 *     seams / double painting).
 *
 * Mechanic:
 *   - 170vh outer section. The user scrolls *through* the demo while
 *     a sticky inner panel stays locked to the viewport.
 *   - `useScroll` over the section drives a 0 → 1 progress that's
 *     mapped to scale (0.7 → 1) + y (+30 → 0) + opacity (0.85 → 1)
 *     so the panel peeks from the bottom of home, then scales up + locks
 *     at viewport centre.
 *   - On initial page load the floating card additionally plays a
 *     one-time slide-up entrance, delayed until *after* the hero's
 *     stagger settles — this is the "land last" animation requested
 *     by the brief. The entrance lives on an outer wrapper so the
 *     scroll-driven transforms on the inner wrapper aren't disturbed.
 *   - prefers-reduced-motion short-circuits to the resting state.
 *   - `top-24` (6rem ≈ 96px) keeps the sticky panel below the floating
 *     PillNav + brand / GitHub bar above (~88px tall).
 */
export function DemoStage({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.85, 1, 1]);

  return (
    <div
      ref={sectionRef}
      className={cn("relative w-full", className)}
      style={{ minHeight: "170vh" }}
    >
      {/* Sticky panel — pinned to viewport at top: 6rem so it sits
          below the floating navbar. */}
      <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-hidden px-3 sm:px-6">
        {/* Demo screen area's own gold-radial backdrop. Concentrated
            at the top-centre and fading to near-black at the sides +
            bottom so the demo "screen" continues the warm gold tone
            from the hero into a solid black floor for the floating
            card to sit on. Bound to the sticky panel (not the full
            170vh section) so it never paints into the hero overlap. */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <AnimatedGradientBackground
            breathing={!reduced}
            topOffset={-20}
          />
        </div>

        <div className="relative flex h-full w-full items-center justify-center">
          {/* Outer wrapper: one-time slide-up entrance that fires after
              the hero's stagger has finished. Hero entrance is ~1.1s
              from page load (delayChildren 0.18 + 4 × stagger 0.12 +
              duration 0.45), so we delay by 1.4s to land the card last. */}
          <motion.div
            initial={
              reduced ? undefined : { opacity: 0, y: 120, scale: 0.94 }
            }
            animate={
              reduced ? undefined : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{
              duration: 0.95,
              delay: 1.4,
              ease: [0.22, 0.68, 0, 1],
            }}
            className="relative w-full max-w-[min(98vw,92rem)]"
          >
            {/* Inner wrapper: scroll-driven peek-then-expand transforms.
                Kept on a separate motion node so the entrance and the
                scroll motion don't fight over the same `style.y`. */}
            <motion.div
              style={
                reduced
                  ? undefined
                  : { scale, y, opacity, transformOrigin: "50% 100%" }
              }
              className="relative w-full"
            >
              {/* Soft gold glow ring underneath the floating window. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-12 -z-10"
                style={{
                  background:
                    "radial-gradient(60% 50% at 50% 60%, rgba(212,184,122,0.22) 0%, rgba(212,184,122,0) 70%)",
                }}
              />

              {/* macOS-style window frame around the demo content. Fully
                  opaque card — the gold backdrop only shows AROUND the
                  card, never through it. */}
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0d0e12] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.75)] sm:rounded-[1.5rem]">
                <DemoSplit />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
