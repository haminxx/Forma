import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Eye,
  ExternalLink,
  Loader2,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { cn } from "../lib/cn";

/**
 * Forma demo window — IDE-style three-pane layout (sidebar / preview /
 * agent-panel) inspired by common AI-coding-tool window patterns.
 *
 * IMPORTANT: every word of copy, every task name, every prompt line,
 * every preview snippet, and every CSS class is Forma-original. No
 * content has been copied from any third-party site.
 *
 * Pane breakdown:
 *   - Left sidebar  (w-[260px]): "In Progress" + "Ready for Review"
 *     task lists drawn from Forma's actual pipeline — Detector,
 *     Memory Engine sync, Critic deep-pass, etc.
 *   - Centre pane:  Browser-frame preview of the rewritten output
 *     for the current `mode`. The Vibe-mode preview is a vague
 *     marketing copy stub; Forma-mode shows the *canonical
 *     component* (Off-Canvas Drawer) materialised with motion +
 *     a11y tokens labelled.
 *   - Right pane    (w-[340px]): live "agent transcript" — user
 *     prompt at top, Forma agent steps below (Read canonical-60,
 *     Run Detector, Generate alternatives, Done), prompt input
 *     pinned to the bottom.
 *
 * The macOS-style chrome (3 traffic lights, "Forma Sandbox" title,
 * tab-icon buttons) lives in this component; the macOS rounded
 * outer frame around the whole window comes from `DemoStage`.
 */

type Mode = "vibe" | "forma";

const VIBE_PROMPT = "Build a popup that slides in from the side";
const FORMA_PROMPT =
  "Build an Off-Canvas Drawer (slides from right edge, 320px width, 250ms ease-in-out, semi-transparent backdrop, focus-trap on open, ESC to dismiss)";

type TaskState = "running" | "ready";

interface SidebarTask {
  id: string;
  title: string;
  state: TaskState;
  meta: string;
  ageLabel?: string;
  diffAdd?: number;
  diffRemove?: number;
}

const SIDEBAR_TASKS_BY_MODE: Record<Mode, SidebarTask[]> = {
  vibe: [
    {
      id: "scan",
      title: "Scan prompt for vague terms",
      state: "running",
      meta: "Reading textarea",
    },
    {
      id: "score",
      title: "Quality score (8B Llama)",
      state: "running",
      meta: "Streaming · 28 / 100",
    },
    {
      id: "history",
      title: "Recent prompts",
      state: "ready",
      meta: "12 prompts this session",
      ageLabel: "now",
    },
  ],
  forma: [
    {
      id: "detector",
      title: "Detector agent",
      state: "ready",
      meta: "Found 1 vague phrase · slides in from the side",
      ageLabel: "now",
    },
    {
      id: "rewrite",
      title: "Reformulator + Style",
      state: "ready",
      meta: "Off-Canvas Drawer · motion + a11y attached",
      ageLabel: "0.4s",
      diffAdd: 5,
      diffRemove: 1,
    },
    {
      id: "memory",
      title: "Memory Engine sync",
      state: "ready",
      meta: "+1 to Off-Canvas Drawer preference",
      ageLabel: "0.5s",
    },
    {
      id: "critic",
      title: "Critic deep-pass (70B AWQ)",
      state: "running",
      meta: "Scoring against canonical-60",
    },
  ],
};

interface AgentStep {
  id: string;
  kind: "read" | "thought" | "edit" | "done";
  label: string;
  hint?: string;
  diffAdd?: number;
  diffRemove?: number;
}

