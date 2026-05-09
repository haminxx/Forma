import { motion } from "framer-motion";
import { ArrowRight, Cpu, Globe, Trophy } from "lucide-react";

import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { cn } from "@/lib/utils";

/**
 * Forma home hero — full-bleed `AnimatedGradientBackground` (multi-
 * stop charcoal -> blue -> violet -> pink -> amber -> Forma gold
 * radial that subtly breathes) with the existing left text panel
 * sitting on top.
 *
 * The previous split layout (left text + right Dithering shader)
 * was retired per the latest direction. The gradient now fills the
 * entire hero so the gradient *is* the graphic, with content
 * floating above it on the left half (right half lets the gradient
 * read fully).
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

      {/* Soft left-side scrim so the title + body copy stay readable
          against the brightest part of the gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Left content — same structure as before, lifted onto z-10 so
          it sits above the gradient + scrim. */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-8 pt-24 md:w-3/5 md:p-12 md:pt-28 lg:w-1/2 lg:p-16 lg:pt-32">
        <div>
          <motion.div variants={containerVariants}>
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
              className="mb-9 max-w-lg text-base leading-relaxed text-white/75 md:text-lg"
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

        {/* 3-col footer info — Forma signals. */}
        <motion.footer className="mt-12 w-full" variants={itemVariants}>
          <div className="grid grid-cols-1 gap-5 text-xs text-white/65 sm:grid-cols-3">
            <FooterInfo Icon={Globe}>
              <span className="font-mono text-white/85">
                forma-production-c800.up.railway.app
              </span>
            </FooterInfo>
            <FooterInfo Icon={Cpu}>
              <span className="text-white/85">AMD MI300X · vLLM 0.17.1</span>
            </FooterInfo>
            <FooterInfo Icon={Trophy}>
              <span className="text-white/85">
                AMD AI Hackathon · Track 1
              </span>
            </FooterInfo>
          </div>
        </motion.footer>
      </div>
    </motion.section>
  );
}

function FooterInfo({
  Icon,
  children,
}: {
  Icon: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-[#d4b87a]" strokeWidth={1.8} />
      <span className="truncate">{children}</span>
    </div>
  );
}
