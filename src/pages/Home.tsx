import { CursorInverter } from "../components/CursorInverter";
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
 * Each section is full-screen tall, snaps to the viewport (see
 * `index.css` → `scroll-snap-type: y mandatory`), and carries `scroll-mt-24`
 * so the sticky PillNav doesn't overlap section content when navigating.
 *
 * Home stacking (back → front):
 *   z-0  PixelWave        gold pixel wave (decoration, animated)
 *   z-10 InteractiveCanvas white dot field that reacts to cursor
 *   z-20 HomeHero + LoopingWords (text content)
 *   z-30 CursorInverter   small white circle, mix-blend-mode: difference
 *                          → inverts everything beneath it inside #home
 *
 * Because #home is `isolate`, the difference blend never leaks out of the
 * section. CursorInverter only paints when the cursor is inside #home.
 */
export function HomePage() {
  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-24 items-center overflow-hidden px-6 py-20 md:py-24"
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

        {/* Topmost layer — single small white circle that follows the cursor
            and inverts the area beneath it via `mix-blend-mode: difference`. */}
        <CursorInverter />
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

      <section id="solution" className="scroll-mt-24">
        <SolutionReveal />
      </section>

      <section id="demo" className="min-h-screen scroll-mt-24" />

      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-24 flex-col items-center justify-end gap-10 px-6 pb-20 pt-32"
      >
        <InstallSteps />
        <GlassTextarea />
        <LogoCloud />
      </section>

      <section id="docs" className="min-h-screen scroll-mt-24" />
    </div>
  );
}
