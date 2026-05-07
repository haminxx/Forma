import { DemoSplit } from "../components/DemoSplit";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { PixelWave } from "../components/PixelWave";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { LogoCloud } from "../components/ui/logo-cloud";
import { TextRevealByWord } from "../components/ui/text-reveal";

/**
 * Each section is a full-screen page chunk that snaps into the viewport
 * (see `index.css` → scroll-snap). `scroll-mt-24` keeps section content
 * from sliding under the sticky top bar when an anchor is clicked.
 *
 * Home stacking (back → front):
 *   z-0  PixelWave        WebGL dithered gold wave (fine pxSize)
 *   z-10 InteractiveCanvas white dot field with mix-blend-mode: difference
 *                          → dots brighten near cursor; difference inverts beneath
 *   z-20 HomeHero + LoopingWords (text content)
 *   z-30 bottom-edge gradient fade (no backdrop-filter)
 */
export function HomePage() {
  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-20 flex-col items-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(2.5rem, 6vh, 4.5rem)",
          paddingBottom: "clamp(2rem, 6vh, 5rem)",
          justifyContent: "flex-start",
        }}
      >
        {/* Wave is anchored to the BOTTOM half of the home screen only —
            it rises from the bottom edge instead of filling the entire
            section. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 z-0">
          <PixelWave />
        </div>
        <div className="absolute inset-0 z-10">
          <InteractiveCanvas />
        </div>

        {/* Hero content lifted above the horizontal midline. Two columns:
            HomeHero on the left, LoopingWords on the right. */}
        <div
          className="relative z-20 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12"
          style={{ marginTop: "clamp(0.5rem, 4vh, 3rem)" }}
        >
          <HomeHero />
          <div className="md:justify-self-end">
            <LoopingWords />
          </div>
        </div>

        {/* Bottom-edge fade: gradient-only (no backdrop-filter) so scroll
            stays cheap — same dissolve of the wave into the page bg. */}
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

      <section
        id="problem"
        className="flex min-h-screen scroll-mt-20 items-center justify-center px-6"
        style={{ paddingTop: "clamp(3rem,8vh,6rem)", paddingBottom: "clamp(3rem,8vh,6rem)" }}
      >
        <ProblemTestimonial
          quotes={[
            "Building UI by prompt feels fast — until 'card' means six different things and you spend an hour clarifying which one you actually meant.",
            "Every team has a 'modal' that's actually a sheet, a dialog, and a popover all wearing the same name.",
            "The fastest way to ship the wrong component is to describe it in three vague words.",
          ]}
          attributions={[
            "The vibecoder problem — What we hear from teams every week",
            "The naming-collision problem — Same word, three implementations",
            "The vague-prompt problem — Precision beats speed",
          ]}
        />
      </section>

      <section id="solution" data-snap-start className="scroll-mt-20">
        <TextRevealByWord text="Forma turns vague text into precise visual UI components." />
      </section>

      <section
        id="demo"
        className="flex min-h-screen scroll-mt-20 flex-col items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1.5rem,3vh,2.5rem)",
        }}
      >
        <div className="w-full max-w-6xl px-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
            Demo · same intent, two prompts
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Watch the same idea land twice — once vague, once precise.
          </h2>
        </div>
        <DemoSplit />
      </section>

      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1rem,2.5vh,2rem)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Define the form.
          </h2>
          <p className="mt-3 text-base text-white/55 sm:text-lg">
            Test it on every web vibe-coding platform.
          </p>
        </div>
        <InstallSteps />
        <GlassTextarea />
        <LogoCloud />
      </section>

      <section
        id="docs"
        className="flex min-h-screen scroll-mt-20 items-center justify-center px-6"
        style={{ paddingTop: "clamp(3rem,8vh,6rem)", paddingBottom: "clamp(3rem,8vh,6rem)" }}
      >
        <DocsPanel />
      </section>
    </div>
  );
}
