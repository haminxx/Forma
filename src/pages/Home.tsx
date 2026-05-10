import { useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollDocumentToSectionWithRetries } from "../lib/scroll-section";
import { DemoStage } from "../components/DemoStage";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { InstallSteps } from "../components/InstallSteps";
import { PaperShaderHero } from "../components/PaperShaderHero";
import { PoweredBy } from "../components/PoweredBy";
import AnimatedGradientBackground, {
  cssInvertedHeroTrackBackdrop,
  HERO_RADIAL_DEFAULT_TOP_OFFSET,
} from "../components/ui/animated-gradient-background";
import { BlurText } from "../components/ui/blur-text";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";

/**
 * Section order:  home → demo → sandbox → docs
 *
 * Background architecture:
 *
 *   - `#demo` does **not** paint over the hero: a backdrop layer starts
 *     below the overlap band (~38vh) so the shared gold gradient reads
 *     continuously behind the floating card; the darker demo fill only
 *     covers the long scroll track beneath.
 *   - `#sandbox`: gold radial backdrop behind frosted prompts / LogoCloud.
 *   - `#docs`: same radial shape as sandbox, flipped vertically (anchor at
 *     bottom center) using the Forma accent blue `#5eb1bf` instead of gold.
 * Every anchored section defaults to `scroll-mt-24`; `#demo` and `#sandbox`
 * use larger scroll margins so pill navigation clears more of each block.
 */

/** Accent blue — mirrors sandbox gold radial, inverted (see `#docs`). */
const DOCS_RADIAL_FLIPPED_BLUE =
  "radial-gradient(125% 125% at 50% 90%, #000000 40%, #5eb1bf 100%)";

/** Dark filler for the demo **scroll track only** — bottom-anchored mirror of the hero radial (see `cssInvertedHeroTrackBackdrop`). */

/** Match `marginTop` on `#demo` — backdrop must not cover the pulled-up overlap. */
const DEMO_OVERLAP_CLEAR = "38vh";

const HEADING_BASE_DELAY = 0.07;
const HEADING_DURATION = 0.85;

function postHeadingDelay(tokenCount: number) {
  return (
    Math.max(0, tokenCount - 1) * HEADING_BASE_DELAY + HEADING_DURATION + 0.1
  );
}

export function HomePage() {
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  /** After SPA navigation from `/detector` or `/compare`, jump to anchored sections (`#demo`, `#sandbox`, etc.). */
  useEffect(() => {
    const st = (
      typeof location.state === "object" &&
      location.state !== null &&
      "scrollToSection" in location.state &&
      typeof (location.state as { scrollToSection?: unknown }).scrollToSection ===
        "string"
        ? (location.state as { scrollToSection: string }).scrollToSection
        : undefined
    ) as string | undefined;
    if (!st) return;

    const behave = reduceMotion ? "instant" : "smooth";
    const cancelRetries = scrollDocumentToSectionWithRetries(st, behave);

    const navTimer = window.setTimeout(() => {
      navigate(".", {
        replace: true,
        state: {},
        preventScrollReset: true,
      });
    }, 40);

    return () => {
      cancelRetries();
      window.clearTimeout(navTimer);
    };
  }, [location.state, navigate, reduceMotion]);

  return (
    <div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="sticky top-0 h-screen w-full">
            <AnimatedGradientBackground
              breathing={!reduceMotion}
              topOffset={HERO_RADIAL_DEFAULT_TOP_OFFSET}
            />
          </div>
        </div>

        <section
          id="home"
          className="relative z-10 scroll-mt-24"
          aria-label="Forma — Grammarly for AI builder prompts"
        >
          <PaperShaderHero />
        </section>

        <section
          id="demo"
          className="relative z-10 scroll-mt-36 md:scroll-mt-40 lg:scroll-mt-[10.5rem]"
          style={{ marginTop: `-${DEMO_OVERLAP_CLEAR}` }}
          aria-label="Demo"
        >
          {/* Backdrop begins *below* the hero overlap so it never cuts the
              animated gradient; top band stays visually continuous with home. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10"
            style={{
              top: DEMO_OVERLAP_CLEAR,
              background: cssInvertedHeroTrackBackdrop(),
            }}
          />
          <DemoStage />
        </section>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[28vh]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,12,0) 0%, rgba(10,10,12,0.55) 55%, rgba(10,10,12,1) 100%)",
          }}
        />
      </div>

      {/* Powered-by marquee — narrow dark band acting as a transition
          between the gold hero/demo block and the sandbox below. */}
      <PoweredBy />

      {/* Sandbox — gold radial bloom (readable behind frosted prompts + LogoCloud). */}
      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-36 flex-col items-center justify-center overflow-hidden px-6 md:scroll-mt-40 lg:scroll-mt-[10rem]"
        style={{
          paddingTop: "clamp(2rem,5.75vh,4.75rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#d4b87a_100%)]"
        />

        <div
          className="-translate-y-[clamp(0.65rem,1.75vh,2rem)] relative z-10 flex w-full flex-col items-center"
          style={{ gap: "clamp(1rem,2.5vh,2rem)" }}
        >
          <Reveal duration={0.7}>
            <div className="flex flex-col items-center text-center">
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
          </Reveal>

          <Reveal delay={0.05} duration={0.4}>
            <InstallSteps />
          </Reveal>
          <Reveal delay={0.1} duration={0.4}>
            <div className="-mt-1 sm:-mt-2">
              <GlassTextarea />
            </div>
          </Reveal>
          <Reveal delay={0.15} duration={0.4}>
            <LogoCloud />
          </Reveal>
        </div>
      </section>

      {/* Docs — same radial treatment as sandbox, flipped (bottom anchor) + accent blue. */}
      <section
        id="docs"
        className="relative z-10 scroll-mt-24"
        style={{ height: "200vh" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: DOCS_RADIAL_FLIPPED_BLUE }}
        />
        <div
          className="sticky top-24 z-10 flex h-[calc(100vh-6rem)] items-center justify-center overflow-hidden px-6"
          style={{
            paddingTop: "clamp(3rem,8vh,6rem)",
            paddingBottom: "clamp(3rem,8vh,6rem)",
          }}
        >
          <Reveal duration={0.7}>
            <DocsPanel />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