const AGENT_STEPS_BY_MODE: Record<Mode, AgentStep[]> = {
  vibe: [
    { id: "v-read", kind: "read", label: "Read", hint: "raw prompt" },
    { id: "v-think", kind: "thought", label: "Thought", hint: "0.4s" },
    {
      id: "v-done",
      kind: "done",
      label:
        "Generic popup component. No motion spec, no focus-trap. Score 30 / 100.",
    },
  ],
  forma: [
    { id: "f-read1", kind: "read", label: "Read", hint: "canonical-60.yml" },
    {
      id: "f-read2",
      kind: "read",
      label: "Read",
      hint: "user-style-profile.md",
    },
    { id: "f-think", kind: "thought", label: "Thought", hint: "0.6s · 7 agents" },
    {
      id: "f-edit1",
      kind: "edit",
      label: "components/Drawer.tsx",
      diffAdd: 42,
      diffRemove: 0,
    },
    {
      id: "f-edit2",
      kind: "edit",
      label: "hooks/useFocusTrap.ts",
      diffAdd: 18,
      diffRemove: 0,
    },
    {
      id: "f-done",
      kind: "done",
      label:
        "Done. Off-Canvas Drawer with 250ms slide, focus-trap, ESC, semi-transparent backdrop. Score 95 / 100.",
    },
  ],
};

const PREVIEW_META: Record<
  Mode,
  { url: string; status: string }
> = {
  vibe: {
    url: "preview.forma.dev/vague",
    status: "score 30 / 100 · vague",
  },
  forma: {
    url: "preview.forma.dev/precise",
    status: "score 95 / 100 · precise",
  },
};

