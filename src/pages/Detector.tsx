import { useEffect, useMemo, useRef, useState } from "react";
import { VagueTermTooltip } from "../components/VagueTermTooltip";
import {
  INITIAL_PROMPT,
  buildSegments,
  initialTermStates,
  replaceAllOccurrences,
  termDefinition,
  type Resolution,
} from "../lib/interceptHighlight";

const HOVER_CLOSE_MS = 160;

/** Shared typography/layout — must match between textarea and highlight mirror */
const EDITOR_CLASSES =
  "box-border min-h-[min(40vh,22rem)] w-full whitespace-pre-wrap break-words px-4 py-6 text-left text-[1.35rem] font-light leading-[1.65] tracking-tight sm:text-2xl sm:leading-relaxed";

export function DetectorPage() {
  const [text, setText] = useState(INITIAL_PROMPT);
  const [termStates, setTermStates] = useState<Record<string, Resolution>>(initialTermStates);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openPanel(termId: string) {
    clearCloseTimer();
    setActiveTermId(termId);
    setPanelOpen(true);
  }

  function scheduleClosePanel() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setPanelOpen(false);
      setActiveTermId(null);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_MS);
  }

  useEffect(() => () => clearCloseTimer(), []);

  const segments = useMemo(() => buildSegments(text, termStates), [text, termStates]);

  function syncMirrorScroll() {
    const ta = taRef.current;
    const mirror = mirrorRef.current;
    if (ta && mirror) mirror.scrollTop = ta.scrollTop;
  }

  function handleAccept() {
    if (!activeTermId) return;
    const def = termDefinition(activeTermId);
    if (!def) return;

    clearCloseTimer();
    setText((prev) => replaceAllOccurrences(prev, def.needle, def.replacement));
    setTermStates((s) => ({ ...s, [def.id]: "accepted" }));
    setPanelOpen(false);
    setActiveTermId(null);
  }

  function handleSkip() {
    const termId = activeTermId;
    if (!termId) return;

    clearCloseTimer();
    setTermStates((s) => ({ ...s, [termId]: "skipped" }));
    setPanelOpen(false);
    setActiveTermId(null);
  }

  function handleTermMouseDown(segStart: number, segEnd: number, termId: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(segStart, segEnd);
      openPanel(termId);
    };
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
          Phrase detector
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Sandbox
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Type freely. Amber marks vague UI words—hover for suggestions, Accept replaces all
          instances of that word, Skip hides the underline.
        </p>
      </div>

      <div className="relative mt-16 w-full max-w-3xl rounded-xl ring-1 ring-white/[0.08]">
        <textarea
          ref={taRef}
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          onScroll={syncMirrorScroll}
          className={`relative z-0 block overflow-auto bg-transparent text-transparent caret-zinc-100 outline-none ring-0 focus-visible:outline-none ${EDITOR_CLASSES}`}
          aria-label="Prompt compose — vague UI terms are highlighted above your caret"
        />

        <div
          ref={mirrorRef}
          className="pointer-events-none absolute inset-0 z-[1] overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-hidden
        >
          <div className={`pointer-events-none text-zinc-100 ${EDITOR_CLASSES}`}>
            {segments.map((seg, i) => {
              if (seg.kind === "text") {
                return (
                  <span key={`t-${i}`} className="pointer-events-none">
                    {seg.value}
                  </span>
                );
              }

              const underlineClass = seg.underline
                ? "border-b border-dashed border-amber-400 pb-[2px]"
                : "";

              const interactive = seg.underline && termStates[seg.termId] === "idle";

              if (!interactive) {
                return (
                  <span key={`term-${i}`} className="pointer-events-none whitespace-pre-wrap">
                    <span className={underlineClass}>{seg.value}</span>
                  </span>
                );
              }

              const showPanel = panelOpen && activeTermId === seg.termId;

              return (
                <span
                  key={`term-${i}`}
                  className="relative inline cursor-text align-baseline whitespace-pre-wrap"
                >
                  <span
                    className={`pointer-events-auto cursor-text ${underlineClass}`}
                    onMouseEnter={() => openPanel(seg.termId)}
                    onMouseLeave={scheduleClosePanel}
                    onMouseDown={handleTermMouseDown(seg.start, seg.end, seg.termId)}
                  >
                    {seg.value}
                  </span>

                  {showPanel ? (
                    <span className="pointer-events-auto absolute left-1/2 top-full z-50 block w-max -translate-x-1/2 pt-3">
                      <span
                        className="block"
                        onMouseEnter={() => openPanel(seg.termId)}
                        onMouseLeave={scheduleClosePanel}
                      >
                        {(() => {
                          const def = termDefinition(seg.termId);
                          return def ? (
                            <VagueTermTooltip
                              professionalTerm={def.professionalTerm}
                              category={def.category}
                              definition={def.definition}
                              alternatives={def.alternatives}
                              onAccept={handleAccept}
                              onSkip={handleSkip}
                            />
                          ) : null;
                        })()}
                      </span>
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
