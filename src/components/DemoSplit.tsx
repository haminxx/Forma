import { useState, useEffect, useRef } from "react";
import { PromptInput } from "./PromptInput";

// Rough, vague — two sentences typed the way someone describes a thing
// when they don't yet know the words for what they mean.
const VIBE_PROMPT =
  "make something that shows up while my app is loading data, just so it doesn't look empty";

// Same intent in ONE sentence using direct UI component terminology, a
// real anchor, motion spec, and the React library an LLM should reach
// for.
const FORMA_PROMPT =
  "Skeleton Loader with shimmer gradient sweep animation 1.5s infinite, matching the layout shape of the content being loaded, gray-200 base color";

/**
 * Side-by-side demo of the same intent expressed two different ways:
 *
 *   ┌─ Vibe Coder ──────────┐   ┌─ Forma User ──────────┐
 *   │ vague chatty prompt    │   │ precise UI vocab       │
 *   └────────────────────────┘   └────────────────────────┘
 *
 * Default (left) gradient = green→cyan→indigo, magic (right) = rose→
 * fuchsia→indigo. The credits banner from the user's PromptInput paste
 * is removed.
 */
export function DemoSplit() {
  const [left, setLeft] = useState(VIBE_PROMPT);
  const [right, setRight] = useState(FORMA_PROMPT);
  const [outputsVisible, setOutputsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setOutputsVisible(true), 800);
        }
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-6xl px-4">
      <div className="grid w-full gap-6 md:grid-cols-2 md:gap-8">
        <PromptInput
          variant="default"
          label="Vibe Coder"
          caption="vague intent"
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          placeholder="describe the thing you want…"
        />
        <PromptInput
          variant="magic"
          label="Forma User"
          caption="precise vocab"
          value={right}
          onChange={(e) => setRight(e.target.value)}
          placeholder="ask for the exact component, anchor, motion spec…"
        />
      </div>

      <div
        className={`my-8 flex flex-col items-center transition-all duration-700 ${
          outputsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
          v0 generates →
        </div>
        <div className="mt-2 h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-white/10" />
      </div>

      <div className="grid w-full gap-6 md:grid-cols-2 md:gap-8">
        <div
          className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-700 ${
            outputsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              VAGUE OUTPUT
            </div>
            <div className="text-[10px] text-white/30 font-mono">
              generic spinner
            </div>
          </div>
          <img
            src="/vague-output.png"
            alt="v0 output from vague prompt — generic loading state"
            className="w-full h-auto block"
          />
        </div>

        <div
          className={`relative overflow-hidden rounded-xl border border-[#d4b87a]/20 bg-[#d4b87a]/[0.02] transition-all duration-700 ${
            outputsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: outputsVisible ? "300ms" : "0ms" }}
        >
          <div className="flex items-center justify-between border-b border-[#d4b87a]/10 px-4 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#d4b87a]/80">
              PRECISE OUTPUT
            </div>
            <div className="text-[10px] text-[#d4b87a]/60 font-mono">
              skeleton with shimmer
            </div>
          </div>
          <img
            src="/precise-output.png"
            alt="v0 output from precise prompt — skeleton loader components"
            className="w-full h-auto block"
          />
        </div>
      </div>

      <div
        className={`mt-6 text-center text-xs text-white/40 transition-all duration-700 ${
          outputsVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: outputsVisible ? "600ms" : "0ms" }}
      >
        Same intent. Same model. Different vocabulary → dramatically different output.
      </div>
    </div>
  );
}