export function DemoSplit() {
  const [mode, setMode] = useState<Mode>("vibe");

  return (
    <div className="w-full max-w-[min(98vw,92rem)]">
      {/* Top-center toggle */}
      <div className="flex w-full justify-center">
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      {/* Window: macOS chrome + 3-pane body. Border tint shifts on
          mode so the user sees a confident "this is Forma now" cue. */}
      <div
        className={cn(
          "mt-4 flex h-[min(72vh,720px)] w-full flex-col overflow-hidden rounded-[14px] border bg-[#0d0e12] shadow-[0_28px_70px_rgba(0,0,0,0.45),0_14px_32px_rgba(0,0,0,0.30)] transition-colors duration-300 lg:mt-5",
          mode === "vibe"
            ? "border-white/[0.09]"
            : "border-[#d4b87a]/25",
        )}
      >
        {/* Window chrome */}
        <WindowChrome mode={mode} />

        {/* Body — 3 columns at lg+, stacks below */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <Sidebar mode={mode} />
          <PreviewPane mode={mode} />
          <AgentPanel mode={mode} />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-white/55">
        Same intent. Same model. Forma rewrites the prompt with
        canonical vocabulary + motion + a11y → score jumps from 30 to 95.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Mode toggle — segmented pill (sliding indicator)
// ─────────────────────────────────────────────────────────────────────

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
        aria-hidden
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

// ─────────────────────────────────────────────────────────────────────
// Window chrome (traffic lights + centre title + ··· menu)
// ─────────────────────────────────────────────────────────────────────

function WindowChrome({ mode }: { mode: Mode }) {
  return (
    <div
      className={cn(
        "relative flex h-8 flex-shrink-0 items-center justify-between border-b px-3",
        mode === "vibe" ? "border-white/[0.08]" : "border-[#d4b87a]/15",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/85" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/85" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/85" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center text-[12px] font-medium text-white/65">
        Forma Sandbox
      </div>
      <div className="flex items-center gap-0.5 text-white/55">
        <button
          type="button"
          aria-label="Settings"
          className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Left sidebar — task list ("In Progress" + "Ready for Review")
// ─────────────────────────────────────────────────────────────────────

function Sidebar({ mode }: { mode: Mode }) {
  const tasks = SIDEBAR_TASKS_BY_MODE[mode];
  const inProgress = tasks.filter((t) => t.state === "running");
  const ready = tasks.filter((t) => t.state === "ready");

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto bg-black/40 px-2 py-3 lg:w-[260px] lg:flex-shrink-0 lg:border-r",
        mode === "vibe" ? "lg:border-white/[0.08]" : "lg:border-[#d4b87a]/15",
      )}
    >
      {inProgress.length > 0 ? (
        <SidebarSection
          title="In Progress"
          count={inProgress.length}
          tasks={inProgress}
        />
      ) : null}
      {ready.length > 0 ? (
        <SidebarSection
          title="Ready for Review"
          count={ready.length}
          tasks={ready}
        />
      ) : null}
    </aside>
  );
}

function SidebarSection({
  title,
  count,
  tasks,
}: {
  title: string;
  count: number;
  tasks: SidebarTask[];
}) {
  return (
    <div className="mb-3">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
        {title} <span className="text-white/30">{count}</span>
      </div>
      <ul className="mt-0.5 flex flex-col">
        {tasks.map((task, i) => (
          <SidebarTaskRow key={task.id} task={task} delay={i * 0.06} />
        ))}
      </ul>
    </div>
  );
}

function SidebarTaskRow({ task, delay }: { task: SidebarTask; delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.22, 0.68, 0, 1] }}
      className="rounded-md px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
          {task.state === "running" ? (
            <Loader2
              size={13}
              className="animate-spin text-white/55"
              aria-hidden
            />
          ) : (
            <CheckCircle2
              size={13}
              className="text-[#d4b87a]/85"
              aria-hidden
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-[13px] text-white/85">
              {task.title}
            </span>
            {task.ageLabel ? (
              <span className="shrink-0 text-[10px] font-mono text-white/35">
                {task.ageLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {task.diffAdd !== undefined ? (
              <span className="font-mono text-[10px] tabular-nums text-emerald-400/80">
                +{task.diffAdd}
              </span>
            ) : null}
            {task.diffRemove !== undefined ? (
              <span className="font-mono text-[10px] tabular-nums text-rose-400/80">
                -{task.diffRemove}
              </span>
            ) : null}
            {task.diffAdd !== undefined || task.diffRemove !== undefined ? (
              <span className="text-[10px] text-white/30">·</span>
            ) : null}
            <span className="truncate text-[11px] text-white/45">
              {task.meta}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Centre — browser-frame preview pane
// ─────────────────────────────────────────────────────────────────────

function PreviewPane({ mode }: { mode: Mode }) {
  const meta = PREVIEW_META[mode];

  return (
    <div className="flex min-h-[300px] flex-1 flex-col bg-[#0a0b0e] lg:min-h-0">
      {/* Browser address bar */}
      <div className="flex h-9 flex-shrink-0 items-center gap-1.5 border-b border-white/[0.06] px-2">
        <button
          type="button"
          aria-label="Back"
          className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.06] hover:text-white/80"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          type="button"
          aria-label="Forward"
          className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.06] hover:text-white/80"
        >
          <ChevronRight size={13} />
        </button>
        <button
          type="button"
          aria-label="Reload"
          className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.06] hover:text-white/80"
        >
          <RefreshCw size={12} />
        </button>
        <div
          className={cn(
            "ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-mono transition-colors duration-300",
            mode === "vibe"
              ? "border-white/[0.08] bg-black/40 text-white/55"
              : "border-[#d4b87a]/20 bg-[#d4b87a]/[0.05] text-[#d4b87a]/85",
          )}
        >
          <Lock size={10} className="shrink-0 opacity-70" />
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
          className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/[0.06] hover:text-white/80"
        >
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Tab strip — Preview / Code */}
      <div className="flex flex-shrink-0 items-center gap-1 border-b border-white/[0.06] px-2 py-1.5">
        <span className="inline-flex items-center gap-1.5 rounded bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-white/85">
          <Eye size={11} /> Preview
        </span>
        <span className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-white/40 hover:bg-white/[0.04] hover:text-white/70">
          <Code2 size={11} /> Code
        </span>
      </div>

      {/* Preview body — actual rendered "output" of whichever mode is
          active. NO third-party content; both views are Forma-original
          mock product surfaces. */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "vibe" ? (
            <motion.div
              key="vibe-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-[#1a1c22] p-6"
            >
              <VaguePreview />
            </motion.div>
          ) : (
            <motion.div
              key="forma-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-[#0f1014] p-6"
            >
              <PrecisePreview />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score pill bottom-right */}
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
                  ? "border-white/15 bg-black/65 text-white/75"
                  : "border-[#d4b87a]/40 bg-black/65 text-[#d4b87a]",
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

/** Vibe-mode preview: a generic, vague-looking "popup" stub. */
function VaguePreview() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
      <div className="text-xs uppercase tracking-[0.32em] text-white/40">
        popup-ish
      </div>
      <div
        className="w-full max-w-sm rounded-xl border border-white/15 bg-white/[0.06] p-5 shadow-lg"
        role="dialog"
        aria-label="Vague popup preview"
      >
        <div className="h-3 w-2/3 rounded-full bg-white/30" />
        <div className="mt-3 h-2 w-5/6 rounded-full bg-white/15" />
        <div className="mt-1.5 h-2 w-4/6 rounded-full bg-white/15" />
        <div className="mt-5 flex gap-2">
          <span className="h-7 flex-1 rounded-md border border-white/10" />
          <span className="h-7 w-20 rounded-md bg-white/[0.08]" />
        </div>
      </div>
      <div className="text-[11px] text-white/45">
        No motion spec · no a11y tokens · no canonical name
      </div>
    </div>
  );
}

/** Forma-mode preview: an Off-Canvas Drawer materialised on the right
 *  edge of a faux app shell, with motion + a11y tokens called out. */
function PrecisePreview() {
  return (
    <div className="relative flex h-full w-full max-w-2xl items-stretch">
      {/* Faux app behind */}
      <div className="absolute inset-0 m-2 rounded-lg border border-white/[0.06] bg-[#13151b] p-4">
        <div className="h-3 w-32 rounded-full bg-white/15" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-12 rounded bg-white/[0.05]" />
          <div className="h-12 rounded bg-white/[0.05]" />
          <div className="h-12 rounded bg-white/[0.05]" />
        </div>
        <div className="mt-3 h-2 w-2/3 rounded-full bg-white/10" />
        <div className="mt-1.5 h-2 w-1/2 rounded-full bg-white/10" />
      </div>

      {/* Backdrop scrim */}
      <div className="absolute inset-0 m-2 rounded-lg bg-black/55 backdrop-blur-[1px]" />

      {/* Off-Canvas Drawer — slides in from right */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="absolute right-2 top-2 bottom-2 w-[58%] max-w-[320px] overflow-hidden rounded-lg border border-[#d4b87a]/30 bg-[#0d0e12] shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.6)]"
        role="dialog"
        aria-modal="true"
        aria-label="Off-Canvas Drawer preview"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4b87a]">
            Off-Canvas Drawer
          </span>
          <span className="text-[10px] font-mono text-white/40">ESC ⌫</span>
        </div>
        <div className="space-y-2 p-3">
          <div className="h-2 w-3/4 rounded-full bg-white/15" />
          <div className="h-2 w-2/3 rounded-full bg-white/10" />
          <div className="h-2 w-1/2 rounded-full bg-white/10" />

          <div className="mt-4 space-y-1.5">
            <SpecRow label="motion" value="250ms · ease-in-out" />
            <SpecRow label="anchor" value="right · 320px" />
            <SpecRow label="backdrop" value="semi-transparent" />
            <SpecRow label="a11y" value="focus-trap · aria-modal" />
          </div>
        </div>
      </motion.div>

      {/* Slide-in arrow indicator */}
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#d4b87a]/70"
      >
        slides ←
      </motion.div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-[#d4b87a]/15 bg-[#d4b87a]/[0.04] px-2 py-1 text-[10px]">
      <span className="font-mono text-[#d4b87a]/75">{label}</span>
      <span className="font-mono text-white/75">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Right — agent transcript + prompt input
// ─────────────────────────────────────────────────────────────────────

function AgentPanel({ mode }: { mode: Mode }) {
  const userPrompt = mode === "vibe" ? VIBE_PROMPT : FORMA_PROMPT;
  const steps = AGENT_STEPS_BY_MODE[mode];
  const [draft, setDraft] = useState("");

  // Re-trigger the per-step entry stagger when switching modes — this
  // gives the agent transcript its "fresh re-run" feel.
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [mode]);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-black/30 lg:w-[340px] lg:flex-shrink-0 lg:border-l",
        mode === "vibe" ? "lg:border-white/[0.08]" : "lg:border-[#d4b87a]/15",
      )}
    >
      {/* Panel title */}
      <div className="flex h-9 flex-shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 text-[11px] font-medium text-white/70">
        <Sparkles size={12} className="text-[#d4b87a]" />
        Forma Agent · Composer
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-3 py-3 text-[12px]">
        {/* User prompt bubble — sticky at top of scroll */}
        <div className="sticky top-0 z-10 -mt-3 bg-gradient-to-b from-black/80 to-transparent pb-2 pt-3">
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-[12px] leading-relaxed transition-colors duration-300",
              mode === "vibe"
                ? "border-white/[0.08] bg-white/[0.04] text-white/85"
                : "border-[#d4b87a]/30 bg-[#d4b87a]/[0.06] text-white",
            )}
          >
            {userPrompt}
          </div>
        </div>

        {/* Agent steps */}
        <ul className="mt-2 space-y-1.5" key={animKey}>
          {steps.map((step, i) => (
            <AgentStepRow key={step.id} step={step} delay={i * 0.07} />
          ))}
        </ul>
      </div>

      {/* Prompt input — pinned bottom */}
      <div className="flex-shrink-0 border-t border-white/[0.06] p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDraft("");
          }}
          className="flex flex-col gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] focus-within:border-[#d4b87a]/40 focus-within:bg-white/[0.05]"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={1}
            placeholder="Ask a follow-up…"
            aria-label="Follow-up prompt"
            className="w-full resize-none border-0 bg-transparent px-3 pt-2 text-[12px] text-white placeholder:text-white/35 focus:outline-none focus:ring-0"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/60">
                Agent
              </span>
              <span className="text-[10px] text-white/35">
                {mode === "vibe" ? "8B Llama" : "70B AWQ · 7 agents"}
              </span>
            </div>
            <button
              type="submit"
              disabled={draft.trim().length === 0}
              aria-label="Send follow-up"
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full transition-all",
                draft.trim().length === 0
                  ? "bg-white/[0.05] text-white/35"
                  : "bg-[#d4b87a] text-black hover:bg-[#e2c890]",
              )}
            >
              <Sparkles size={11} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AgentStepRow({ step, delay }: { step: AgentStep; delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 0.68, 0, 1] }}
      className="rounded-md px-1 py-1 text-left"
    >
      {step.kind === "read" || step.kind === "thought" ? (
        <div className="flex items-baseline gap-1.5 text-[11px] text-white/55">
          <span className="font-medium text-white/70">{step.label}</span>
          {step.hint ? (
            <span className="font-mono text-white/40">{step.hint}</span>
          ) : null}
        </div>
      ) : step.kind === "edit" ? (
        <div className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[11px]">
          <Code2 size={11} className="shrink-0 text-white/40" />
          <span className="min-w-0 flex-1 truncate font-mono text-white/80">
            {step.label}
          </span>
          {step.diffAdd !== undefined ? (
            <span className="font-mono text-[10px] tabular-nums text-emerald-400/80">
              +{step.diffAdd}
            </span>
          ) : null}
          {step.diffRemove !== undefined ? (
            <span className="font-mono text-[10px] tabular-nums text-rose-400/80">
              -{step.diffRemove}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-[12px] leading-relaxed text-white/80">
          {step.label}
        </div>
      )}
    </motion.li>
  );
}
