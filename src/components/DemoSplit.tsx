import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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
 * agent-panel) with a coordinated entrance animation:
 *
 *   1. typing   — the user prompt types into the bottom prompt input
 *   2. pushing  — the typed prompt is "sent": the input clears and a
 *                 floating bubble flies up to the transcript header
 *   3. thinking — agent steps stream in (Read / Thought / Edit) and
 *                 the preview pane progressively materialises
 *   4. ready    — everything visible, transcript scrollable, etc.
 *
 * The same flow re-runs whenever the user toggles between Vibe Coder
 * and Forma User. Vibe mode types a short prompt with **no** underline.
 * Forma mode types the same short line first, flashes an underline on
 * the vague phrase, then rewrites in-place into a long spec-rich
 * prompt before push → preview.
 */

type Mode = "vibe" | "forma";
type Phase =
  | "idle"
  | "typing"
  | "formaUnderline"
  | "formaRewrite"
  | "pushing"
  | "thinking"
  | "ready";

const VIBE_PROMPT = "Build a popup that slides in from the side";
/** Detailed rewrite after Forma highlights underline (size, structure, motion, tokens, files). */
const FORMA_LONG =
  "Off-Canvas Drawer — files: components/OffCanvasDrawer.tsx, hooks/useFocusTrap.ts; layout: fixed inset-y-0 right-0 w-[320px] max-w-[85vw] z-50 flex flex-col; motion: translateX(100%)→0 over 250ms cubic-bezier(0.22,1,0.36,1); structure: header (title + close), scroll body, footer CTAs; UI: Radix Dialog + shadcn Sheet patterns; colors: surface bg-zinc-950 #09090b, border border-white/10, text-zinc-50; backdrop bg-black/40; a11y: aria-modal role=dialog, focus-trap, initialFocus refs, ESC + overlay-dismiss.";

/** Phrase in `VIBE_PROMPT` that gets the temporary underline (Forma path only). */
const VIBE_UNDERLINE_PHRASE = "popup that slides in from the side";

const FORMA_UNDERLINE_DWELL_MS = 950;

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
      meta: "Found 1 vague phrase · popup / side",
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
        "Done. Off-Canvas Drawer: 320px rail, 250ms slide, focus-trap, ESC, backdrop. Score 95 / 100.",
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

// ─────────────────────────────────────────────────────────────────────
// Phase timing — each phase auto-advances after its dwell elapses.
// ─────────────────────────────────────────────────────────────────────

function getTypingDuration(text: string) {
  // ~22ms / char, clamped so neither the short nor long prompt drags.
  return Math.min(2400, Math.max(600, text.length * 22));
}
const PUSH_MS = 700;
const THINK_TAIL_MS = 600; // grace after agent steps before "ready"

