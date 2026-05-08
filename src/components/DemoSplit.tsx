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
      {/* Tight grid — gap-3 on phones, gap-5 on md+ — so all four
          cards (2 prompts + 2 outputs) fit in a single viewport. */}
      <div className="grid w-full gap-3 md:grid-cols-2 md:gap-5">
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

      {/* Compact connector — 12 px stack instead of the old 64 px so
          the comparison row sits closer to the prompts and the whole
          demo fits ≈ 600 px tall. */}
      <div
        className={`my-3 flex flex-col items-center transition-all duration-700 ${
          outputsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
          v0 generates →
        </div>
        <div className="mt-1 h-5 w-px bg-gradient-to-b from-transparent via-white/30 to-white/10" />
      </div>

      <div className="grid w-full gap-3 md:grid-cols-2 md:gap-5">
        <div
          className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all duration-700 ${
            outputsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              VAGUE OUTPUT
            </div>
            <div className="text-[10px] text-white/30 font-mono">
              generic spinner
            </div>
          </div>
          {/* Fixed 16:10 aspect so both output cards have predictable
              heights regardless of source image dimensions. */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/20">
            <img
              src="/vague-output.png"
              alt="v0 output from vague prompt — generic loading state"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-xl border border-[#d4b87a]/20 bg-[#d4b87a]/[0.02] transition-all duration-700 ${
            outputsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: outputsVisible ? "300ms" : "0ms" }}
        >
          <div className="flex items-center justify-between border-b border-[#d4b87a]/10 px-3 py-1.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#d4b87a]/80">
              PRECISE OUTPUT
            </div>
            <div className="text-[10px] text-[#d4b87a]/60 font-mono">
              skeleton with shimmer
            </div>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#d4b87a]/[0.04]">
            <img
              src="/precise-output.png"
              alt="v0 output from precise prompt — skeleton loader components"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div
        className={`mt-3 text-center text-xs text-white/40 transition-all duration-700 ${
          outputsVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: outputsVisible ? "600ms" : "0ms" }}
      >
        Same intent. Same model. Different vocabulary → dramatically different output.
      </div>
    </div>
  );
}
