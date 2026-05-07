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
import { TeamShowcase } from "../components/ui/team-showcase";
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
 *   z-0  PixelWave        WebGL dithered gold wave covering the whole hero
 *   z-10 InteractiveCanvas cursor halo with `mix-blend-mode: difference`,
 *                          so dots invert against the wave AND text
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
          paddingTop: "5.5rem",
          paddingBottom: "clamp(2rem, 6vh, 5rem)",
          justifyContent: "flex-start",
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <PixelWave />
        </div>
        <div className="absolute inset-0 z-10">
          <InteractiveCanvas />
        </div>

        <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
          <HomeHero />
          <div className="md:justify-self-end">
            <LoopingWords />
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

      {/* Sandbox — gold gradient stage behind the install steps + prompt
          textbox so the section reads as a warm "atelier" against the
          rest of the dark page. The gradient is layered radials with low
          alpha, so the background bg-[#191a1f] still dominates at the
          edges. */}
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
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 65%, rgba(212, 184, 122, 0.20) 0%, rgba(212, 184, 122, 0.09) 35%, transparent 72%), " +
              "radial-gradient(ellipse 55% 45% at 18% 28%, rgba(212, 184, 122, 0.10) 0%, transparent 60%), " +
              "radial-gradient(ellipse 55% 45% at 82% 18%, rgba(212, 184, 122, 0.07) 0%, transparent 60%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, rgba(25,26,31,0) 0%, rgba(25,26,31,0.6) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Define the form.
          </h2>
          <p className="mt-3 text-base text-white/55 sm:text-lg">
            Test it on every web vibe-coding platform.
          </p>
        </div>
        <div className="relative z-10 flex w-full flex-col items-center" style={{ gap: "clamp(1rem,2.5vh,2rem)" }}>
          <InstallSteps />
          <GlassTextarea />
          <LogoCloud />
        </div>
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

      {/* About — TeamShowcase with placeholder cards. Adopting the
          aboutpage.md design (staggered photo grid + member name list);
          real team data is intentionally empty for now. */}
      <section
        id="about"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1.5rem,3vh,2.5rem)",
        }}
      >
        <div className="w-full max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
            About · Forma
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Design-language research, shipped as a tool.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/55 sm:text-lg">
            Forma is a translation layer between human intent and the AI
            tools that build UI — opinionated, open, pointed at the
            precision frontier of generative interfaces.
          </p>
        </div>
        <TeamShowcase />
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
