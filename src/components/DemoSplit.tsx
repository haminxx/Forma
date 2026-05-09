import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Globe, Lock, RefreshCw } from "lucide-react";

import { PromptInput } from "./PromptInput";
import { cn } from "../lib/cn";

// Same vague-vs-precise prompt pair as before, just hoisted into a
// per-mode lookup so the single PromptInput can swap content when the
// user flips the toggle.
const VIBE_PROMPT =
  "make something that shows up while my app is loading data, just so it doesn't look empty";
const FORMA_PROMPT =
  "Skeleton Loader with shimmer gradient sweep animation 1.5s infinite, matching the layout shape of the content being loaded, gray-200 base color";

type Mode = "vibe" | "forma";

interface ChecklistItem {
  label: string;
  hint: string;
}

// Forma's precision dimensions — checked in Forma mode (the prompt
// captured each one), unchecked in Vibe mode (the prompt left them
// implicit).
const CHECKLIST: ChecklistItem[] = [
  { label: "Component type", hint: "Skeleton Loader" },
  { label: "Animation spec", hint: "shimmer · 1.5s infinite" },
  { label: "Layout anchor", hint: "matches content shape" },
  { label: "Color token", hint: "gray-200 base" },
  { label: "Library target", hint: "shadcn / React" },
];

const PREVIEW_META: Record<Mode, { url: string; status: string; src: string }> = {
  vibe: {
    url: "preview.forma.dev/vague",
    status: "generic spinner",
    src: "/vague-output.png",
  },
  forma: {
    url: "preview.forma.dev/precise",
    status: "skeleton with shimmer",
    src: "/precise-output.png",
  },
};

/**
 * v0.app-styled demo screen.
 *
 *   ┌─ Mode toggle ──────────────────────────────────────────────┐
 *   │ [Vibe Coder | Forma User]                                  │
 *   ├──── prompt rail ─────┬──── preview pane ──────────────────┤
 *   │ PromptInput          │ ● ● ● url-bar  ↻                    │
 *   │ ─────────────        │ ──────────────────────────────────  │
 *   │ ☐ Component type     │                                     │
 *   │ ☐ Animation spec     │  [v0 output image]                  │
 *   │ ☐ Layout anchor      │                                     │
 *   │ ...                  │                                     │
 *   └──────────────────────┴─────────────────────────────────────┘
 *
 * The same `mode` state drives:
 *   - PromptInput value + variant gradient (default = vibe, magic = forma)
 *   - Checklist tick states (forma checks all five precision dims)
 *   - Preview pane URL slug, status pill, and rendered image
 */
export function DemoSplit() {
  const [mode, setMode] = useState<Mode>("vibe");
  // Track edits per-mode so flipping the toggle doesn't blow away
  // anything the user typed in the other mode.
  const [vibeValue, setVibeValue] = useState(VIBE_PROMPT);
  const [formaValue, setFormaValue] = useState(FORMA_PROMPT);

  const value = mode === "vibe" ? vibeValue : formaValue;
  const setValue = mode === "vibe" ? setVibeValue : setFormaValue;
  const meta = PREVIEW_META[mode];

  return (
    <div className="w-full max-w-[min(98vw,92rem)]">
      <div className="grid w-full gap-4 lg:gap-5 lg:grid-cols-[minmax(340px,38%)_1fr]">
        {/* ───── Left rail: toggle + prompt + checklist ───── */}
        <div className="flex min-w-0 flex-col gap-4">
          <ModeToggle mode={mode} setMode={setMode} />

          <PromptInput
            variant={mode === "vibe" ? "default" : "magic"}
            label={mode === "vibe" ? "Vibe Coder" : "Forma User"}
            caption={mode === "vibe" ? "vague intent" : "precise vocab"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              mode === "vibe"
                ? "describe the thing you want…"
                : "ask for the exact component, anchor, motion spec…"
            }
          />

          <Checklist mode={mode} />
        </div>

        {/* ───── Right pane: v0-style website preview ───── */}
        <PreviewPane mode={mode} meta={meta} />
      </div>

      <p className="mt-4 text-center text-xs text-white/40">
        Same intent. Same model. Different vocabulary → dramatically different output.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Mode toggle (segmented pill, sliding indicator)
// ──────────────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div className="relative inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-sm">
      {/* Sliding indicator. width = (50% - 4px) so two of them tile
          edge-to-edge inside the 4px-padded container; x:100% lands
          the indicator exactly under the right segment. */}
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

// ──────────────────────────────────────────────────────────────────────
// Checklist of precision dimensions
// ──────────────────────────────────────────────────────────────────────

function Checklist({ mode }: { mode: Mode }) {
  const checked = mode === "forma";
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between pb-3">
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
      <ul className="flex flex-col gap-1">
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
    <li className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.02]">
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
      <span className="flex-1 truncate text-[13px] text-white/75">{item.label}</span>
      <span
        className={cn(
          "truncate text-[11px] font-mono transition-colors",
          checked ? "text-[#d4b87a]/85" : "text-white/30",
        )}
      >
        {checked ? item.hint : "—"}
      </span>
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Preview pane (v0.app-style browser frame)
// ──────────────────────────────────────────────────────────────────────

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
        "relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border bg-black/30 transition-colors duration-500",
        mode === "vibe"
          ? "border-white/[0.08] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.55)]"
          : "border-[#d4b87a]/25 shadow-[0_24px_80px_-48px_rgba(212,184,122,0.18)]",
      )}
      style={{ height: "min(70vh, 720px)" }}
    >
      {/* Browser chrome: traffic lights + URL bar + reload */}
      <div
        className={cn(
          "flex flex-shrink-0 items-center gap-3 border-b px-4 py-2.5 transition-colors duration-500",
          mode === "vibe" ? "border-white/[0.08]" : "border-[#d4b87a]/15",
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div
            className={cn(
              "flex max-w-md flex-1 items-center gap-2 rounded-md border px-3 py-1 text-[11px] font-mono transition-colors duration-500",
              mode === "vibe"
                ? "border-white/[0.08] bg-black/30 text-white/55"
                : "border-[#d4b87a]/20 bg-[#d4b87a]/[0.04] text-[#d4b87a]/85",
            )}
          >
            <Lock size={10} className="opacity-70" />
            <Globe size={11} className="opacity-70" />
            <AnimatePresence mode="wait">
              <motion.span
                key={meta.url}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="truncate"
              >
                {meta.url}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          aria-label="Reload preview"
          className="flex h-6 w-6 items-center justify-center rounded text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/80"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Output image — crossfades between vague/precise on mode flip */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={meta.src}
            src={meta.src}
            alt={
              mode === "vibe"
                ? "v0 output from a vague prompt — generic loading state"
                : "v0 output from a precise prompt — skeleton loader components"
            }
            loading="lazy"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Status pill — bottom-right of the preview */}
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
