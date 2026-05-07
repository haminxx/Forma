/**
 * Left-side hero copy. Title now uses Forma's accent gold so the heading
 * reads as the section's anchor; the subtitle stays in the muted grey
 * scale. Anchor underlines invert (white on hover) so they pop against
 * the gold heading.
 */
const ANCHOR_BASE =
  "underline decoration-white/40 decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-white";

export function HomeHero() {
  return (
    <div className="max-w-xl">
      <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/45">
        Forma · beta UI
      </p>

      <h1
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
      </h1>

      <p className="mt-5 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
        Forma turns vague UI words into precise, generation-ready vocabulary —
        so your prompts produce the component you actually meant.
      </p>
    </div>
  );
}
