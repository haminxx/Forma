import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const MotionA = motion.a;

/**
 * Forma home hero — centred title stack + readability scrim. The animated
 * gold field is provided by `HomePage` behind both home and demo.
 */
export function PaperShaderHero() {
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
      className={cn("relative h-screen w-full overflow-hidden text-white")}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Vertical scrim — keeps the navbar and centred copy legible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 25%, rgba(0,0,0,0) 55%)",
        }}
      />

      {/* Centred content stack. */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          variants={containerVariants}
          className="relative z-20 flex flex-col items-center"
        >
          <motion.h1
            className="text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl"
            variants={itemVariants}
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
          >
            Every Prompt
            <br />
            <span className="text-[#f3e0a8]">Becomes Precise.</span>
          </motion.h1>

          <motion.div
            className="my-7 h-1 w-20 rounded-full bg-[#d4b87a] shadow-[0_0_24px_-2px_rgba(212,184,122,0.85)]"
            variants={itemVariants}
            aria-hidden
          />

          <motion.p
            className="mb-9 max-w-xl text-base leading-relaxed text-white/85 md:text-lg"
            variants={itemVariants}
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            Forma flags vague UI words as you type and rewrites them into
            canonical components with concrete motion and accessibility
          </motion.p>

          <MotionA
            href="#sandbox"
            aria-label="Download Forma — go to Sandbox install steps"
            variants={itemVariants}
            className={cn(
              "relative z-30 inline-flex cursor-pointer touch-manipulation select-none items-center gap-3 rounded-full border px-8 py-3.5 text-sm font-medium tracking-[0.18em] no-underline transition-all duration-[250ms] ease-out",
              "border-[rgba(200,184,154,0.3)] bg-[rgba(200,184,154,0.08)] text-[#d4b87a]",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.4),0_0_24px_rgba(200,184,154,0.08)]",
              "backdrop-blur-[20px] backdrop-saturate-150 [-webkit-backdrop-filter:blur(20px)_saturate(150%)]",
              "hover:border-[rgba(200,184,154,0.5)] hover:bg-[rgba(200,184,154,0.14)] hover:text-[#e8d5a8]",
              "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4),0_0_32px_rgba(200,184,154,0.16)]",
              "hover:-translate-y-px motion-reduce:hover:translate-y-0",
            )}
          >
            Download Forma
            <ArrowRight
              className="shrink-0"
              size={16}
              strokeWidth={2.4}
              aria-hidden
            />
          </MotionA>
        </motion.div>
      </div>
    </motion.section>
  );
}
