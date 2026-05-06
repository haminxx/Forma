/**
 * Left-side hero copy modelled on Anthropic's homepage tagline pattern —
 * one large balanced sentence with two anchor words underlined in gold.
 * The anchors are placeholder hrefs (`#`) for now since the user hasn't
 * decided which page each should route to.
 */
const ANCHOR_BASE =
  "underline decoration-[#d4b87a] decoration-2 underline-offset-[6px] transition-colors duration-200 hover:text-[#d4b87a]";

export function HomeHero() {
  return (
    <div className="max-w-xl">
      <p className="text-xs font-medium uppercase tracking-[0.32em] text-[var(--color-stitch-fg-faint)]">
        Forma · beta UI
      </p>

      <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
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

      <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-stitch-fg-dim)] sm:text-lg">
        Forma turns vague UI words into precise, generation-ready vocabulary —
        so your prompts produce the component you actually meant.
      </p>
    </div>
  );
}
