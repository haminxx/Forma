import { NAV_ITEMS } from "./PillNav";
import { Reveal } from "./ui/reveal";

const handleNavClick = (sectionId: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const node = document.getElementById(sectionId);
  node?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/**
 * Slim footer (latest direction):
 *   1. Brand + credits row     — F-badge + word-mark on the left,
 *                                © + author credits on the right
 *   2. Section nav menu        — Home → Docs as a horizontal flex-wrap
 *                                row directly UNDER the credits, so it
 *                                visually reads as a "menu sector"
 *                                attached to the credits line
 *   3. Tagline (optional)      — 2-line description at the bottom
 *
 * `mt-0` on the footer (was `mt-20`) removes the grey gap that used
 * to sit between the docs section's bottom and the footer's top.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-0 border-t border-white/10 bg-[#0a0a0c] px-6 pb-10 pt-10 text-sm text-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {/* Row 1: brand on the left, credits on the right */}
        <Reveal duration={0.55}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-white">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4b87a] text-[11px] font-bold text-black"
              >
                F
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Forma
              </span>
            </div>
            <p className="text-xs leading-relaxed text-white/40">
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

        {/* Row 2: section nav menu — directly under the credits line.
            flex-row + flex-wrap so the row reflows cleanly on narrow
            viewports without ever stacking vertically. */}
        <nav aria-label="Footer section navigation">
          <ul className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/5 pt-4">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.id}>
                <Reveal delay={0.1 + index * 0.04} duration={0.4} as="span">
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
        </nav>

        {/* Row 3: tagline. max-w-3xl + leading-snug renders this as a
            2-line paragraph at desktop widths instead of the previous
            3-line wrap. */}
        <Reveal duration={0.55} delay={0.2}>
          <p className="max-w-3xl text-sm leading-snug text-white/55">
            A real-time translation layer between human intent and the AI
            tools that build UI. Forma watches your prompts and silently
            suggests the precise vocabulary the model is actually waiting
            for.
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
