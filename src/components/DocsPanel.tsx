import { ArrowUpRight, Brain, Cpu, Github } from "lucide-react";
import { BlurText } from "./ui/blur-text";
import { GlowCard } from "./ui/spotlight-card";
import { Reveal } from "./ui/reveal";

/**
 * Docs section. Three live entry-points — every link goes to a real
 * surface in the deployed product (Railway live demo + GitHub repo)
 * matching the README's "Submission Details" anchors.
 */
type DocCard = {
  title: string;
  description: string;
  href: string;
  Icon: typeof Brain;
  meta: string;
};

const DOC_CARDS: DocCard[] = [
  {
    title: "AMD architecture",
    description:
      "Interactive VRAM bars, the dual-model concurrency math, and the SVG architecture diagram — the technical case for why Forma is structurally an MI300X product.",
    href: "https://forma-production-c800.up.railway.app/amd",
    Icon: Cpu,
    meta: "/amd · live",
  },
  {
    title: "Memory Engine",
    description:
      "Pro-tier showcase: the 70B AWQ inference path running real consensus on a personalised user history. The animation is real; the seed history is illustrative for now.",
    href: "https://forma-production-c800.up.railway.app/memory",
    Icon: Brain,
    meta: "/memory · pro tier",
  },
  {
    title: "Source on GitHub",
    description:
      "Chrome Manifest V3 extension, FastAPI backend, vLLM 0.17.1 on ROCm 7.0, and the canonical-60 vocabulary. README is the source of truth for what's real today.",
    href: "https://github.com/haminxx/Forma",
    Icon: Github,
    meta: "MIT · public",
  },
];

const HEADING_BASE_DELAY = 0.07;
const HEADING_DURATION = 0.85;
const HEADING_TOKENS = 7;
const POST_HEADING =
  (HEADING_TOKENS - 1) * HEADING_BASE_DELAY + HEADING_DURATION + 0.1;

export function DocsPanel() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="flex flex-col items-start gap-4">
        <Reveal duration={0.5}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
            Docs · AMD AI Hackathon · Track 1
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
          content="Read the source. Verify the architecture."
        />

        <BlurText
          as="p"
          startDelay={POST_HEADING}
          baseDelay={0.035}
          duration={0.7}
          blur={8}
          y={10}
          className="max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
          content="Forma is a working product, not a demo. Both inference paths run on production AMD MI300X hardware on DigitalOcean, with the FastAPI orchestrator deployed to Railway. The pages below are the live entry-points used in the hackathon submission."
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {DOC_CARDS.map(({ title, description, href, Icon, meta }, index) => (
          <Reveal key={title} delay={POST_HEADING + 0.4 + index * 0.12} duration={0.55}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full"
              aria-label={`Open ${title} docs in a new tab`}
            >
              <GlowCard
                glowColor="gold"
                customSize
                className="h-full min-h-[220px] w-full p-5 sm:p-6"
              >
                {/* Row 1 (1fr) — icon, arrow, title, description. */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/85 transition-colors group-hover:bg-[#d4b87a]/20 group-hover:text-[#d4b87a]">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.8}
                      className="text-white/35 transition-colors group-hover:text-white/85"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/60">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Row 2 (auto) — meta footer pinned to the bottom by
                    GlowCard's internal `grid-rows-[1fr_auto]`. */}
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                  {meta}
                </span>
              </GlowCard>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
