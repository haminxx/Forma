import { DemoSplit } from "../components/DemoSplit";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { PixelWave } from "../components/PixelWave";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { SolutionReveal } from "../components/SolutionReveal";
import { LogoCloud } from "../components/ui/logo-cloud";

/**
 * Each section is a full-screen page chunk that snaps into the viewport
 * (see `index.css` → scroll-snap). `scroll-mt-24` keeps section content
 * from sliding under the sticky top bar when an anchor is clicked.
 *
 * Home stacking (back → front):
 *   z-0  PixelWave        gold pixel wave (animated, fills from crest down)
 *   z-10 InteractiveCanvas white dot field with mix-blend-mode: difference
 *                          → cursor area inverts dots/text/wave colour
 *   z-20 HomeHero + LoopingWords (text content)
 *   z-30 bottom-edge blur fade so the crest dissolves into the page
 */
export function HomePage() {
  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-24 flex-col justify-center overflow-hidden px-6 pb-40 pt-20"
      >
        <div className="absolute inset-0 z-0">
          <PixelWave />
        </div>
        <div className="absolute inset-0 z-10">
          <InteractiveCanvas />
        </div>

        <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
          <HomeHero />
          <div className="md:justify-self-end">
            <LoopingWords />
          </div>
        </div>

        {/* Bottom-edge blur: a thin band that softly blurs whatever is
            beneath it (gold pixels) and fades the section into black so
            the next screen feels like a soft hand-off rather than a hard
            cut. Sits above content so the gold crest dissolves under it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            background:
              "linear-gradient(180deg, rgba(25, 26, 31, 0) 0%, rgba(25, 26, 31, 0.55) 55%, rgba(25, 26, 31, 0.95) 100%)",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%)",
          }}
        />
      </section>

      <section
        id="problem"
        className="flex min-h-screen scroll-mt-24 items-center justify-center px-6 py-24"
      >
        <ProblemTestimonial
          quote="Building UI by prompt feels fast — until 'card' means six different things and you spend an hour clarifying which one you actually meant."
          highlightedText="six different things"
          authorName="The vibecoder problem"
          authorPosition="What we hear from teams every week"
        />
      </section>

      <section id="solution" data-snap-start className="scroll-mt-24">
        <SolutionReveal />
      </section>

      <section
        id="demo"
        className="flex min-h-screen scroll-mt-24 flex-col items-center justify-center gap-10 px-6 py-24"
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
        className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-end gap-10 px-6 pb-20 pt-32"
      >
        <InstallSteps />
        <GlassTextarea />
        <LogoCloud />
      </section>

      <section
        id="docs"
        className="flex min-h-screen scroll-mt-24 items-center justify-center px-6 py-24"
      >
        <DocsPanel />
      </section>
    </div>
  );
}
