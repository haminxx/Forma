import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Eye,
  ExternalLink,
  Globe,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Terminal,
} from "lucide-react";

import { PromptInput } from "./PromptInput";
import { cn } from "../lib/cn";

// Lifted directly from the README's "30-Second Pitch" example so the
// demo on the marketing site matches what `/detect-vague` actually does
// against Forma's canonical-60 vocabulary.
const VIBE_PROMPT = "Build a popup that slides in from the side";
const FORMA_PROMPT =
  "Build an Off-Canvas Drawer (slides from right edge, 320px width, 250ms ease-in-out, semi-transparent backdrop, focus-trap on open, ESC to dismiss)";

type Mode = "vibe" | "forma";

/** Vibe: a vague brief. Forma: the brief Forma expands the prompt INTO. */
const SPEC_LINES: Record<Mode, string[]> = {
  vibe: [
    "Some kind of popup that slides in from the side.",
    "Make it look modern.",
    "Should close when you click outside, I think.",
  ],
  forma: [
    "Component: Off-Canvas Drawer (1 of 60 canonical UI terms).",
    "Motion: slides from right edge, 320px width, 250ms ease-in-out.",
    "Backdrop: semi-transparent overlay, click-outside dismisses.",
    "A11y: focus-trap on open, ESC to close, aria-modal=\"true\".",
    "Stack: shadcn/ui + React, Tailwind tokens, no extra deps.",
  ],
};

interface ChecklistItem {
  label: string;
  hint: string;
}

// The 5 "precision dimensions" Forma's Detector + Critic score against.
const CHECKLIST: ChecklistItem[] = [
  { label: "Canonical component", hint: "Off-Canvas Drawer" },
  { label: "Motion spec", hint: "250ms · ease-in-out" },
  { label: "Layout anchor", hint: "right edge · 320px" },
  { label: "Accessibility", hint: "focus-trap · ESC · aria-modal" },
  { label: "Library target", hint: "shadcn / React" },
];

// Status pill in the preview shows Forma's quality score (per the
// README example): vague prompt = 30/100, precise prompt = 95/100.
const PREVIEW_META: Record<Mode, { url: string; status: string; src: string }> =
  {
    vibe: {
      url: "preview.forma.dev/vague",
      status: "score 30 / 100 · vague",
      src: "/vague-output.png",
    },
    forma: {
      url: "preview.forma.dev/precise",
      status: "score 95 / 100 · precise",
      src: "/precise-output.png",
    },
  };

/**
 * Vibe-coding IDE demo — left: design brief + docked prompt; right: browser
 * preview of generated UI (reference: Replit / Lovable style split).
 */
