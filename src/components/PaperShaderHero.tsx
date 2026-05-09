import { useState } from "react";
import { motion } from "framer-motion";
import { Dithering } from "@paper-design/shaders-react";
import { ArrowRight, Cpu, Globe, Moon, Sun, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Forma home hero — split layout adopted from the user-pasted
 * `hero-section-2` reference (left content only; right side keeps
 * the existing Dithering dot shader from the previous iteration).
 *
 * Left text panel:
 *   - Header: Forma F-badge + word-mark + slogan eyebrow
 *   - Main: title (with gold accent), divider bar, subtitle, CTA link
 *   - Footer: 3-col contact-style grid with website / hardware /
 *     hackathon-track signal
 *
 * Right panel:
 *   - Dithering shader, "moving around dots" feel via shape="dots",
 *     type="random", speed=0.5.
 *
 * Mobile (< md): stacked — text on top, shader below.
 * Desktop (md+): side-by-side, lg gives the text panel 60% of width.
 */
export function PaperShaderHero() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colorBack = isDarkMode ? "hsl(0, 0%, 0%)" : "hsl(0, 0%, 95%)";
  const colorFront = isDarkMode
    ? "hsl(265, 90%, 70%)"
    : "hsl(220, 100%, 65%)";

  // Stagger orchestration — kept lightweight so the hero lands fast
  // even though it sits behind the theme-toggle + shader.
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
        "relative flex h-screen w-full flex-col overflow-hidden bg-black text-white md:flex-row",
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Theme toggle — floats above both panels in the top-right safe
          area below the navbar so it doesn't collide with the PillNav. */}
      <button
        type="button"
        onClick={() => setIsDarkMode((v) => !v)}
        className={cn(
          "absolute right-6 top-24 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors md:right-10",
          isDarkMode
            ? "bg-white/10 text-white hover:bg-white/15"
            : "bg-black/10 text-black hover:bg-black/20",
        )}
        aria-label={
          isDarkMode ? "Switch to light theme" : "Switch to dark theme"
        }
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Left: content panel */}
      <div className="relative z-10 flex w-full flex-col justify-between p-8 pt-24 md:w-1/2 md:p-12 md:pt-28 lg:w-3/5 lg:p-16 lg:pt-32">
        <div>
          <motion.header className="mb-10" variants={itemVariants}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b87a] text-sm font-bold text-black shadow-[0_4px_14px_-4px_rgba(212,184,122,0.7)]"
              >
                F
              </span>
              <div>
                <p className="text-base font-bold tracking-tight text-white">
                  FORMA
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/55">
                  Grammarly for AI builder prompts
                </p>
              </div>
            </div>
          </motion.header>

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
              className="mb-9 max-w-lg text-base leading-relaxed text-white/65 md:text-lg"
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

        {/* 3-col footer info — Forma signals (live URL, hardware,
            hackathon track) in place of the reference's website /
            phone / address. */}
        <motion.footer
          className="mt-12 w-full"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 gap-5 text-xs text-white/55 sm:grid-cols-3">
            <FooterInfo Icon={Globe}>
              <span className="font-mono text-white/80">
                forma-production-c800.up.railway.app
              </span>
            </FooterInfo>
            <FooterInfo Icon={Cpu}>
              <span className="text-white/80">
                AMD MI300X · vLLM 0.17.1
              </span>
            </FooterInfo>
            <FooterInfo Icon={Trophy}>
              <span className="text-white/80">
                AMD AI Hackathon · Track 1
              </span>
            </FooterInfo>
          </div>
        </motion.footer>
      </div>

      {/* Right: shader panel. Hidden on mobile (<md) to keep the
          stacked text-only experience legible. */}
      <div className="relative hidden md:block md:w-1/2 lg:w-2/5">
        <Dithering
          style={{ height: "100%", width: "100%" }}
          colorBack={colorBack}
          colorFront={colorFront}
          shape="dots"
          type="random"
          pxSize={3}
          offsetX={0}
          offsetY={0}
          scale={0.9}
          rotation={0}
          speed={0.5}
        />
        {/* Soft inner edge so the seam between text panel and shader
            doesn't read as a hard vertical line on the dark theme. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-12"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Bottom-edge fade for the home → demo seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(25,26,31,0.85) 70%, rgba(25,26,31,1) 100%)",
        }}
      />
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
