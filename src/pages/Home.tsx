import { GlassTextarea } from "../components/GlassTextarea";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { PlatformGrid } from "../components/PlatformGrid";
import { SolutionReveal } from "../components/SolutionReveal";

/**
 * Each section is full-screen tall and carries `scroll-mt-24` so the sticky
 * PillNav doesn't overlap the section heading on click-to-scroll.
 *
 * Only #home, #solution, and #sandbox carry content this round; #problem,
 * #demo, and #docs are deliberately empty placeholders.
 */
export function HomePage() {
  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden px-6"
      >
        <InteractiveCanvas />

        <div className="relative z-0 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-stitch-fg-faint)]">
            Forma · beta UI
          </p>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-[var(--color-stitch-fg)] sm:text-7xl">
            Move your cursor.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[var(--color-stitch-fg-dim)] sm:text-lg">
            Drag through the field. The lit part inverts whatever it crosses.
          </p>
        </div>
      </section>

      <section id="problem" className="min-h-screen scroll-mt-24" />

      <section id="solution" className="scroll-mt-24">
        <SolutionReveal />
      </section>

      <section id="demo" className="min-h-screen scroll-mt-24" />

      <section
        id="sandbox"
        className="flex min-h-screen scroll-mt-24 flex-col items-center justify-center gap-10 px-6 py-24"
      >
        <InstallSteps />
        <GlassTextarea />
        <PlatformGrid />
      </section>

      <section id="docs" className="min-h-screen scroll-mt-24" />
    </div>
  );
}