export function DemoSplit() {
  const [mode, setMode] = useState<Mode>("vibe");
  const [vibeValue, setVibeValue] = useState(VIBE_PROMPT);
  const [formaValue, setFormaValue] = useState(FORMA_PROMPT);

  const value = mode === "vibe" ? vibeValue : formaValue;
  const setValue = mode === "vibe" ? setVibeValue : setFormaValue;
  const meta = PREVIEW_META[mode];
  const specs = SPEC_LINES[mode];

  return (
    <div className="w-full max-w-[min(98vw,92rem)]">
      <ModeToggle mode={mode} setMode={setMode} />

      <div className="mt-4 flex min-h-0 w-full flex-col gap-3 lg:mt-5 lg:h-[min(72vh,780px)] lg:flex-row lg:gap-4">
        {/* Left: brief + precision strip + docked prompt */}
        <div
          className={cn(
            "flex min-h-[420px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-black/45 lg:min-h-0 lg:max-w-[min(100%,440px)] lg:flex-[0_0_38%]",
            mode === "vibe"
              ? "border-white/[0.09]"
              : "border-[#d4b87a]/20",
          )}
        >
          <div
            className={cn(
              "flex flex-shrink-0 items-center justify-between gap-2 border-b px-3 py-2",
              mode === "vibe"
                ? "border-white/[0.08]"
                : "border-[#d4b87a]/15",
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              Design brief
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                mode === "vibe"
                  ? "bg-white/[0.06] text-white/40"
                  : "bg-[#d4b87a]/15 text-[#d4b87a]",
              )}
            >
              {mode === "vibe" ? "Draft" : "Locked spec"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <ol className="space-y-3 text-left text-[13px] leading-snug text-white/78">
              {specs.map((line, i) => (
                <li key={`${mode}-${i}`} className="flex gap-2.5">
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#d4b87a]/90">
                    {i + 1}.
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>

            <Checklist mode={mode} />
          </div>

          <div
            className={cn(
              "flex-shrink-0 border-t p-2.5 sm:p-3",
              mode === "vibe" ? "border-white/[0.08]" : "border-[#d4b87a]/12",
            )}
          >
            <PromptInput
              dock
              variant={mode === "vibe" ? "default" : "magic"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask a follow-up…"
            />
          </div>
        </div>

        <PreviewPane mode={mode} meta={meta} />
      </div>

      <p className="mt-4 text-center text-xs text-white/40">
        Same intent. Same model. Different vocabulary → dramatically different
        output.
      </p>
    </div>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div className="relative inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-sm">
      <motion.span
        aria-hidden="true"
        className={cn(
          "absolute bottom-1 left-1 top-1 rounded-full transition-colors duration-300",
          mode === "vibe"
            ? "bg-white/[0.10] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            : "bg-gradient-to-r from-[#d4b87a] to-[#e5c98f] shadow-[0_4px_20px_-6px_rgba(212,184,122,0.55)]",
        )}
        style={{ width: "calc(50% - 0.25rem)" }}
        initial={false}
        animate={{ x: mode === "vibe" ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      />
      <button
        type="button"
        onClick={() => setMode("vibe")}
        aria-pressed={mode === "vibe"}
        className={cn(
          "relative z-10 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors",
          mode === "vibe" ? "text-white" : "text-white/45 hover:text-white/70",
        )}
      >
        Vibe Coder
      </button>
      <button
        type="button"
        onClick={() => setMode("forma")}
        aria-pressed={mode === "forma"}
        className={cn(
          "relative z-10 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors",
          mode === "forma" ? "text-black" : "text-white/45 hover:text-white/70",
        )}
      >
        Forma User
      </button>
    </div>
  );
}

function Checklist({ mode }: { mode: Mode }) {
  const checked = mode === "forma";
  return (
    <div className="mt-5 flex min-h-0 flex-col rounded-xl border border-white/[0.06] bg-black/35 p-3">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
          Precision dimensions
        </span>
        <span
          className={cn(
            "text-[10px] font-mono tabular-nums transition-colors",
            checked ? "text-[#d4b87a]" : "text-white/35",
          )}
        >
          {checked ? "5 / 5" : "0 / 5"} captured
        </span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {CHECKLIST.map((item, i) => (
          <ChecklistRow
            key={item.label}
            item={item}
            checked={checked}
            delay={i * 0.06}
          />
        ))}
      </ul>
    </div>
  );
}

function ChecklistRow({
  item,
  checked,
  delay,
}: {
  item: ChecklistItem;
  checked: boolean;
  delay: number;
}) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/[0.02]">
      <motion.span
        aria-hidden="true"
        animate={{
          backgroundColor: checked ? "#d4b87a" : "rgba(255,255,255,0.04)",
          borderColor: checked ? "#d4b87a" : "rgba(255,255,255,0.18)",
        }}
        transition={{ duration: 0.35, delay }}
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border"
      >
        <AnimatePresence>
          {checked ? (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, delay: delay + 0.15 }}
            >
              <Check size={11} strokeWidth={3} className="text-black" />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.span>
      <span className="flex-1 truncate text-[12px] text-white/72">
        {item.label}
      </span>
      <span
        className={cn(
          "truncate text-[10px] font-mono transition-colors",
          checked ? "text-[#d4b87a]/85" : "text-white/30",
        )}
      >
        {checked ? item.hint : "—"}
      </span>
    </li>
  );
}

function PreviewPane({
  mode,
  meta,
}: {
  mode: Mode;
  meta: { url: string; status: string; src: string };
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border bg-black/35 transition-colors duration-500",
        mode === "vibe"
          ? "border-white/[0.08] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.55)]"
          : "border-[#d4b87a]/25 shadow-[0_24px_80px_-48px_rgba(212,184,122,0.18)]",
      )}
    >
      <div
        className={cn(
          "flex flex-shrink-0 flex-col gap-1.5 border-b px-3 py-2 transition-colors duration-500",
          mode === "vibe" ? "border-white/[0.08]" : "border-[#d4b87a]/15",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="ml-1 flex items-center gap-0.5 text-white/45">
            <button
              type="button"
              aria-label="Back"
              className="rounded p-1 hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              aria-label="Forward"
              className="rounded p-1 hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              aria-label="Preview"
              className="rounded p-1 hover:bg-white/[0.06] hover:text-white"
            >
              <Eye size={13} />
            </button>
            <button
              type="button"
              aria-label="Code"
              className="rounded p-1 hover:bg-white/[0.06] hover:text-white"
            >
              <Code2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-mono transition-colors duration-500",
              mode === "vibe"
                ? "border-white/[0.08] bg-black/40 text-white/55"
                : "border-[#d4b87a]/20 bg-[#d4b87a]/[0.05] text-[#d4b87a]/85",
            )}
          >
            <Lock size={10} className="shrink-0 opacity-70" />
            <Globe size={11} className="shrink-0 opacity-70" />
            <span className="text-white/35">/</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={meta.url}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="min-w-0 truncate"
              >
                {meta.url}
              </motion.span>
            </AnimatePresence>
          </div>
          <button
            type="button"
            aria-label="Open in new tab"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/45 hover:bg-white/[0.06] hover:text-white/80"
          >
            <ExternalLink size={13} />
          </button>
          <button
            type="button"
            aria-label="Reload preview"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/45 hover:bg-white/[0.06] hover:text-white/80"
          >
            <RefreshCw size={12} />
          </button>
          <button
            type="button"
            aria-label="Terminal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/45 hover:bg-white/[0.06] hover:text-white/80"
          >
            <Terminal size={13} />
          </button>
          <button
            type="button"
            aria-label="More"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/45 hover:bg-white/[0.06] hover:text-white/80"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden bg-white/[0.02]">
        <AnimatePresence mode="wait">
          <motion.img
            key={meta.src}
            src={meta.src}
            alt={
              mode === "vibe"
                ? "Preview from a vague prompt — generic loading state"
                : "Preview from a precise prompt — skeleton loader"
            }
            loading="lazy"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-3 right-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={meta.status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] backdrop-blur-md",
                mode === "vibe"
                  ? "border-white/15 bg-black/55 text-white/70"
                  : "border-[#d4b87a]/40 bg-black/55 text-[#d4b87a]",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  mode === "vibe" ? "bg-white/60" : "bg-[#d4b87a]",
                )}
              />
              {meta.status}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
