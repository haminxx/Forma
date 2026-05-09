import { ArrowRight, Search } from "lucide-react";

import { BlurText } from "./ui/blur-text";

/**
 * Left-side hero block. Layout adopted from seasa.com:
 *   1. Eyebrow
 *   2. Big balanced title (Forma gold)
 *   3. Muted subtitle paragraph
 *   4. CTA row — disguised "search" input + primary action button
 *   5. Inline stats strip (3 small stats on a single rounded pill)
 *   6. Two big-number stat blocks side-by-side underneath
 *
 * Right column (LoopingWords) is rendered by Home.tsx as the visual
 * counterpart to seasa's hero photo.
 */
const TITLE_BASE_DELAY = 0.085;
const TITLE_DURATION = 0.85;
// Title reads: "Grammarly for AI builder prompts." (5 word-tokens)
const TITLE_TOKEN_COUNT = 5;
const TITLE_LAST_DELAY =
  (TITLE_TOKEN_COUNT - 1) * TITLE_BASE_DELAY + TITLE_DURATION;
const SUBTITLE_DELAY = TITLE_LAST_DELAY + 0.15;
const CTA_DELAY = SUBTITLE_DELAY + 0.35;
const STATS_DELAY = CTA_DELAY + 0.25;

export function HomeHero() {
  return (
    <div className="max-w-2xl">
      <BlurText
        as="p"
        baseDelay={0.05}
        duration={0.7}
        blur={8}
        y={10}
        className="text-xs font-medium uppercase tracking-[0.32em] text-white/45"
        content="Forma · Built on AMD MI300X"
      />

      <BlurText
        as="h1"
        baseDelay={TITLE_BASE_DELAY}
        duration={TITLE_DURATION}
        blur={14}
        y={18}
        underline
        underlineWidth="min(18rem, 70%)"
        underlineGap="1rem"
        className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]"
        style={{ color: "#d4b87a" }}
        content={["Grammarly", "for", "AI", "builder", "prompts."]}
      />

      <BlurText
        as="p"
        startDelay={SUBTITLE_DELAY}
        baseDelay={0.04}
        duration={0.7}
        blur={8}
        y={10}
        className="mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
        content="Forma flags vague UI words as you type and rewrites them into canonical components with concrete motion and accessibility specs."
      />

      {/* CTA row — disguised search/prompt input on the left, primary
          action on the right. Mirrors seasa's "Enter an address …
          Discover homes" composition. */}
      <div
        className="mt-7 max-w-lg animate-[fadeUp_0.7s_ease-out_both]"
        style={{ animationDelay: `${CTA_DELAY}s`, opacity: 0 }}
      >
        <form
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pl-4 backdrop-blur-md"
          onSubmit={(e) => {
            e.preventDefault();
            window.open(
              "https://forma-production-c800.up.railway.app/",
              "_blank",
              "noopener,noreferrer",
            );
          }}
        >
          <Search size={16} className="shrink-0 text-white/45" />
          <input
            type="text"
            placeholder="Try a vague prompt — e.g. 'popup that slides in'"
            aria-label="Try Forma with a vague prompt"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#d4b87a] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e2c890]"
          >
            Try Forma
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </form>
      </div>

      {/* Inline stats strip — three signals about scale on a single pill. */}
      <div
        className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#d4b87a]/30 bg-[#d4b87a]/10 px-4 py-1.5 text-[12px] font-medium text-[#d4b87a]/95 animate-[fadeUp_0.7s_ease-out_both]"
        style={{ animationDelay: `${STATS_DELAY}s`, opacity: 0 }}
      >
        <span>60 canonical UI terms</span>
        <span className="text-[#d4b87a]/40">·</span>
        <span>2 model tiers</span>
        <span className="text-[#d4b87a]/40">·</span>
        <span>192 GiB HBM3</span>
      </div>

      {/* Two big-number stat blocks under the strip. Mirrors seasa's
          "98% client satisfaction · 500+ active listings". */}
      <div
        className="mt-8 grid max-w-md grid-cols-2 gap-6 animate-[fadeUp_0.7s_ease-out_both]"
        style={{ animationDelay: `${STATS_DELAY + 0.1}s`, opacity: 0 }}
      >
        <Stat
          value="30 → 95"
          label="Prompt quality score"
          sub="One Accept rewrites the prompt"
        />
        <Stat
          value="89/192"
          unit="GiB used"
          label="One MI300X · two tiers"
          sub="8B + 70B AWQ concurrent"
        />
      </div>
    </div>
  );
}

interface StatProps {
  value: string;
  unit?: string;
  label: string;
  sub: string;
}

function Stat({ value, unit, label, sub }: StatProps) {
  return (
    <div>
      <p className="text-3xl font-bold tracking-tight tabular-nums text-white sm:text-4xl">
        {value}
        {unit ? (
          <span className="ml-1 text-base font-medium text-white/55">
            {unit}
          </span>
        ) : null}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-white/45">{sub}</p>
    </div>
  );
}
