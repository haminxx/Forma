import { ArrowUp, BrainCog, FolderCode, Globe, Paperclip } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { FormaSuggestsCard, type Alternative } from "./FormaSuggestsCard";

/* ---------------------------------------------------------------------------
 * Demo phrases that cycle in the prompt box.
 * Each entry encodes: the casual prompt the user "types", the professional
 * Forma replacement, three suggested alternatives, and a short definition.
 * ------------------------------------------------------------------------ */
type DemoPhrase = {
  casual: string;
  professional: string;
  description: string;
  alternatives: readonly [Alternative, Alternative, Alternative];
};

const PHRASES: readonly DemoPhrase[] = [
  {
    casual: "Menu that slides out from the right",
    professional: "Off-Canvas Menu",
    description: "A menu that slides in from the viewport edge when triggered.",
    alternatives: [
      { title: "Slide-Out Menu", description: "A menu animating out from the screen edge." },
      { title: "Right-Side Menu", description: "A menu positioned on the right side of the viewport." },
      { title: "Hamburger Overlay", description: "A menu revealed by a hamburger icon." },
    ],
  },
  {
    casual: "Floating popup that shows on hover",
    professional: "Hover Tooltip",
    description: "A small floating panel revealed on pointer hover, dismissed on leave.",
    alternatives: [
      { title: "Coachmark", description: "A short instructional overlay anchored to a target." },
      { title: "Glassmorphic Modal", description: "A blurred floating window above the canvas." },
      { title: "Toast", description: "A transient message that auto-dismisses." },
    ],
  },
  {
    casual: "Loading thing with bouncing dots",
    professional: "Pulse Spinner",
    description: "An indeterminate progress indicator that pulses while a task runs.",
    alternatives: [
      { title: "Skeleton", description: "A grayed-out placeholder that mirrors content shape." },
      { title: "Progress Ring", description: "A circular determinate progress indicator." },
      { title: "Shimmer", description: "A traveling highlight on a placeholder block." },
    ],
  },
] as const;

/* ---------------------------------------------------------------------------
 * Animation phases — drive the entire demo loop.
 * ------------------------------------------------------------------------ */
type Phase =
  | "typing"
  | "pause-after-type"
  | "underline"
  | "popover-show"
  | "hold-casual"
  | "replace"
  | "hold-professional"
  | "popover-hide"
  | "reset";

const PHASE_DURATIONS_MS: Record<Exclude<Phase, "typing">, number> = {
  "pause-after-type": 450,
  underline: 850,
  "popover-show": 320,
  "hold-casual": 2400,
  replace: 200,
  "hold-professional": 1700,
  "popover-hide": 240,
  reset: 700,
};

const TYPE_SPEED_MS = 38;

type PromptDemoBoxProps = {
  className?: string;
};

/**
 * Non-interactive landing-page demo of Forma's prompt detector.
 *
 * Visually mirrors the PromptInputBox component (rounded warm-dark capsule,
 * attachment + Search/Think/Canvas pills, send button), but every control is
 * cosmetic — the box can't be focused or clicked. Instead, an internal phase
 * machine cycles forever:
 *
 *   typing  →  underline draws  →  FORMA SUGGESTS popover appears
 *           →  text replaced with the professional term
 *           →  popover fades, next phrase starts.
 *
 * The loop only runs while the demo is on-screen (IntersectionObserver) so it
 * doesn't burn CPU when the user has scrolled past the hero.
 */
