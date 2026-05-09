import { DemoSplit } from "../components/DemoSplit";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { InstallSteps } from "../components/InstallSteps";
import { SolutionSection } from "../components/SolutionSection";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { PixelWave } from "../components/PixelWave";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { BlurText } from "../components/ui/blur-text";
import { FeatureShowcase } from "../components/ui/feature-showcase";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";
import { ScrollColorBackground } from "../components/ui/scroll-color-background";
import { EdgeGlow, SectionFade } from "../components/ui/section-fade";

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
 *   - The Problem section uses `ProblemTestimonial` — dot-pattern
 *     background, large quote with `TextRotate` word stagger, and
 *     attribution; animation replays when re-entering the viewport.
 *   - The Solution section uses SolutionSection — bento grid (individual
 *     builders) with shadcn-style cards.
 *   - The About section uses `FeatureShowcase` (left-column accordion
 *     + right-column tab images, gold theme).
 *   - The Docs section uses gold `GlowCard` spotlights for each card.
 *
 * Section boundaries are softened with two helpers from
 * `ui/section-fade`:
 *   - `SectionFade` paints a vertical page-bg gradient (with optional
 *     backdrop-blur) at section edges so distinctive backgrounds —
 *     primarily the Sandbox's gold radial — bleed into the page bg
 *     instead of ending at a hard horizontal line.
 *   - `EdgeGlow` paints a low-opacity gold radial bloom at the section
 *     edge with `mix-blend-mode: screen`. When two adjacent sections
 *     both place an `EdgeGlow` at the boundary, the blooms overlap and
 *     create the illusion of warmth flowing continuously across the
 *     divide. Used everywhere the bg is flat dark on both sides.
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
      {/* harmonic.ai-style fixed page background. Interpolates between
          eight palette stops as the user scrolls so every section seam
          is a continuous gradient instead of a hard boundary. */}
      <ScrollColorBackground />

      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-20 flex-col items-center overflow-hidden px-6"
        style={{
          paddingTop: "5.5rem",
          paddingBottom: "clamp(2rem, 6vh, 5rem)",
          justifyContent: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <PixelWave />
        </div>
        <div className="absolute inset-0 z-10">
          <InteractiveCanvas />
        </div>

        {/* seasa.com-style two-column hero: bigger left rail (text + CTA
            + stats) and a tighter right column for the visual. */}
        <div className="relative z-20 mx-auto w-full max-w-[min(98vw,92rem)]">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-x-10 md:gap-y-12">
            <div className="md:col-span-7 lg:col-span-7">
              <HomeHero />
            </div>
            <div className="md:col-span-5 lg:col-span-5 md:justify-self-end">
              <LoopingWords />
            </div>
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
        {/* Gold bloom at the home → demo seam — pairs with the
            EdgeGlow at demo's top so the warmth of the wave reads as
            continuous instead of cutting off at the fade. */}
        <EdgeGlow position="bottom" />
      </section>

      {/* Demo — eyebrow + H2 removed per the latest direction; the
          Vibe Coder / Forma User toggle inside DemoSplit now sits at
          the top-center as the only header for the section. */}
      <section
        id="demo"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(2rem,5vh,4rem)",
          paddingBottom: "clamp(2rem,5vh,4rem)",
          gap: "clamp(0.75rem,1.5vh,1.5rem)",
        }}
      >
        <EdgeGlow position="top" />
        <EdgeGlow position="bottom" />
        <Reveal duration={0.6} className="flex w-full justify-center">
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

        {/* Soft frosted fade at top + bottom — bleeds the gold radial
            into the page bg over a clamp(4rem..8rem) strip and frosts
            content scrolling past the boundary so the Demo→Sandbox
            and Sandbox→Problem transitions don't read as hard edges. */}
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

      {/* Problem — dot-pattern framed quote with gold pixel corners
          and a per-line stagger reveal. The TOP edge intentionally
          carries a stronger gold bloom (intensity ~2× default) so the
          warmth at the bottom of Sandbox reads as if it's continuing
          INTO Problem instead of stopping at the section seam — the
          harmonic.ai colour-bleed pattern. */}
      <section
        id="problem"
        className="relative flex min-h-screen scroll-mt-20 items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
        }}
      >
        <EdgeGlow position="top" intensity={0.12} height="clamp(8rem, 18vh, 14rem)" />
        <EdgeGlow position="bottom" intensity={0.1} />
        <ProblemTestimonial
          quotes={[
            "AI builders got dramatically better at generation — but the bottleneck moved upstream to specification quality. Generic prompts still produce generic components.",
          ]}
          attributions={[
            "The input-quality bottleneck — every builder ecosystem competes on output, but they all consume the same low-quality prompt inputs",
          ]}
        />
      </section>

      {/* Solution — full-gold backdrop. The user wants this section to
          read entirely as the warm half of the palette (the 30%), so
          the radial is dialled up to ~85% gold with only a small dark
          core for legibility behind the bento panel. The bottom fade
          still hands off to the cool/teal About+Docs tail. */}
      <section
        id="solution"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6 py-16"
        aria-label="Solution"
      >
        {/* Gold-dominant backdrop: warm gold fills the section with a
            soft dark vignette so card text retains contrast. */}
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

      {/* About — FeatureShowcase. Eyebrow + headline + accordion on
          the left, image-tab panel on the right.
          About is the first section in the cool/teal half of the
          palette (the 10% accent). A subtle teal radial sits behind
          the content; both EdgeGlows use `tone="accent"` so the
          Solution→About seam feels like one continuous gradient hand-
          off (teal bloom on Solution bottom + teal bloom on About top
          line up at the seam). */}
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
        <EdgeGlow position="top" tone="accent" intensity={0.1} height="clamp(8rem, 18vh, 14rem)" />
        <EdgeGlow position="bottom" tone="accent" intensity={0.08} />
        <FeatureShowcase
          eyebrow="Inside Forma"
          title="One GPU. Two model tiers. One product flow."
          description="Forma's freemium experience requires both inference paths to be live at the same time on the same backend. Llama 3.1 8B handles per-keystroke scoring for free users; Llama 3.1 70B AWQ powers the 7-agent deep analysis for Pro users. Both fit in 89 GiB of MI300X — H100 80GB cannot host both with usable concurrency."
          stats={["192 GiB HBM3", "89 GiB used · 102 GiB headroom", "vLLM · ROCm 7.0"]}
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

      {/* Docs — sticky 200 vh section closes the cool/teal tail of the
          palette. EdgeGlows now use the same `tone="accent"` as About
          so the About→Docs seam continues the cool half without
          dipping back through the warm gold. */}
      <section
        id="docs"
        className="relative scroll-mt-20"
        style={{ height: "200vh" }}
      >
        <div
          className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6"
          style={{ paddingTop: "clamp(3rem,8vh,6rem)", paddingBottom: "clamp(3rem,8vh,6rem)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_85%_at_50%_100%,rgba(94,177,191,0.22)_0%,#000_55%)]"
          />
          {/* EdgeGlow lives inside the sticky panel so the bloom moves
              with the visible viewport as the panel sticks during the
              200 vh scroll buffer. */}
          <EdgeGlow position="top" tone="accent" intensity={0.08} />
          <EdgeGlow position="bottom" tone="accent" intensity={0.06} />
          <DocsPanel />
        </div>
      </section>
    </div>
  );
}
