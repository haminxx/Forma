import { useState } from "react";
import { Dithering } from "@paper-design/shaders-react";
import { Github, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Forma home hero — left text panel, right paper-shader graphic.
 *
 * Adopted from the user-pasted `portfolio-hero-with-paper-shaders`
 * reference, with the resume content swapped for Forma's identity copy
 * (Grammarly for AI builder prompts, dual-tier MI300X, /amd /memory
 * /github links). Shape uses `dots` — the user asked for "graphic of
 * those dots on the right side half" and the `@paper-design/shaders-
 * react` package's typed union doesn't include the reference's `cat`.
 * Colour is the third palette accent (violet ↔ sky) so the hero
 * contributes the purple+blue richness the design brief called for,
 * sitting next to Forma gold without clashing.
 */
export function PaperShaderHero() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colorBack = isDarkMode ? "hsl(0, 0%, 0%)" : "hsl(0, 0%, 95%)";
  // Dark mode = warm violet; light mode = cool sky. Both sit next to
  // Forma gold (#d4b87a) without clashing.
  const colorFront = isDarkMode
    ? "hsl(265, 90%, 70%)"
    : "hsl(220, 100%, 65%)";

  const panelCls = isDarkMode ? "bg-black text-white" : "bg-white text-black";
  const dimCls = isDarkMode ? "text-white/60" : "text-black/55";
  const dividerCls = isDarkMode ? "border-white/10" : "border-black/10";

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Left text panel */}
      <div
        className={cn(
          "relative z-10 flex w-full flex-col justify-between p-8 font-mono md:w-1/2 md:p-12 lg:p-16",
          panelCls,
        )}
      >
        <button
          type="button"
          onClick={() => setIsDarkMode((v) => !v)}
          className={cn(
            "absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors md:right-8 md:top-8",
            isDarkMode
              ? "text-white/85 hover:bg-white/10"
              : "text-black/80 hover:bg-black/10",
          )}
          aria-label={
            isDarkMode ? "Switch to light theme" : "Switch to dark theme"
          }
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div>
          <p className="text-sm font-normal tracking-[0.32em]">forma.cv</p>

          <div className="mt-12 max-w-xl">
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              <span style={{ color: "#d4b87a" }}>Grammarly</span> for AI
              <br />
              builder prompts.
            </h1>
            <p className={cn("mt-5 max-w-md text-sm leading-relaxed sm:text-base", dimCls)}>
              Forma flags vague UI words as you type and rewrites them into
              canonical components with concrete motion and accessibility
              specs — built on a single AMD MI300X.
            </p>
          </div>

          {/* Experience-style rows — what's real today, with year/era. */}
          <div className={cn("mt-12 max-w-xl border-t pt-6 text-sm", dividerCls)}>
            <Row left="Free tier" mid="Llama 3.1 8B · per-keystroke" right="2026 → live" />
            <Row left="Pro tier" mid="Llama 3.1 70B AWQ · 7 agents" right="2026 → live" />
            <Row left="Surfaces" mid="Chrome on v0.app" right="2026 → live" />
            <Row
              left="Roadmap"
              mid="Cursor · Lovable · Bolt · base44"
              right="v1.1 → 2026 Q3"
              dim
            />
          </div>
        </div>

        {/* Footer link row — Forma's actual live entry-points. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-mono">
          <span className={dimCls}>Links</span>
          <a
            href="https://github.com/haminxx/Forma"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            <Github size={14} />
            GitHub
          </a>
          <a
            href="https://forma-production-c800.up.railway.app/amd"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            /amd
          </a>
          <a
            href="https://forma-production-c800.up.railway.app/memory"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            /memory
          </a>
          <a
            href="https://forma-production-c800.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            Demo
          </a>
        </div>
      </div>

      {/* Right shader panel — visible only at md+ so mobile keeps the
          text-only experience legible. */}
      <div className="relative hidden md:block md:w-1/2">
        <Dithering
          style={{ height: "100%", width: "100%" }}
          colorBack={colorBack}
          colorFront={colorFront}
          shape="dots"
          type="8x8"
          pxSize={2.5}
          offsetX={0}
          offsetY={0}
          scale={1.1}
          rotation={0}
          speed={0.18}
        />
        {/* Soft inner edge so the seam between the two halves doesn't
            read as a hard vertical line on the dark theme. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-12"
          style={{
            background: isDarkMode
              ? "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function Row({
  left,
  mid,
  right,
  dim = false,
}: {
  left: string;
  mid: string;
  right: string;
  dim?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-1",
        dim && "opacity-65",
      )}
    >
      <span className="w-20 shrink-0">{left}</span>
      <span className="flex-1 truncate">{mid}</span>
      <span className="text-xs opacity-70">{right}</span>
    </div>
  );
}
