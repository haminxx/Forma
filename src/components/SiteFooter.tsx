import { NAV_ITEMS } from "./PillNav";
import { Reveal } from "./ui/reveal";

const handleNavClick = (sectionId: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const node = document.getElementById(sectionId);
  node?.scrollIntoView({ behavior: "smooth", block: "center" });
};

/**
 * Footer with two columns:
 *   1. Brand block (Forma word-mark + copyright + author credits).
 *   2. Right-aligned column: tagline sentence on top, section nav
 *      (Home → Docs) listed below the sentence.
 *
 * Animation: brand block + each nav row fades in as the footer
 * scrolls into view, with a small stagger so the eye lands on the
 * brand first and walks down the right column.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-[#0a0a0c] px-6 pb-12 pt-16 text-sm text-white/60">
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1fr_1.4fr]">
        <Reveal duration={0.55}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4b87a] text-[11px] font-bold text-black"
              >
                F
              </span>
              <span className="text-lg font-semibold tracking-tight">Forma</span>
            </div>
            <p className="text-xs leading-relaxed text-white/35">
              © 2026 Forma. Built by{" "}
              <a
                href="https://www.linkedin.com/in/christian-j-l/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/65 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white hover:decoration-[#d4b87a]"
              >
                Christian Lee
              </a>{" "}
              and{" "}
              <a
                href="https://www.linkedin.com/in/ryan-zhang-44533b1bb/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/65 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white hover:decoration-[#d4b87a]"
              >
                Ryan Zhang
              </a>
              .
            </p>
          </div>
        </Reveal>

        {/* Right column: tagline first, then the section nav listed
            below as a one-per-row list. md:items-end keeps the whole
            block right-aligned at desktop sizes. */}
        <div className="flex flex-col gap-6 md:items-end">
          <Reveal duration={0.55} delay={0.1}>
            <p className="max-w-md text-right leading-relaxed text-white/55">
              A real-time translation layer between human intent and the AI
              tools that build UI. Forma watches your prompts and silently
              suggests the precise vocabulary the model is actually waiting
              for.
            </p>
          </Reveal>

          <ul className="flex flex-col gap-2 md:items-end">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.id}>
                <Reveal delay={0.25 + index * 0.05} duration={0.4} as="span">
                  <a
                    href={`#${item.id}`}
                    onClick={handleNavClick(item.id)}
                    className="text-sm font-semibold text-white/80 transition-colors hover:text-[#d4b87a]"
                  >
                    {item.label}
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
