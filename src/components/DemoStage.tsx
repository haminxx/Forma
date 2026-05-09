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
 * Mechanic:
 *   - 170vh outer section. The user scrolls *through* the demo
 *     while a sticky inner panel stays locked to the viewport.
 *   - `useScroll` over the section drives a single 0 → 1 progress
 *     that's mapped to scale (0.7 → 1) + y (+30 → 0) + opacity
 *     (0.85 → 1) so the panel peeks from the bottom of home, then
 *     scales up + locks at viewport centre.
 *   - prefers-reduced-motion short-circuits to the resting state.
 *
 * Background:
 *   - The sticky panel mounts its OWN AnimatedGradientBackground so
 *     the gold gradient is visible BEHIND the demo window for the
 *     entire 170vh of scroll. Non-breathing here so it doesn't
 *     compete with the hero's pulsing instance; same warm palette
 *     so home → demo reads as one continuous gold backdrop.
 *
 * Layout:
 *   - `top-24` (6rem ≈ 96px) keeps the sticky panel below the
 *     floating PillNav + brand / GitHub bar above (~88px tall).
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
      {/* Sticky panel — pinned to the viewport at top: 6rem so it
          sits below the floating navbar. */}
      <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-hidden px-3 sm:px-6">
        {/* Gold gradient backdrop (mounted INSIDE the sticky panel so
            it scrolls with the panel and stays in viewport for the
            entire demo section). */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-black">
          <AnimatedGradientBackground breathing={false} topOffset={-20} />
        </div>

        {/* Demo window centred in the sticky viewport. */}
        <div className="relative flex h-full w-full items-center justify-center">
          <motion.div
            style={
              reduced
                ? undefined
                : { scale, y, opacity, transformOrigin: "50% 100%" }
            }
            className="relative w-full max-w-[min(98vw,92rem)]"
          >
            {/* Soft gold glow ring underneath the window. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-12 -z-10"
              style={{
                background:
                  "radial-gradient(60% 50% at 50% 60%, rgba(212,184,122,0.16) 0%, rgba(212,184,122,0) 70%)",
              }}
            />

            {/* macOS-style window frame around the demo content. */}
            <div
              className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0d0e12] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] sm:rounded-[1.5rem]"
              style={{
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
              }}
            >
              <DemoSplit />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
