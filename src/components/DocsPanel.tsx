import { ArrowUpRight, BookOpen, GitBranch, Terminal } from "lucide-react";
import { Reveal } from "./ui/reveal";
import { TypingHeading } from "./ui/typing-heading";

/**
 * Docs section placeholder. Three "starting point" cards (Quickstart,
 * Vocabulary packs, Brain CLI) plus a small "version" pill above the
 * heading. Pure copy + visual scaffolding for now — the underlying docs
 * site is not built yet, so each card is a real link only when the
 * corresponding page exists; otherwise it falls back to GitHub.
 *
 * Animation: eyebrow + heading wipe + subtitle + cards stagger in when
 * the section enters view.
 */
type DocCard = {
  title: string;
  description: string;
  href: string;
  Icon: typeof BookOpen;
  meta: string;
};

const DOC_CARDS: DocCard[] = [
  {
    title: "Quickstart",
    description:
      "Install the extension, point it at your AI chat surface, and watch the suggestions surface in 30 seconds.",
    href: "https://github.com/haminxx/forma",
    Icon: BookOpen,
    meta: "5 min read",
  },
  {
    title: "Vocabulary packs",
    description:
      "Author your own UI dictionary in YAML, ship it as a pack, and let teammates layer it on top of the defaults.",
    href: "https://github.com/haminxx/forma/tree/main/packs",
    Icon: GitBranch,
    meta: "schema · examples",
  },
  {
    title: "Brain CLI",
    description:
      "A scriptable matcher you can run from any terminal — pipe a prompt in, get back the canonical UI vocabulary.",
    href: "https://github.com/haminxx/forma#brain-cli-harness-test-matcher-without-ui",
    Icon: Terminal,
    meta: "cargo run",
  },
];

const HEADING_WIPE = 1.2;
const HEADING_UL = 0.6;
const POST_HEADING = HEADING_WIPE * 0.85 + HEADING_UL + 0.1;

export function DocsPanel() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="flex flex-col items-start gap-4">
        <Reveal duration={0.5}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
            Docs · v0.0.1-alpha
          </span>
        </Reveal>

        <TypingHeading
          duration={HEADING_WIPE}
          underlineDuration={HEADING_UL}
          underlineWidth="min(16rem, 60%)"
          className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Read the source. Then teach Forma your stack.
        </TypingHeading>

        <Reveal delay={POST_HEADING} duration={0.6}>
          <p className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Forma's vocabulary lives in plain YAML, the matcher is a Rust crate
            you can call from a CLI, and every part of the pipeline can be
            replaced with one of your own. The pages below are the places
            most teams start.
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DOC_CARDS.map(({ title, description, href, Icon, meta }, index) => (
          <Reveal key={title} delay={POST_HEADING + 0.2 + index * 0.12} duration={0.55}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/80 transition-colors group-hover:bg-[#d4b87a]/20 group-hover:text-[#d4b87a]">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.8}
                  className="text-white/30 transition-colors group-hover:text-white/80"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {description}
                </p>
              </div>
              <span className="mt-auto text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                {meta}
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
