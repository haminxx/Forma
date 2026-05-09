import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { DemoSplit } from "./DemoSplit";
import { cn } from "@/lib/utils";

/**
 * DemoStage — peek-then-expand scroll wrapper around `DemoSplit`.
 *
 * Inspired by the hero-card patterns on https://clarte.io and
 * https://www.anthropic.com (Project Glasswing card), and styled
 * after the cursor.com platform-window framing in the user's
 * reference image.
 *
 * Mechanic:
 *   - The wrapper is a sticky panel inside a tall (170vh) section,
 *     so the user scrolls *through* the demo while the panel stays
 *     locked to the viewport.
 *   - `useScroll` over the section drives a single `progress` 0→1.
 *     Mapping:
 *       progress 0     → scale 0.85, y +60, opacity 0.85   (peeking
 *                        from below the home fold)
 *       progress 0.5   → scale 1.0,  y 0,   opacity 1      (fully
 *                        expanded, locked centre)
 *       progress 1     → scale 1.0,  y 0,   opacity 1      (held
 *                        through to the next section seam)
 *
 *   - prefers-reduced-motion short-circuits to the resting state so
 *     vestibular-sensitive users still see the panel.
 *
 * The DemoSplit content underneath is unchanged — only the framing
 * (rounded window, soft glow, scroll-driven scale) is added here.
 */
export function DemoStage({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track scroll across the section. `start end` = top of section
  // entering bottom of viewport (peek state). `end end` = bottom of
  // section reaching bottom of viewport (held state).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  // Tighter peek + larger expansion. The panel starts at scale 0.7
  // (clearly smaller, peeking from the bottom of the home fold) and
  // grows to full 1.0 by the time the user has scrolled half the
  // section. y starts at +30 so the smaller panel sits visually
  // tucked underneath home's lower edge.
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.85, 1, 1]);

  return (
    <div
      ref={sectionRef}
      className={cn("relative w-full", className)}
      style={{ minHeight: "170vh" }}
    >
      {/* Hero gradient extension — mirrors the AnimatedGradientBackground
          from PaperShaderHero with the radial centred well above the
          demo (50% / -55%) so the demo only ever sees the gradient's
          OUTER rings (gold → gold-soft → fade-to-canvas), which is
          exactly the same colour band visible at the bottom edge of
          the home hero. Result: scrolling from home into the demo
          reads as one continuous Forma-gold backdrop instead of a
          hard cut to plain canvas. Static (non-breathing) so it does
          not compete with the hero's animation. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(150% 130% at 50% -55%, #0d0e12 25%, #191a1f 45%, #2c1f12 60%, #5a432a 72%, #a08850 84%, #d4b87a 94%, #e5c98f 100%)",
        }}
      />

      {/* Sticky frame: the peek-expand panel is pinned to the viewport
          while the user scrolls through the section's tall flow. */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-3 sm:px-6">
        <motion.div
          style={
            reduced
              ? undefined
              : { scale, y, opacity, transformOrigin: "50% 100%" }
          }
          className="relative w-full max-w-[min(98vw,92rem)]"
        >
          {/* Soft gold glow ring underneath the window, sized so it
              spills past the panel and dies on the page bg. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-12 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 60%, rgba(212,184,122,0.16) 0%, rgba(212,184,122,0) 70%)",
            }}
          />

          {/* macOS-style window frame so the demo reads as a
              standalone "platform window" floating on the page. */}
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
  );
}
