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
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { SolutionSection } from "../components/SolutionSection";
import AnimatedGradientBackground, {
  cssInvertedHeroTrackBackdrop,
  HERO_RADIAL_DEFAULT_TOP_OFFSET,
} from "../components/ui/animated-gradient-background";
import { BlurText } from "../components/ui/blur-text";
import { FeatureShowcase } from "../components/ui/feature-showcase";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";
import { EdgeGlow } from "../components/ui/section-fade";

/**
 * Section order:  home → demo → sandbox → problem → solution → about → docs
 *
 * Background architecture:
 *
 *   - `#demo` does **not** paint over the hero: a backdrop layer starts
 *     below the overlap band (~38vh) so the shared gold gradient reads
 *     continuously behind the floating card; the darker demo fill only
 *     covers the long scroll track beneath.
 *   - Sandbox / Problem / Solution / About / Docs: each section has
 *     its own backdrop as usual.
 *
 * Every anchored section defaults to `scroll-mt-24`; `#demo` and `#sandbox`
 * use larger scroll margins so pill navigation clears more of each block.
 */

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

      {/* Problem — gold bridge with smooth handoff to solution (#121318). */}
      <section
        id="problem"
        className="relative flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(212,184,122,0.9) 0%, rgba(168,138,78,0.72) 22%, rgba(98,78,48,0.78) 52%, rgba(40,36,32,0.92) 78%, #121318 100%)",
          }}
        />
        <Reveal duration={0.7}>
          <ProblemTestimonial />
        </Reveal>
      </section>

      {/* Solution — radial gold keyed to problem’s lower base; exits cool-neutral. */}
      <section
        id="solution"
        className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-6 py-16"
        aria-label="Solution"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #121318 0%, rgba(55,48,36,0.85) 18%, rgba(212,184,122,0.58) 42%, rgba(175,145,90,0.45) 62%, rgba(38,36,34,0.95) 88%, #14151c 100%)",
          }}
        />
        <Reveal duration={0.7}>
          <SolutionSection />
        </Reveal>
      </section>

      {/* About + Docs — single shared “teal corridor” so the seam between
          sections stays one continuous field (no opposing radials). */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #14151c 0%, rgba(40,44,52,1) 8%, rgba(94,177,191,0.16) 16%, rgba(94,177,191,0.07) 26%, rgba(22,24,30,1) 38%, #15171e 48%, #12141a 56%, #101218 65%, rgba(94,177,191,0.09) 78%, rgba(94,177,191,0.14) 90%, #0c0e12 100%)",
          }}
        />
        <EdgeGlow
          position="top"
          tone="accent"
          intensity={0.055}
          height="clamp(5rem, 12vh, 10rem)"
        />

        <section
          id="about"
          className="relative z-10 flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-6"
          style={{
            paddingTop: "clamp(3rem,8vh,6rem)",
            paddingBottom: "clamp(3rem,8vh,6rem)",
          }}
        >
          <Reveal duration={0.7}>
            <FeatureShowcase
              title="One GPU. Two model tiers. One product flow."
              description="Forma's freemium experience requires both inference paths to be live at the same time on the same backend. Llama 3.1 8B handles per-keystroke scoring for free users; Llama 3.1 70B AWQ powers the 7-agent deep analysis for Pro users. Both fit in 89 GiB of MI300X — H100 80GB cannot host both with usable concurrency."
              stats={[
                "192 GiB HBM3",
                "89 GiB used · 102 GiB headroom",
                "vLLM · ROCm 7.0",
              ]}
              steps={[
                {
                  id: "free",
                  title: "Free tier — Llama 3.1 8B Instruct",
                  text:
                    "15.1 GiB weights, 11.2 GiB KV cache. Drives the inline score badge, /detect-vague offsets, and the Grammarly-style underline on every keystroke. 44× concurrent users at 2048-token max.",
                },
                {
                  id: "pro",
                  title: "Pro tier — Llama 3.1 70B AWQ-INT4",
                  text:
                    "37.3 GiB weights (4-bit quantized), 26.3 GiB KV cache. Runs the 7-agent consensus pipeline (Detector → Critic → Reformulator → Style → Memory → Coach → Consensus) and rewrites prompts with motion + a11y specs.",
                },
                {
                  id: "memory",
                  title: "Memory Engine — your style follows you",
                  text:
                    "Each accept teaches Forma your aesthetic. After 100 prompts, Forma knows you reach for Off-Canvas Drawer over Modal Overlay. That profile lives one level above any specific builder — switch from v0 to Cursor and your defaults come with you.",
                },
              ]}
              tabs={[
                {
                  value: "free",
                  label: "Free · 8B",
                  src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1280&q=80",
                  alt: "Real-time inline scoring on a developer workstation",
                },
                {
                  value: "pro",
                  label: "Pro · 70B",
                  src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80",
                  alt: "Multi-agent server stack",
                },
                {
                  value: "memory",
                  label: "Memory",
                  src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1280&q=80",
                  alt: "Personalized analytics dashboard",
                },
              ]}
              defaultTab="free"
              panelMinHeight={480}
            />
          </Reveal>
        </section>

        <section
          id="docs"
          className="relative z-10 scroll-mt-24"
          style={{ height: "200vh" }}
        >
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

        <EdgeGlow
          position="bottom"
          tone="accent"
          intensity={0.045}
          height="clamp(4rem, 10vh, 8rem)"
        />
      </div>
    </div>
  );
}