export function DemoSplit() {
  const [mode, setMode] = useState<Mode>("vibe");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3, once: true });

  // Phase state machine: drives the entrance animation. Resets and
  // re-runs on mode toggle so each switch replays prompt → push →
  // think → ready.
  const [phase, setPhase] = useState<Phase>("idle");
  const [runId, setRunId] = useState(0);

  // Kick off the very first run when the demo scrolls into view.
  useEffect(() => {
    if (!inView) return;
    if (phase !== "idle") return;
    setPhase("typing");
  }, [inView, phase]);

  // Re-trigger the full phase pipeline whenever the user toggles mode.
  useEffect(() => {
    if (phase === "idle") return;
    setPhase("typing");
    setRunId((k) => k + 1);
    // Intentional: depend only on mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Auto-advance the phases on timers.
  useEffect(() => {
    if (phase === "idle") return;
    const steps = AGENT_STEPS_BY_MODE[mode];
    let timer: number | undefined;
    if (phase === "typing") {
      const dur = getTypingDuration(VIBE_PROMPT);
      timer = window.setTimeout(() => {
        if (mode === "forma") setPhase("formaUnderline");
        else setPhase("pushing");
      }, dur + 250);
    } else if (phase === "formaUnderline") {
      timer = window.setTimeout(
        () => setPhase("formaRewrite"),
        FORMA_UNDERLINE_DWELL_MS,
      );
    } else if (phase === "formaRewrite") {
      const dur = getTypingDuration(FORMA_LONG);
      timer = window.setTimeout(() => setPhase("pushing"), dur + 250);
    } else if (phase === "pushing") {
      timer = window.setTimeout(() => setPhase("thinking"), PUSH_MS);
    } else if (phase === "thinking") {
      const stepsTime = steps.length * 70 + 320;
      timer = window.setTimeout(
        () => setPhase("ready"),
        stepsTime + THINK_TAIL_MS,
      );
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [phase, mode, runId]);

  return (
    <div ref={rootRef} className="w-full max-w-[min(98vw,92rem)]">
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
        <div className="flex min-h-0 flex-1 flex-col bg-[#0d0e12] lg:flex-row">
          <Sidebar mode={mode} phase={phase} runId={runId} />
          <PreviewPane mode={mode} phase={phase} runId={runId} />
          <AgentPanel mode={mode} phase={phase} runId={runId} />
        </div>
      </div>
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
    <div className="relative inline-flex w-fit items-center rounded-full border border-white/15 bg-[#181a22] p-1">
      <motion.span
        aria-hidden
        className={cn(
          "absolute bottom-1 left-1 top-1 rounded-full transition-colors duration-300",
          mode === "vibe"
            ? "bg-[#2e313c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
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
        "relative flex h-8 flex-shrink-0 items-center justify-between border-b bg-[#0d0e12] px-3",
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

function Sidebar({
  mode,
  phase,
  runId,
}: {
  mode: Mode;
  phase: Phase;
  runId: number;
}) {
  const tasks = SIDEBAR_TASKS_BY_MODE[mode];
  const inProgress = tasks.filter((t) => t.state === "running");
  const ready = tasks.filter((t) => t.state === "ready");

  // Sidebar entries reveal alongside the agent thinking phase so the
  // window's three panes feel like a single coordinated boot.
  const visible = phase === "thinking" || phase === "ready";

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto bg-[#0a0b0e] px-2 py-3 lg:w-[260px] lg:flex-shrink-0 lg:border-r",
        mode === "vibe" ? "lg:border-white/[0.08]" : "lg:border-[#d4b87a]/15",
      )}
    >
      {visible ? (
        <>
          {inProgress.length > 0 ? (
            <SidebarSection
              title="In Progress"
              count={inProgress.length}
              tasks={inProgress}
              runId={runId}
            />
          ) : null}
          {ready.length > 0 ? (
            <SidebarSection
              title="Ready for Review"
              count={ready.length}
              tasks={ready}
              runId={runId}
            />
          ) : null}
        </>
      ) : (
        <SidebarSkeleton />
      )}
    </aside>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2 w-1/3 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-2 w-4/5 animate-pulse rounded-full bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

function SidebarSection({
  title,
  count,
  tasks,
  runId,
}: {
  title: string;
  count: number;
  tasks: SidebarTask[];
  runId: number;
}) {
  return (
    <div className="mb-3" key={runId}>
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

function PreviewPane({
  mode,
  phase,
  runId,
}: {
  mode: Mode;
  phase: Phase;
  runId: number;
}) {
  const meta = PREVIEW_META[mode];
  const previewVisible = phase === "thinking" || phase === "ready";

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
              ? "border-white/[0.08] bg-[#0a0b0e] text-white/55"
              : "border-[#d4b87a]/20 bg-[#0a0b0e] text-[#d4b87a]/85",
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
        <span className="inline-flex items-center gap-1.5 rounded bg-[#252a33] px-2 py-1 text-[11px] font-medium text-white/85">
          <Eye size={11} /> Preview
        </span>
        <span className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-white/40 hover:bg-[#1e2228] hover:text-white/70">
          <Code2 size={11} /> Code
        </span>
      </div>

      {/* Preview body — staged: shows a "rendering" placeholder while
          the agent is still thinking, then morphs into the actual
          output when phase enters `ready`. NO third-party content;
          both views are Forma-original mock product surfaces. */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!previewVisible ? (
            <motion.div
              key="preview-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center bg-[#0f1014]"
            >
              <PreviewWaiting />
            </motion.div>
          ) : mode === "vibe" ? (
            <motion.div
              key={`vibe-preview-${runId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-[#1a1c22] p-6"
            >
              <VaguePreview rendered={phase === "ready"} />
            </motion.div>
          ) : (
            <motion.div
              key={`forma-preview-${runId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-[#0f1014] p-6"
            >
              <PrecisePreview rendered={phase === "ready"} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score pill bottom-right — only after the preview fully
            renders, otherwise it leaks information ahead of the agent. */}
        <div className="pointer-events-none absolute bottom-3 right-3">
          <AnimatePresence mode="wait">
            {phase === "ready" ? (
              <motion.div
                key={meta.status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em]",
                  mode === "vibe"
                    ? "border-[#3d4350] bg-[#252830] text-white/80"
                    : "border-[#6b5c3a] bg-[#2a2418] text-[#d4b87a]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    mode === "vibe" ? "bg-[#d6d9e0]" : "bg-[#d4b87a]",
                  )}
                />
                {meta.status}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Visible while the agent is still pre-thinking. Communicates that
 *  the preview is intentionally blank, not broken. */
function PreviewWaiting() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative h-9 w-9">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#d4b87a]/20" />
        <span className="absolute inset-1 rounded-full border border-[#d4b87a]/40" />
      </div>
      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/35">
        awaiting agent
      </div>
    </div>
  );
}

/** Vibe-mode preview: a generic, vague-looking "popup" stub. The
 *  inner markup staggers in once `rendered` is true so the user sees
 *  the components actually drop into place. */
function VaguePreview({ rendered }: { rendered: boolean }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={
          rendered ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 4 }
        }
        transition={{ duration: 0.3 }}
        className="text-xs uppercase tracking-[0.32em] text-white/40"
      >
        popup-ish
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={
          rendered ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.96 }
        }
        transition={{ duration: 0.4, ease: [0.22, 0.68, 0, 1] }}
        className="w-full max-w-sm rounded-xl border border-[#3a3d4a] bg-[#1e2028] p-5 shadow-lg"
        role="dialog"
        aria-label="Vague popup preview"
      >
        <StaggeredBar delay={0.05} className="h-3 w-2/3 bg-white/30" />
        <StaggeredBar delay={0.12} className="mt-3 h-2 w-5/6 bg-white/15" />
        <StaggeredBar delay={0.17} className="mt-1.5 h-2 w-4/6 bg-white/15" />
        <div className="mt-5 flex gap-2">
          <StaggeredBar
            delay={0.22}
            className="h-7 flex-1 rounded-md border border-white/10 bg-transparent"
          />
          <StaggeredBar
            delay={0.26}
            className="h-7 w-20 rounded-md bg-white/[0.08]"
          />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: rendered ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-[11px] text-white/45"
      >
        No motion spec · no a11y tokens · no canonical name
      </motion.div>
    </div>
  );
}

/** Forma-mode preview: an Off-Canvas Drawer materialised on the right
 *  edge of a faux app shell, with motion + a11y tokens called out. */
function PrecisePreview({ rendered }: { rendered: boolean }) {
  return (
    <div className="relative flex h-full w-full max-w-2xl items-stretch">
      {/* Faux app behind */}
      <div className="absolute inset-0 m-2 rounded-lg border border-white/[0.06] bg-[#13151b] p-4">
        <StaggeredBar delay={0.05} className="h-3 w-32 bg-white/15" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StaggeredBar delay={0.1} className="h-12 rounded bg-white/[0.05]" />
          <StaggeredBar delay={0.13} className="h-12 rounded bg-white/[0.05]" />
          <StaggeredBar delay={0.16} className="h-12 rounded bg-white/[0.05]" />
        </div>
        <StaggeredBar delay={0.2} className="mt-3 h-2 w-2/3 bg-white/10" />
        <StaggeredBar delay={0.24} className="mt-1.5 h-2 w-1/2 bg-white/10" />
      </div>

      {/* Backdrop scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: rendered ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="absolute inset-0 m-2 rounded-lg bg-[#1c1e24]"
      />

      {/* Off-Canvas Drawer — slides in from right once rendered. */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: rendered ? 0 : "100%" }}
        transition={{ duration: 0.42, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
          <StaggeredBar delay={0.55} className="h-2 w-3/4 bg-white/15" />
          <StaggeredBar delay={0.6} className="h-2 w-2/3 bg-white/10" />
          <StaggeredBar delay={0.65} className="h-2 w-1/2 bg-white/10" />

          <div className="mt-4 space-y-1.5">
            <SpecRow
              label="motion"
              value="250ms · ease-in-out"
              delay={0.72}
              rendered={rendered}
            />
            <SpecRow
              label="anchor"
              value="right · 320px"
              delay={0.78}
              rendered={rendered}
            />
            <SpecRow
              label="backdrop"
              value="semi-transparent"
              delay={0.84}
              rendered={rendered}
            />
            <SpecRow
              label="a11y"
              value="focus-trap · aria-modal"
              delay={0.9}
              rendered={rendered}
            />
          </div>
        </div>
      </motion.div>

      {/* Slide-in arrow indicator */}
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={rendered ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
        transition={{ duration: 0.4, delay: 0.55 }}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#d4b87a]/70"
      >
        slides ←
      </motion.div>
    </div>
  );
}

function StaggeredBar({
  delay,
  className,
}: {
  delay: number;
  className: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.4 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 0.68, 0, 1] }}
      style={{ transformOrigin: "left center" }}
      className={cn("rounded-full", className)}
    />
  );
}

function SpecRow({
  label,
  value,
  delay,
  rendered,
}: {
  label: string;
  value: string;
  delay: number;
  rendered: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={rendered ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between rounded border border-[#5a4d30] bg-[#1f1c16] px-2 py-1 text-[10px]"
    >
      <span className="font-mono text-[#d4b87a]/75">{label}</span>
      <span className="font-mono text-white/75">{value}</span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Right — agent transcript + prompt input (entrance-animated)
// ─────────────────────────────────────────────────────────────────────

function AgentPanel({
  mode,
  phase,
  runId,
}: {
  mode: Mode;
  phase: Phase;
  runId: number;
}) {
  const finalPrompt = mode === "vibe" ? VIBE_PROMPT : FORMA_LONG;
  const steps = AGENT_STEPS_BY_MODE[mode];
  const [draft, setDraft] = useState("");

  const twVibe = useTypewriter(
    VIBE_PROMPT,
    phase === "typing" && mode === "vibe",
    runId,
  );
  const twFormaShort = useTypewriter(
    VIBE_PROMPT,
    phase === "typing" && mode === "forma",
    runId,
  );
  const twFormaLong = useTypewriter(FORMA_LONG, phase === "formaRewrite", runId);

  const userBubbleVisible =
    phase === "pushing" || phase === "thinking" || phase === "ready";
  const stepsVisible = phase === "thinking" || phase === "ready";

  const underlineIdx = VIBE_PROMPT.indexOf(VIBE_UNDERLINE_PHRASE);
  const formaUnderlineBlock =
    underlineIdx >= 0 ? (
      <span className="text-white/85">
        {VIBE_PROMPT.slice(0, underlineIdx)}
        <span className="forma-vague-underline">
          {VIBE_UNDERLINE_PHRASE}
        </span>
        {VIBE_PROMPT.slice(underlineIdx + VIBE_UNDERLINE_PHRASE.length)}
      </span>
    ) : (
      <span className="text-white/85">{VIBE_PROMPT}</span>
    );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-[#0b0c10] lg:w-[340px] lg:flex-shrink-0 lg:border-l",
        mode === "vibe" ? "lg:border-white/[0.08]" : "lg:border-[#d4b87a]/15",
      )}
    >
      {/* Panel title */}
      <div className="flex h-9 flex-shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0b0c10] px-3 text-[11px] font-medium text-white/70">
        <Sparkles size={12} className="text-[#d4b87a]" />
        Forma Agent · Composer
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto bg-[#0b0c10] px-3 py-3 text-[12px]">
        {/* User prompt bubble — sticky at top of scroll. Hidden until
            the prompt has been "sent" in the pushing phase. */}
        <div className="sticky top-0 z-10 -mt-3 bg-[#0b0c10] pb-2 pt-3">
          <AnimatePresence>
            {userBubbleVisible ? (
              <motion.div
                key={`bubble-${runId}`}
                layoutId={`prompt-bubble-${runId}`}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.42,
                  ease: [0.22, 0.68, 0, 1],
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-[12px] leading-relaxed transition-colors duration-300",
                  mode === "vibe"
                    ? "border-white/[0.08] bg-[#14151c] text-white/85"
                    : "border-[#d4b87a]/30 bg-[#1a1814] text-white",
                )}
              >
                <PromptText mode={mode} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Agent steps — only stream once thinking phase begins. */}
        <ul className="mt-2 space-y-1.5" key={`steps-${runId}`}>
          {stepsVisible
            ? steps.map((step, i) => (
                <AgentStepRow key={step.id} step={step} delay={i * 0.07} />
              ))
            : null}
        </ul>
      </div>

      {/* Prompt input — pinned bottom */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#0b0c10] p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDraft("");
          }}
          className={cn(
            "flex flex-col gap-1.5 rounded-lg border bg-[#12141a] transition-colors",
            phase === "pushing"
              ? "border-[#d4b87a]/60 bg-[#1a1c24] shadow-[0_0_0_3px_rgba(212,184,122,0.15)]"
              : "border-white/[0.08] focus-within:border-[#d4b87a]/40 focus-within:bg-[#151720]",
          )}
        >
          {phase === "typing" ? (
            <div className="px-3 pt-2 pb-1 text-[12px] text-white/85">
              {mode === "vibe" ? twVibe : twFormaShort}
              <span className="ml-0.5 inline-block h-3 w-[1px] animate-pulse bg-[#d4b87a] align-middle" />
            </div>
          ) : phase === "formaUnderline" ? (
            <div className="px-3 pt-2 pb-1 text-[12px] leading-relaxed">
              {formaUnderlineBlock}
            </div>
          ) : phase === "formaRewrite" ? (
            <div className="px-3 pt-2 pb-1 text-[12px] leading-relaxed text-white/90">
              {twFormaLong}
              <span className="ml-0.5 inline-block h-3 w-[1px] animate-pulse bg-[#d4b87a] align-middle" />
            </div>
          ) : phase === "pushing" ? (
            <motion.div
              key={`pushing-${runId}`}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "px-3 pt-2 pb-1 text-[12px]",
                mode === "vibe" ? "text-white/85" : "text-white",
              )}
            >
              {finalPrompt}
            </motion.div>
          ) : (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={1}
              placeholder="Ask a follow-up…"
              aria-label="Follow-up prompt"
              className="w-full resize-none border-0 bg-transparent px-3 pt-2 text-[12px] text-white placeholder:text-white/35 focus:outline-none focus:ring-0"
            />
          )}
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#1e2026] px-2 py-0.5 text-[10px] font-medium text-white/60">
                Agent
              </span>
              <span className="text-[10px] text-white/35">
                {mode === "vibe" ? "8B Llama" : "70B AWQ · 7 agents"}
              </span>
            </div>
            <button
              type="submit"
              disabled={draft.trim().length === 0 || phase !== "ready"}
              aria-label="Send follow-up"
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full transition-all",
                phase === "pushing"
                  ? "bg-[#d4b87a] text-black"
                  : draft.trim().length === 0 || phase !== "ready"
                    ? "bg-[#1e2026] text-white/35"
                    : "bg-[#d4b87a] text-black hover:bg-[#e2c890]",
              )}
            >
              <Sparkles
                size={11}
                className={phase === "pushing" ? "animate-pulse" : ""}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Final prompt shown in the transcript bubble after send. */
function PromptText({ mode }: { mode: Mode }) {
  return (
    <span className="block">
      {mode === "vibe" ? VIBE_PROMPT : FORMA_LONG}
    </span>
  );
}

/** Tiny typewriter hook: returns the substring of `text` revealed so
 *  far. Resets to empty whenever `runId` changes. */
function useTypewriter(text: string, active: boolean, runId: number) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!active) return;
    const dur = getTypingDuration(text);
    const perChar = dur / Math.max(1, text.length);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
      }
    }, perChar);
    return () => window.clearInterval(id);
  }, [text, active, runId]);
  return shown;
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
        <div className="flex items-center gap-1.5 rounded border border-[#31343f] bg-[#1a1c22] px-2 py-1.5 text-[11px]">
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
        <div className="rounded border border-[#2c2f38] bg-[#16181f] px-2 py-1.5 text-[12px] leading-relaxed text-white/80">
          {step.label}
        </div>
      )}
    </motion.li>
  );
}