export function PromptDemoBox({ className }: PromptDemoBoxProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [inView, setInView] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const typeTimerRef = useRef<number | null>(null);

  const phrase = PHRASES[phraseIndex] ?? PHRASES[0]!;

  /* ------------------------------------------------------------------ *
   * Pause the loop when the demo isn't visible.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* ------------------------------------------------------------------ *
   * Typing phase — tick one character at a time.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!inView || phase !== "typing") {
      if (typeTimerRef.current !== null) {
        window.clearInterval(typeTimerRef.current);
        typeTimerRef.current = null;
      }
      return;
    }

    typeTimerRef.current = window.setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= phrase.casual.length) {
          if (typeTimerRef.current !== null) {
            window.clearInterval(typeTimerRef.current);
            typeTimerRef.current = null;
          }
          setPhase("pause-after-type");
          return prev;
        }
        return prev + 1;
      });
    }, TYPE_SPEED_MS);

    return () => {
      if (typeTimerRef.current !== null) {
        window.clearInterval(typeTimerRef.current);
        typeTimerRef.current = null;
      }
    };
  }, [inView, phase, phrase.casual.length]);

  /* ------------------------------------------------------------------ *
   * Time-driven phases (everything except "typing").
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!inView) return;
    if (phase === "typing") return;

    const duration = PHASE_DURATIONS_MS[phase];

    phaseTimerRef.current = window.setTimeout(() => {
      switch (phase) {
        case "pause-after-type":
          setPhase("underline");
          break;
        case "underline":
          setPhase("popover-show");
          break;
        case "popover-show":
          setPhase("hold-casual");
          break;
        case "hold-casual":
          setPhase("replace");
          break;
        case "replace":
          setPhase("hold-professional");
          break;
        case "hold-professional":
          setPhase("popover-hide");
          break;
        case "popover-hide":
          setPhase("reset");
          break;
        case "reset":
          setTypedChars(0);
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
          setPhase("typing");
          break;
      }
    }, duration);

    return () => {
      if (phaseTimerRef.current !== null) {
        window.clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [phase, inView]);

  /* ------------------------------------------------------------------ *
   * Derived display state.
   * ------------------------------------------------------------------ */
  const showProfessional =
    phase === "replace" || phase === "hold-professional" || phase === "popover-hide";
  const showPopover =
    phase === "popover-show" ||
    phase === "hold-casual" ||
    phase === "replace" ||
    phase === "hold-professional" ||
    phase === "popover-hide";
  const showUnderline =
    phase === "underline" || phase === "popover-show" || phase === "hold-casual";
  const showCaret = phase === "typing" || phase === "pause-after-type";

  const displayedCasual = phrase.casual.slice(0, typedChars);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* The non-interactive prompt-input capsule. */}
      <div
        className="rounded-3xl border border-white/10 bg-white/[0.04] px-3 pt-3 pb-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl"
        role="presentation"
        aria-hidden="true"
      >
        {/* Pseudo-textarea row */}
        <div className="min-h-[44px] px-3 py-2.5 text-base">
          {showProfessional ? (
            <span className="text-[var(--color-forma-fg)]">{phrase.professional}</span>
          ) : (
            <>
              <span
                className={cn(
                  "text-[var(--color-forma-fg)]",
                  showUnderline && "forma-underline",
                )}
              >
                {displayedCasual}
              </span>
              {showCaret ? <span className="forma-caret" /> : null}
            </>
          )}
        </div>

        {/* Action row — visually identical to PromptInputBox, but inert. */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <DemoIconButton>
              <Paperclip className="h-5 w-5" />
            </DemoIconButton>

            <DemoPill icon={<Globe className="h-4 w-4" />} label="Search" />
            <DemoDivider />
            <DemoPill icon={<BrainCog className="h-4 w-4" />} label="Think" />
            <DemoDivider />
            <DemoPill icon={<FolderCode className="h-4 w-4" />} label="Canvas" />
          </div>

          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300",
              typedChars > 0
                ? "bg-[var(--color-forma-gold)] text-[#1a1612]"
                : "bg-transparent text-[var(--color-forma-muted)]",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* FORMA SUGGESTS popover, positioned beneath the input. */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-10 mt-4 -translate-x-1/2",
          showPopover ? "forma-popover-in" : "forma-popover-out",
        )}
        style={{ visibility: showPopover ? "visible" : "hidden" }}
        aria-hidden="true"
      >
        <FormaSuggestsCard
          professionalTerm={phrase.professional}
          description={phrase.description}
          alternatives={phrase.alternatives}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Tiny presentational sub-pieces — no interactive state, just decoration.
 * ------------------------------------------------------------------------ */

function DemoIconButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-forma-muted)]">
      {children}
    </div>
  );
}

function DemoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex h-8 items-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-[var(--color-forma-muted)]">
      <div className="flex h-5 w-5 items-center justify-center">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function DemoDivider() {
  return <div className="mx-1 h-5 w-px bg-[var(--color-forma-border)]" />;
}
