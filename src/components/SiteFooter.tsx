import { NAV_ITEMS } from "./PillNav";

const SECTION_DESCRIPTIONS: Record<string, string> = {
  home: "Brand-level intro and the live cursor field that gives Forma its dark gold feel.",
  problem:
    "The vibecoder failure mode in one sentence — vague prompts, six different cards.",
  solution:
    "How Forma turns vague text into precise visual UI components, one scroll at a time.",
  about:
    "What Forma is, who it is for, and how design-language research turns into a real tool.",
  demo: "Side-by-side prompts that show the same intent before and after a vocab pass.",
  sandbox:
    "Install path, a real prompt textbox, and the eight platforms you can drop Forma into today.",
  docs: "Quickstart, vocabulary packs, and the brain CLI — the engineering surface area.",
};

const handleNavClick = (sectionId: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const node = document.getElementById(sectionId);
  node?.scrollIntoView({ behavior: "smooth", block: "center" });
};

/**
 * Footer with three columns:
 *   1. Brand block (Forma word-mark + tagline + copyright).
 *   2. Section nav — same six anchors as the PillNav, with a one-line
 *      description per item (random Forma-ish copy for now).
 *   3. Author credit row at the bottom: "Forma by [Christian Lee] and
 *      [Ryan Zhang]" linking each name to LinkedIn.
 *
 * No social icons (per spec) — the only outbound link in the brand
 * column is GitHub, which is already represented in the top bar.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-[#0a0a0c] px-6 pb-12 pt-16 text-sm text-white/60">
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1.1fr_2fr]">
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
          <p className="max-w-sm leading-relaxed text-white/55">
            A real-time translation layer between human intent and the AI
            tools that build UI. Forma watches your prompts and silently
            suggests the precise vocabulary the model is actually waiting
            for.
          </p>
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

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={handleNavClick(item.id)}
              className="group flex flex-col gap-1.5"
            >
              <span className="text-sm font-semibold text-white transition-colors group-hover:text-[#d4b87a]">
                {item.label}
              </span>
              <span className="text-xs leading-relaxed text-white/45 transition-colors group-hover:text-white/70">
                {SECTION_DESCRIPTIONS[item.id]}
              </span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
