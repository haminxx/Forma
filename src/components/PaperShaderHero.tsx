import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { scrollDocumentToSectionWithRetries } from "@/lib/scroll-section";

/**
 * Forma home hero — centred title stack + readability scrim. The animated
 * gold field is provided by `HomePage` behind both home and demo.
 */
export function PaperShaderHero() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const goSandbox = () => {
    const behavior = reduceMotion ? ("instant" as const) : ("smooth" as const);
    if (location.pathname !== "/") {
      navigate("/", {
        state: { scrollToSection: "sandbox" },
        preventScrollReset: true,
      });
      return;
    }
    scrollDocumentToSectionWithRetries("sandbox", behavior);
  };

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
          className="relative z-20 flex flex-col items-center pointer-events-auto"
          style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.45))" }}
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

          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goSandbox();
            }}
            aria-label="Download Forma — go to Sandbox install steps"
            className="relative z-30 inline-flex cursor-pointer touch-manipulation select-none items-center gap-2 rounded-full border border-[#d4b87a]/40 bg-black/35 px-5 py-2.5 text-sm font-bold tracking-[0.22em] text-[#f3e0a8] shadow-[0_10px_40px_-14px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all hover:border-[#d4b87a]/70 hover:bg-black/45 hover:text-[#fff3cf]"
            variants={itemVariants}
          >
            Download Forma
            <ArrowRight size={16} strokeWidth={2.4} />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}
