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
import { Reveal } from "../components/ui/reveal";
import { TeamShowcase } from "../components/ui/team-showcase";
import { TextRevealByWord } from "../components/ui/text-reveal";
import { TypingHeading } from "../components/ui/typing-heading";

/**
 * Section order:
 *   home → demo → sandbox → problem → solution → about → docs
 *
 * Animation choreography per non-hero section:
 *   - Eyebrow chip (where present) fades in.
 *   - Heading wipes left → right with a clip-path "typing" reveal,
 *     then a gold flourish underline draws below it.
 *   - Subtitle / body / interactive content fade in after the heading
 *     finishes (delay ≈ wipe·0.85 + underlineDuration).
 *
 * Home stacking (back → front):
 *   z-0  PixelWave        WebGL dithered gold wave covering the whole hero
 *   z-10 InteractiveCanvas cursor halo with `mix-blend-mode: difference`,
 *                          so dots invert against the wave AND text
 *   z-20 HomeHero + LoopingWords (text content)
 *   z-30 bottom-edge gradient fade (no backdrop-filter)
 */

// Heading wipe + flourish timings reused across non-hero sections so the
// fade-ins below each heading land at a consistent beat.
const SECTION_WIPE = 1.1;
const SECTION_UL = 0.55;
const POST_HEADING = SECTION_WIPE * 0.85 + SECTION_UL + 0.1;

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
          <Reveal duration={0.5}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
              Demo · same intent, two prompts
            </span>
          </Reveal>
          <div className="mt-4">
            <TypingHeading
              duration={SECTION_WIPE}
              underlineDuration={SECTION_UL}
              underlineWidth="min(18rem, 65%)"
              className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              Watch the same idea land twice — once vague, once precise.
            </TypingHeading>
          </div>
        </div>
        <Reveal delay={POST_HEADING} duration={0.6}>
          <DemoSplit />
        </Reveal>
      </section>

      {/* Sandbox — moon-image base from sandbox.md, layered with a dark
          tint and the existing gold radial gradients so the "atelier"
          feel survives. Background is fixed-attachment for a subtle
          parallax. */}
      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1rem,2.5vh,2rem)",
          backgroundImage:
            "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark tint so text and the gold gradients still read clearly
            on top of the photographic background. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: "rgba(15, 16, 20, 0.65)" }}
        />

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
              "linear-gradient(180deg, rgba(25,26,31,0) 0%, rgba(25,26,31,0.7) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <TypingHeading
            align="center"
            duration={SECTION_WIPE}
            underlineDuration={SECTION_UL}
            underlineWidth="min(10rem, 50%)"
            className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Define the form.
          </TypingHeading>
          <Reveal delay={POST_HEADING} duration={0.6}>
            <p className="mt-3 text-base text-white/65 sm:text-lg">
              Test it on every web vibe-coding platform.
            </p>
          </Reveal>
        </div>
        <div
          className="relative z-10 flex w-full flex-col items-center"
          style={{ gap: "clamp(1rem,2.5vh,2rem)" }}
        >
          <Reveal delay={POST_HEADING + 0.2} duration={0.6}>
            <InstallSteps />
          </Reveal>
          <Reveal delay={POST_HEADING + 0.4} duration={0.6}>
            <GlassTextarea />
          </Reveal>
          <Reveal delay={POST_HEADING + 0.6} duration={0.6}>
            <LogoCloud />
          </Reveal>
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

      {/* Solution — long vague sentence brightens word-by-word, gold
          underline draws, then the long sentence shrinks/blurs out and
          a clean short tagline morphs in over the same area. */}
      <section id="solution" data-snap-start className="scroll-mt-20">
        <TextRevealByWord
          text="Forma is some kind of helpful smart tool thing that maybe sorta turns those random kinda vague description-y prompt words you type into something that's like, more clear and proper for getting back the UI components you actually wanted in the first place, hopefully."
          shortText="Forma turns vague prompts into precise UI."
        />
      </section>

      {/* About — eyebrow removed, content centered, only the heading +
          subtitle + TeamShowcase. Heading uses the same typing wipe +
          gold underline pattern as the rest of the site. */}
      <section
        id="about"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1.5rem,3vh,2.5rem)",
        }}
      >
        <div className="flex w-full max-w-5xl flex-col items-center text-center">
          <TypingHeading
            align="center"
            duration={SECTION_WIPE}
            underlineDuration={SECTION_UL}
            underlineWidth="min(16rem, 55%)"
            className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Design-language research, shipped as a tool.
          </TypingHeading>
          <Reveal delay={POST_HEADING} duration={0.6}>
            <p className="mt-4 max-w-2xl text-base text-white/55 sm:text-lg">
              Forma is a translation layer between human intent and the AI
              tools that build UI — opinionated, open, pointed at the
              precision frontier of generative interfaces.
            </p>
          </Reveal>
        </div>
        <Reveal delay={POST_HEADING + 0.2} duration={0.6}>
          <TeamShowcase />
        </Reveal>
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
