import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { HomeWave } from "../components/HomeWave";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { SolutionReveal } from "../components/SolutionReveal";
import { LogoCloud } from "../components/ui/logo-cloud";

/**
 * Each section is full-screen tall and carries `scroll-mt-24` so the sticky
 * PillNav doesn't overlap the section heading on click-to-scroll.
 *
 * Home: two-column layout — Anthropic-style hero copy on the left, looping
 * UI vocabulary on the right, with the InteractiveCanvas dot field as a
 * full-section overlay (mix-blend-mode: difference — the cursor area
 * inverts text/background colour) and a decorative wave reaching ~50% up
 * from the bottom of the section.
 */
export function HomePage() {
  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-24 items-center overflow-hidden px-6 py-20 md:py-24"
      >
        <HomeWave />
        <InteractiveCanvas />

        <div className="relative z-0 mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
          <HomeHero />
          <div className="md:justify-self-end">
            <LoopingWords />
          </div>
        </div>
      </section>

      <section id="problem" className="min-h-screen scroll-mt-24" />

      <section id="solution" className="scroll-mt-24">
        <SolutionReveal />
      </section>

      <section id="demo" className="min-h-screen scroll-mt-24" />

      <section
        id="sandbox"
        className="flex min-h-screen scroll-mt-24 flex-col items-center justify-center gap-12 px-6 py-24"
      >
        <InstallSteps />
        <GlassTextarea />
        <LogoCloud />
      </section>

      <section id="docs" className="min-h-screen scroll-mt-24" />
    </div>
  );
}
