import { DemoStage } from "../components/DemoStage";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { InstallSteps } from "../components/InstallSteps";
import { PaperShaderHero } from "../components/PaperShaderHero";
import { PoweredBy } from "../components/PoweredBy";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { SolutionSection } from "../components/SolutionSection";
import { BlurText } from "../components/ui/blur-text";
import { FeatureShowcase } from "../components/ui/feature-showcase";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";
import { EdgeGlow, SectionFade } from "../components/ui/section-fade";

/**
 * Section order:
 *   home → demo → sandbox → problem → solution → about → docs
 *
 * Palette:
 *   - Canvas: black / charcoal (60%).
 *   - Warm 30%: Forma gold (#d4b87a). Bridges sandbox-bottom into the
 *     problem and solution sections so all three read as one warm
 *     band. Solution caps the warm half with a deep gold panel.
 *   - Cool 10%: violet/blue accents in the home shader and the iso
 *     wave grid behind the problem testimonial; teal in About + Docs.
 *
 * Section choreography:
 *   - Home is now the PaperShaderHero (left text panel + right paper-
 *     design Dithering shader). Replaces the previous PixelWave +
 *     InteractiveCanvas + LoopingWords stack.
 *   - Demo: top-centered Vibe Coder / Forma User toggle (eyebrow + H2
 *     removed in a previous pass).
 *   - Sandbox: gold radial backdrop + InstallSteps + GlassTextarea +
 *     LogoCloud.
 *   - Problem: gold-bridge backdrop + IsoLevelWarp violet topographic
 *     animation behind the testimonial quote.
 *   - Solution: full gold backdrop + bento (cards capped to 140-150px
 *     so the whole grid fits in one viewport).
 *   - About / Docs: cool/teal tail of the palette via radial overlays
 *     and EdgeGlow `tone="accent"`.
 */

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
      {/* Home — the PaperShaderHero owns its own h-screen canvas. The
          AppShell navbar/brand are absolute/fixed (out of flow), so
          the section starts at y=0 of <main> and fills the viewport
          with no top gap and no negative-margin trick. */}
      <section
        id="home"
        className="relative scroll-mt-20"
        aria-label="Forma — Grammarly for AI builder prompts"
      >
        <PaperShaderHero />
      </section>

      {/* Demo — sticky peek-then-expand stage. The DemoStage's first
          paint at the top of #home (because of the 170vh shell + the
          sticky child) lets the cursor-style demo window peek up
          from below the home fold; as the user scrolls in, scale +
          translate animate the panel to its full size. */}
      <section
        id="demo"
        className="relative scroll-mt-20"
        aria-label="Demo"
      >
        <EdgeGlow position="top" />
        <EdgeGlow position="bottom" />
        <DemoStage />
      </section>

      {/* Powered by — scroll-driven horizontal name marquee. Moved
          from after #home to between #demo and #sandbox per the
          latest direction so the brand rail bridges the demo and
          the install/grid flow that follows. */}
      <PoweredBy />

      {/* Sandbox — gold radial. Bottom of the section bleeds gold into
          the Problem section's top, where the gold-bridge backdrop
          continues warmth all the way through Solution. */}
      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1rem,2.5vh,2rem)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#d4b87a_100%)]"
        />
        <SectionFade position="top" blur={6} />
        <SectionFade position="bottom" blur={6} />

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

      {/* Problem — gold-bridge backdrop carries the warm sandbox tone
          through into Solution. The IsoLevelWarp moving-line canvas
          was removed per the latest direction; the testimonial sits
          directly on the gold-bridge gradient. */}
      <section
        id="problem"
        className="relative flex min-h-screen scroll-mt-20 items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(212,184,122,0.92) 0%, rgba(150,120,70,0.65) 35%, rgba(60,48,30,0.85) 70%, rgba(25,26,31,0.95) 100%)",
          }}
        />
        <SectionFade position="top" blur={4} />
        <SectionFade position="bottom" blur={4} />
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

      {/* Solution — full gold backdrop. The bottom hands off to teal
          via an EdgeGlow whose top counterpart lives in About. */}
      <section
        id="solution"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6 py-16"
        aria-label="Solution"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 35%, rgba(212,184,122,0.92) 0%, rgba(212,184,122,0.78) 45%, rgba(120,100,60,0.70) 80%, rgba(25,26,31,0.85) 100%)",
          }}
        />
        <SectionFade position="top" blur={5} />
        <SectionFade position="bottom" blur={5} />
        <EdgeGlow position="bottom" tone="accent" intensity={0.08} />
        <SolutionSection />
      </section>

      {/* About — first cool/teal section. Teal radial + accent EdgeGlows
          on both edges so the Solution→About + About→Docs seams read
          as a single continuous cool tail. */}
      <section
        id="about"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_90%_at_50%_0%,rgba(94,177,191,0.32)_0%,#000_60%)]"
        />
        <EdgeGlow
          position="top"
          tone="accent"
          intensity={0.1}
          height="clamp(8rem, 18vh, 14rem)"
        />
        <EdgeGlow position="bottom" tone="accent" intensity={0.08} />
        <FeatureShowcase
          eyebrow="Inside Forma"
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

      {/* Docs — sticky 200 vh section closes the cool tail. */}
      <section
        id="docs"
        className="relative scroll-mt-20"
        style={{ height: "200vh" }}
      >
        <div
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6"
          style={{
            paddingTop: "clamp(3rem,8vh,6rem)",
            paddingBottom: "clamp(3rem,8vh,6rem)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_85%_at_50%_100%,rgba(94,177,191,0.22)_0%,#000_55%)]"
          />
          <EdgeGlow position="top" tone="accent" intensity={0.08} />
          <EdgeGlow position="bottom" tone="accent" intensity={0.06} />
          <DocsPanel />
        </div>
      </section>
    </div>
  );
}
