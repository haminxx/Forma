import { GlassTextarea } from "../components/GlassTextarea";
import { SandboxBadge } from "../components/SandboxBadge";
import { SolutionReveal } from "../components/SolutionReveal";

export function HomePage() {
  return (
    <main>
      <section
        id="home"
        className="flex min-h-[80vh] items-center justify-center px-6 py-24"
      >
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--color-stitch-fg-faint)]">
            Forma · beta UI
          </p>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-[var(--color-stitch-fg)] sm:text-7xl">
            Move your cursor.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[var(--color-stitch-fg-dim)] sm:text-lg">
            Visual-first foundation. Landing content lands next.
          </p>
        </div>
      </section>

      <section id="problem" className="min-h-[60vh]" />

      <section
        id="solution"
        className="flex min-h-[80vh] items-center justify-center px-6"
      >
        <SolutionReveal />
      </section>

      <section id="demo" className="min-h-[60vh]" />

      <section
        id="sandbox"
        className="flex min-h-[100vh] flex-col items-center justify-center gap-6 px-6"
      >
        <SandboxBadge />
        <GlassTextarea />
      </section>

      <section id="docs" className="min-h-[40vh]" />
    </main>
  );
}
