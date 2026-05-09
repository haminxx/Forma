import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { cn } from "@/lib/utils";

/**
 * Forma home hero — full-bleed `AnimatedGradientBackground` (multi-
 * stop charcoal -> blue -> violet -> pink -> amber -> Forma gold
 * radial that subtly breathes) with a CENTERED card-style content
 * stack on top.
 *
 * Per latest direction:
 *   - All hero copy is centered (not left-aligned). Mirrors the
 *     centered shadcn Card pattern from the user-pasted reference.
 *   - 3-col footer info row (URL / hardware / hackathon track) was
 *     removed — the hero is just title + divider + subtitle + CTA.
 *   - Bottom of the hero is left transparent so the next section
 *     (DemoStage) can peek through the lower half of the viewport.
 */
export function PaperShaderHero() {
  // Stagger orchestration — kept lightweight so the hero lands fast.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.18 },
    },
  };
  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  return (
    <motion.section
      className={cn(
        "relative h-screen w-full overflow-hidden bg-black text-white",
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Full-bleed animated radial gradient backdrop. */}
      <AnimatedGradientBackground breathing topOffset={-20} />

      {/* Soft top scrim so the title + body stay readable against the
          brightest part of the gradient. Bottom intentionally left
          transparent so the next section bleeds through naturally. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 35%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Centred content stack — sits above the gradient + scrim.
          Constrained to the upper 60% of the viewport so the lower
          40% is reserved for the DemoStage to peek through. */}
      <div className="relative z-10 mx-auto flex h-[62%] w-full max-w-3xl flex-col items-center justify-center px-6 pt-20 text-center">
        <motion.div
          variants={containerVariants}
          className="flex flex-col items-center"
        >
          <motion.h1
            className="text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            Every Prompt
            <br />
            <span className="text-[#d4b87a]">Becomes Precise.</span>
          </motion.h1>

          <motion.div
            className="my-7 h-1 w-20 rounded-full bg-[#d4b87a]"
            variants={itemVariants}
            aria-hidden
          />

          <motion.p
            className="mb-9 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
            variants={itemVariants}
          >
            Forma flags vague UI words as you type and rewrites them into
            canonical components with concrete motion and accessibility
            specs — built on a single AMD MI300X.
          </motion.p>

          <motion.a
            href="https://forma-production-c800.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.22em] text-[#d4b87a] transition-colors hover:text-[#e2c890]"
            variants={itemVariants}
          >
            OPEN THE LIVE DEMO
            <ArrowRight size={16} strokeWidth={2.4} />
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}
