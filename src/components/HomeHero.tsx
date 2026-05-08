import { Reveal } from "./ui/reveal";
import { TypingHeading } from "./ui/typing-heading";

/**
 * Left-side hero copy.
 *   - Eyebrow fades in immediately on mount.
 *   - Title types in left → right with a clip-path wipe (anchor links
 *     and gold colour preserved), then a gold flourish underline draws.
 *   - Subtitle fades in after the wipe + underline finish.
 *
 * Anchor underlines invert (white on hover) so they pop against the
 * gold heading.
 */
const ANCHOR_BASE =
  "underline decoration-white/40 decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-white";

// Wipe + underline durations (must stay in sync with delays below).
const TITLE_WIPE = 1.4;
const TITLE_UL = 0.7;
const POST_TITLE = TITLE_WIPE * 0.85 + TITLE_UL + 0.15; // ≈ 2.04 s

export function HomeHero() {
  return (
    <div className="max-w-xl">
      <Reveal duration={0.55}>
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/45">
          Forma · beta UI
        </p>
      </Reveal>

      <TypingHeading
        as="h1"
        duration={TITLE_WIPE}
        underlineDuration={TITLE_UL}
        underlineWidth="min(18rem, 70%)"
        underlineGap="1rem"
        className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]"
        style={{ color: "#d4b87a" }}
      >
        Design language{" "}
        <a href="#" className={ANCHOR_BASE} aria-label="Read about Forma research (TBD)">
          research
        </a>{" "}
        and tools that put{" "}
        <a href="#" className={ANCHOR_BASE} aria-label="Read about Forma precision (TBD)">
          precision
        </a>{" "}
        at the frontier.
      </TypingHeading>

      <Reveal delay={POST_TITLE} duration={0.7}>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
          Forma turns vague UI words into precise, generation-ready vocabulary —
          so your prompts produce the component you actually meant.
        </p>
      </Reveal>
    </div>
  );
}
