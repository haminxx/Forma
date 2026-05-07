import { DemoSplit } from "../components/DemoSplit";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { PixelWave } from "../components/PixelWave";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { FAQ1 as AboutFaq } from "../components/ui/faq-monochrome";
import { LogoCloud } from "../components/ui/logo-cloud";
import { TextRevealByWord } from "../components/ui/text-reveal";

/**
 * Each section is a full-screen page chunk that snaps into the viewport
 * (see `index.css` → scroll-snap). `scroll-mt-24` keeps section content
 * from sliding under the sticky top bar when an anchor is clicked.
 *
 * Section order:
 *   home → demo → sandbox → problem → solution → about → docs
 *
 * Home stacking (back → front):
 *   z-0  PixelWave        WebGL dithered gold wave covering the whole hero;
 *                          gold pixels naturally appear only where the wave
 *                          function is "lit", everywhere else is transparent.
 *   z-10 InteractiveCanvas gold dot+line cursor halo (no global field, so
 *                          the page reads as wave + bg, with extra gold
 *                          pixels following the mouse).
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
          // Just enough top padding to clear the sticky top bar (88 px),
          // no extra "empty band". Wave fills from the very top edge.
          paddingTop: "5.5rem",
          paddingBottom: "clamp(2rem, 6vh, 5rem)",
          justifyContent: "flex-start",
        }}
      >
        {/* Wave covers the entire hero. The shader only emits gold pixels
            where its wave function is above the dither threshold, so the
            top half is naturally transparent and the wave crest reads
            organically through the section. */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <PixelWave />
        </div>
        <div className="absolute inset-0 z-10">
          <InteractiveCanvas />
        </div>

        {/* Hero content sits flush below the top bar, no inner top margin. */}
        <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
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

      <section id="about" className="scroll-mt-20">
        <AboutFaq />
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
