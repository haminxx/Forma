import { BlurText } from "./ui/blur-text";

/**
 * Left-side hero copy. Identity matches the GitHub README:
 * "Grammarly for AI builder prompts. Built on AMD MI300X."
 *
 *   - Eyebrow blur-words in immediately on mount.
 *   - Title types in word-by-word with the per-word blur-in pattern from
 *     `animations/blurText.md`. The "AI builder prompts" anchor jumps
 *     to the live product (Chrome Web Store launch surface = README).
 *   - Subtitle blur-words in after the title underline draws.
 */
const ANCHOR_BASE =
  "underline decoration-white/40 decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-white";

const TITLE_BASE_DELAY = 0.085;
const TITLE_DURATION = 0.85;
// Title now reads: "Grammarly for AI builder prompts." (5 word-tokens)
const TITLE_TOKEN_COUNT = 5;
const TITLE_LAST_DELAY =
  (TITLE_TOKEN_COUNT - 1) * TITLE_BASE_DELAY + TITLE_DURATION;
const SUBTITLE_DELAY = TITLE_LAST_DELAY + 0.15;

export function HomeHero() {
  return (
    <div className="max-w-xl">
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
        className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]"
        style={{ color: "#d4b87a" }}
        content={[
          "Grammarly",
          "for",
          <a
            key="builders"
            href="https://forma-production-c800.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={ANCHOR_BASE}
            aria-label="Open the Forma live demo on Railway"
          >
            AI builder
          </a>,
          "prompts.",
        ]}
      />

      <BlurText
        as="p"
        startDelay={SUBTITLE_DELAY}
        baseDelay={0.04}
        duration={0.7}
        blur={8}
        y={10}
        className="mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
        content="Forma flags vague UI words as you type and rewrites them into canonical components with concrete motion and accessibility specs — so your prompts produce the component you actually meant."
      />
    </div>
  );
}
