import { ArrowUpRight, BookOpen, GitBranch, Terminal } from "lucide-react";
import { BlurText } from "./ui/blur-text";
import { Reveal } from "./ui/reveal";

/**
 * Docs section placeholder. Three "starting point" cards (Quickstart,
 * Vocabulary packs, Brain CLI) plus a small "version" pill above the
 * heading. Pure copy + visual scaffolding for now.
 *
 * Animation: eyebrow + heading + subtitle blur-words in (per the
 * `animations/blurText.md` pattern), then cards stagger-Reveal in.
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

const HEADING_BASE_DELAY = 0.07;
const HEADING_DURATION = 0.85;
const HEADING_TOKENS = 8;
const POST_HEADING =
  (HEADING_TOKENS - 1) * HEADING_BASE_DELAY + HEADING_DURATION + 0.1;

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

        <BlurText
          as="h2"
          baseDelay={HEADING_BASE_DELAY}
          duration={HEADING_DURATION}
          blur={12}
          underline
          underlineWidth="min(16rem, 60%)"
          className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          content="Read the source. Then teach Forma your stack."
        />

        <BlurText
          as="p"
          startDelay={POST_HEADING}
          baseDelay={0.035}
          duration={0.7}
          blur={8}
          y={10}
          className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
          content="Forma's vocabulary lives in plain YAML, the matcher is a Rust crate you can call from a CLI, and every part of the pipeline can be replaced with one of your own. The pages below are the places most teams start."
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DOC_CARDS.map(({ title, description, href, Icon, meta }, index) => (
          <Reveal key={title} delay={POST_HEADING + 0.4 + index * 0.12} duration={0.55}>
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
