import { DemoSplit } from "../components/DemoSplit";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { PixelWave } from "../components/PixelWave";
import { ProblemQuote } from "../components/ProblemQuote";
import { BlurText } from "../components/ui/blur-text";
import { FeatureShowcase } from "../components/ui/feature-showcase";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";

/**
 * Section order:
 *   home → demo → sandbox → problem → solution → about → docs
 *
 * Choreography overview:
 *   - All headings + subtitles use `BlurText` (per-word blur-in,
 *     adopted from `animations/blurText.md`). Headings get a gold
 *     flourish underline that draws after the last word lands.
 *   - Cards / grids / interactive blocks use `Reveal` (one observer
 *     per block, fade-up).
 *   - The Problem section uses `ProblemQuote` — a dot-pattern framed
 *     statement with a per-line stagger reveal.
 *   - The Solution section is intentionally empty for now (placeholder
 *     while the new content is being written).
 *   - The About section uses `FeatureShowcase` (left-column accordion
 *     + right-column tab images, gold theme).
 *   - The Docs section uses gold `GlowCard` spotlights for each card.
 */

// Common per-word blur stagger values — used to compute the right
// post-heading delay so subtitles/content land AFTER the underline
// finishes drawing.
const HEADING_BASE_DELAY = 0.07;
const HEADING_DURATION = 0.85;

function postHeadingDelay(tokenCount: number) {
  return (
    Math.max(0, tokenCount - 1) * HEADING_BASE_DELAY + HEADING_DURATION + 0.1
  );
}

export function HomePage() {
  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-20 flex-col items-center overflow-hidden px-6"
        style={{
          paddingTop: "5.5rem",
          paddingBottom: "clamp(2rem, 6vh, 5rem)",
          justifyContent: "flex-start",
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <PixelWave />
        </div>
        <div className="absolute inset-0 z-10">
          <InteractiveCanvas />
        </div>

        <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
          <HomeHero />
          <div className="md:justify-self-end">
            <LoopingWords />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-56"
          style={{
            background:
              "linear-gradient(180deg, rgba(25, 26, 31, 0) 0%, rgba(25, 26, 31, 0.55) 50%, rgba(25, 26, 31, 0.98) 100%)",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 60%)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 60%)",
          }}
        />
      </section>

      {/* Demo — compact stage so the prompts row + outputs row both
          fit in one viewport. Tighter padding + tighter gap inside
          DemoSplit, with output cards on a fixed 16:10 aspect. */}
      <section
        id="demo"
        className="flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(2rem,5vh,4rem)",
          paddingBottom: "clamp(2rem,5vh,4rem)",
          gap: "clamp(0.75rem,1.5vh,1.5rem)",
        }}
      >
        <div className="w-full max-w-6xl px-4">
          <Reveal duration={0.5}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
              Demo · same intent, two prompts
            </span>
          </Reveal>
          <div className="mt-3">
            <BlurText
              as="h2"
              baseDelay={HEADING_BASE_DELAY}
              duration={HEADING_DURATION}
              underline
              underlineWidth="min(18rem, 65%)"
              className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl"
              content="Watch the same idea land twice — once vague, once precise."
            />
          </div>
        </div>
        <Reveal delay={postHeadingDelay(11)} duration={0.6}>
          <DemoSplit />
        </Reveal>
      </section>

      {/* Sandbox — single radial-gradient backdrop (gold instead of
          purple, adopted from the user-pasted `tailwind-css-background-snippet`).
          The graphic + image overlay are gone; we keep the chat-frame
          GlassTextarea (the "describe your UI component" textbox). */}
      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1rem,2.5vh,2rem)",
        }}
      >
        {/* Tailwind arbitrary background — black core fading to gold
            via a 125% × 125% radial pinned at 50% / 10%. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#d4b87a_100%)]"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <BlurText
            as="h2"
            align="center"
            baseDelay={HEADING_BASE_DELAY}
            duration={HEADING_DURATION}
            underline
            underlineWidth="min(10rem, 50%)"
            className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
            content="Define the form."
          />
          <BlurText
            as="p"
            align="center"
            startDelay={postHeadingDelay(3)}
            baseDelay={0.04}
            duration={0.65}
            blur={8}
            y={10}
            className="mt-3 text-base text-white/65 sm:text-lg"
            content="Test it on every web vibe-coding platform."
          />
        </div>
        <div
          className="relative z-10 flex w-full flex-col items-center"
          style={{ gap: "clamp(1rem,2.5vh,2rem)" }}
        >
          <Reveal delay={postHeadingDelay(3) + 0.5} duration={0.6}>
            <InstallSteps />
          </Reveal>
          <Reveal delay={postHeadingDelay(3) + 0.7} duration={0.6}>
            <GlassTextarea />
          </Reveal>
          <Reveal delay={postHeadingDelay(3) + 0.9} duration={0.6}>
            <LogoCloud />
          </Reveal>
        </div>
      </section>

      {/* Problem — dot-pattern framed quote with gold pixel corners
          and a per-line stagger reveal. */}
      <section
        id="problem"
        className="flex min-h-screen scroll-mt-20 items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <ProblemQuote />
      </section>

      {/* Solution — intentionally empty for now. Reserved screen so
          navigation anchors keep working until new content lands. */}
      <section
        id="solution"
        aria-hidden="true"
        className="min-h-screen scroll-mt-20"
      />

      {/* About — FeatureShowcase. Eyebrow + headline + accordion on
          the left, image-tab panel on the right. */}
      <section
        id="about"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <FeatureShowcase
          eyebrow="About Forma"
          title="Design-language research, shipped as a tool."
          description="Forma is a translation layer between human intent and the AI tools that build UI — opinionated, open, pointed at the precision frontier of generative interfaces."
          stats={["Open vocab packs", "Local CLI matcher", "Pro Mode templates"]}
          steps={[
            {
              id: "research",
              title: "Research the language",
              text:
                "We study how teams describe components in natural language and where the words break down — turning that into a precision map of UI vocabulary.",
            },
            {
              id: "vocab",
              title: "Ship open vocabulary packs",
              text:
                "Canonical UI terms, anchors, and motion specs in plain YAML. Start with the defaults, layer your team's pack on top.",
            },
            {
              id: "tooling",
              title: "Wire it into every surface",
              text:
                "A Rust matcher, a Chrome extension, and Pro Mode templates that translate vague prompts into production-ready briefs.",
            },
          ]}
          tabs={[
            {
              value: "research",
              label: "Research",
              src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1280&q=80",
              alt: "Type specimen and research notes",
            },
            {
              value: "vocab",
              label: "Vocabulary",
              src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1280&q=80",
              alt: "Source code on screen",
            },
            {
              value: "tooling",
              label: "Tooling",
              src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1280&q=80",
              alt: "Programming environment with multiple monitors",
            },
          ]}
          defaultTab="research"
          panelMinHeight={480}
        />
      </section>

      {/* Docs section sticks for 100 vh of scroll, then a 100 vh "lock"
          buffer must be cleared before the footer arrives — gives the
          deliberate "scroll once more to reach footer" feel. */}
      <section
        id="docs"
        className="relative scroll-mt-20"
        style={{ height: "200vh" }}
      >
        <div
          className="sticky top-0 flex h-screen items-center justify-center px-6"
          style={{ paddingTop: "clamp(3rem,8vh,6rem)", paddingBottom: "clamp(3rem,8vh,6rem)" }}
        >
          <DocsPanel />
        </div>
      </section>
    </div>
  );
}
