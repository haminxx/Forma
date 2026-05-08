import { BlurText } from "./ui/blur-text";

/**
 * Left-side hero copy.
 *   - Eyebrow blur-words in immediately on mount.
 *   - Title types in word-by-word with the per-word blur-in pattern from
 *     `animations/blurText.md`. Anchor links are passed as token nodes
 *     so they blur-in alongside the regular words while keeping their
 *     real `<a>` semantics + underline decoration.
 *   - Subtitle blur-words in after the title underline draws.
 */
const ANCHOR_BASE =
  "underline decoration-white/40 decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-white";

const TITLE_BASE_DELAY = 0.085;
const TITLE_DURATION = 0.85;
// Heuristic for when the title finishes — used to delay the subtitle so
// it lands AFTER the underline draws.
const TITLE_TOKEN_COUNT = 11;
const TITLE_LAST_DELAY =
  (TITLE_TOKEN_COUNT - 1) * TITLE_BASE_DELAY + TITLE_DURATION; // ≈ 1.7 s
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
        content="Forma · beta UI"
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
          "Design",
          "language",
          <a
            key="research"
            href="#"
            className={ANCHOR_BASE}
            aria-label="Read about Forma research (TBD)"
          >
            research
          </a>,
          "and",
          "tools",
          "that",
          "put",
          <a
            key="precision"
            href="#"
            className={ANCHOR_BASE}
            aria-label="Read about Forma precision (TBD)"
          >
            precision
          </a>,
          "at",
          "the",
          "frontier.",
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
        content="Forma turns vague UI words into precise, generation-ready vocabulary — so your prompts produce the component you actually meant."
      />
    </div>
  );
}
