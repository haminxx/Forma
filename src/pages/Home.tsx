import { DemoStage } from "../components/DemoStage";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { InstallSteps } from "../components/InstallSteps";
import { PaperShaderHero } from "../components/PaperShaderHero";
import { PoweredBy } from "../components/PoweredBy";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { SolutionSection } from "../components/SolutionSection";
import AnimatedGradientBackground from "../components/ui/animated-gradient-background";
import { BlurText } from "../components/ui/blur-text";
import { FeatureShowcase } from "../components/ui/feature-showcase";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";

/**
 * Section order:  home → demo → sandbox → problem → solution → about → docs
 *
 * Two shared-background wrappers replace the previous per-section
 * radial backdrops:
 *
 *   1. Hero block  (#home + #demo) — wrapped in one
 *      `AnimatedGradientBackground` (warm-gold spectrum, breathing).
 *   2. Lower block (#sandbox → #docs) — wrapped in one continuous
 *      vertical gradient that flows sandbox-gold → problem-deep →
 *      solution-gold → about-teal → docs-deep-teal with NO visible
 *      seam between any section. Each section keeps a *subtle* local
 *      tint overlay for character but no longer competes with a hard
 *      coloured backdrop.
 *
 * Every section uses `scroll-mt-24` (6rem ≈ 96px) so PillNav clicks
 * land the section's TOP cleanly below the floating navbar.
 */

const HEADING_BASE_DELAY = 0.07;
const HEADING_DURATION = 0.85;

function postHeadingDelay(tokenCount: number) {
  return (
    Math.max(0, tokenCount - 1) * HEADING_BASE_DELAY + HEADING_DURATION + 0.1
  );
}

// Shared backdrop for the entire lower flow (sandbox → docs). One
// long radial-stack gradient pinned to the wrapper so the user
// scrolls *through* one continuous colour band instead of crossing
// per-section colour seams.
const CONTINUOUS_LOWER_BG =
  "linear-gradient(180deg, " +
  // Sandbox top — bridges from home/demo gold tail
  "#1a1612 0%, " +
  "rgba(212,184,122,0.32) 6%, " +
  // Sandbox body — Forma gold halo
  "rgba(212,184,122,0.55) 12%, " +
  "rgba(120,95,45,0.55) 22%, " +
  // Problem — gold deepens to bronze
  "rgba(60,48,30,0.85) 30%, " +
  "rgba(150,120,70,0.40) 38%, " +
  // Solution — gold dome
  "rgba(212,184,122,0.65) 46%, " +
  "rgba(120,100,60,0.55) 56%, " +
  // About — warm fades into cool teal
  "rgba(60,80,90,0.50) 66%, " +
  "rgba(94,177,191,0.32) 74%, " +
  // Docs — deepest teal closes the page
  "rgba(46,126,140,0.30) 86%, " +
  "rgba(20,32,40,0.95) 100%)";

export function HomePage() {
  return (
    <div>
      {/* ╭─ Hero block: home + demo share one gold gradient bg ─╮ */}
      <div className="relative">
        <AnimatedGradientBackground breathing topOffset={-20} />

        <section
          id="home"
          className="relative z-10 scroll-mt-24"
          aria-label="Forma — Grammarly for AI builder prompts"
        >
          <PaperShaderHero />
        </section>

        {/* Demo — pulled up with -38vh so its sticky frame visually
            starts halfway through the home fold. The hero gradient
            bleeds straight through into the demo because both share
            the wrapper backdrop above. */}
        <section
          id="demo"
          className="relative z-10 scroll-mt-24"
          style={{ marginTop: "-38vh" }}
          aria-label="Demo"
        >
          <DemoStage />
        </section>
      </div>

      {/* Powered-by marquee — narrow dark band acting as a transition
          beat between the gold hero/demo block and the lower
          continuous-bg block. */}
      <PoweredBy />

      {/* ╭─ Lower flow: sandbox → docs share ONE backdrop ─╮ */}
      <div
        className="relative isolate"
        style={{ background: CONTINUOUS_LOWER_BG }}
      >
        {/* Sandbox — gold radial overlay (per latest direction sandbox
            keeps its own dedicated bright gold treatment as the
            exception). All other lower sections only carry a faint
            local tint so they read as one continuous band with
            sandbox. */}
        <section
          id="sandbox"
          className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-6"
          style={{
            paddingTop: "clamp(3rem,8vh,6rem)",
            paddingBottom: "clamp(3rem,8vh,6rem)",
            gap: "clamp(1rem,2.5vh,2rem)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#d4b87a_100%)]"
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

        {/* Problem — sits directly on the shared continuous backdrop.
            No local backdrop div: the wrapper gradient already paints
            the deep-gold band that this section is meant to occupy. */}
        <section
          id="problem"
          className="relative flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden px-6"
          style={{
            paddingTop: "clamp(3rem,8vh,6rem)",
            paddingBottom: "clamp(3rem,8vh,6rem)",
          }}
        >
          <div className="relative z-10 w-full">
            <ProblemTestimonial
              quotes={[
                "AI builders got dramatically better at generation — but the bottleneck moved upstream to specification quality. Generic prompts still produce generic components.",
              ]}
              attributions={[
                "The input-quality bottleneck — every builder ecosystem competes on output, but they all consume the same low-quality prompt inputs",
              ]}
            />
          </div>
        </section>

        {/* Solution — sits directly on the shared backdrop. */}
        <section
          id="solution"
          className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-6 py-16"
          aria-label="Solution"
        >
          <SolutionSection />
        </section>

        {/* About — eyebrow "Inside Forma" removed per latest direction;
            FeatureShowcase prop omitted so the badge above the headline
            no longer renders. */}
        <section
          id="about"
          className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-center overflow-hidden px-6"
          style={{
            paddingTop: "clamp(3rem,8vh,6rem)",
            paddingBottom: "clamp(3rem,8vh,6rem)",
          }}
        >
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
        </section>

        {/* Docs — sticky 200vh section closes the cool tail. The
            shared backdrop gradient already paints the deep teal band
            this section sits in, so there is no local backdrop here
            either. */}
        <section
          id="docs"
          className="relative scroll-mt-24"
          style={{ height: "200vh" }}
        >
          <div
            className="sticky top-24 flex h-[calc(100vh-6rem)] items-center justify-center overflow-hidden px-6"
            style={{
              paddingTop: "clamp(3rem,8vh,6rem)",
              paddingBottom: "clamp(3rem,8vh,6rem)",
            }}
          >
            <DocsPanel />
          </div>
        </section>
      </div>
    </div>
  );
}
