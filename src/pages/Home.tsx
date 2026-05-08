import { DemoSplit } from "../components/DemoSplit";
import { DocsPanel } from "../components/DocsPanel";
import { GlassTextarea } from "../components/GlassTextarea";
import { HomeHero } from "../components/HomeHero";
import { InstallSteps } from "../components/InstallSteps";
import { InteractiveCanvas } from "../components/InteractiveCanvas";
import { LoopingWords } from "../components/LoopingWords";
import { PixelWave } from "../components/PixelWave";
import { ProblemTestimonial } from "../components/ProblemTestimonial";
import { BlurText } from "../components/ui/blur-text";
import { LogoCloud } from "../components/ui/logo-cloud";
import { Reveal } from "../components/ui/reveal";
import { TeamShowcase } from "../components/ui/team-showcase";
import { TextRevealByWord } from "../components/ui/text-reveal";

/**
 * Section order:
 *   home → demo → sandbox → problem → solution → about → docs
 *
 * Animation choreography:
 *   - All headings + subtitles use `BlurText` (per-word blur-in adopted
 *     from `animations/blurText.md`). Headings get a gold flourish
 *     underline that draws after the last word lands.
 *   - Cards / grids / interactive blocks use `Reveal` (one observer per
 *     block, fade-up).
 *   - The Solution section uses `TextRevealByWord` — a sticky stage
 *     with scroll-driven word brightening + per-line gold underlines.
 *     The sentence stays at its natural fluid size for the whole stage
 *     (no scale morph), so the entire long sentence is visible at once.
 */

// Common per-word blur stagger values, used to compute the right post-
// heading delay so subtitles/content land AFTER the underline draws.
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
            <BlurText
              as="h2"
              baseDelay={HEADING_BASE_DELAY}
              duration={HEADING_DURATION}
              underline
              underlineWidth="min(18rem, 65%)"
              className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
              content="Watch the same idea land twice — once vague, once precise."
            />
          </div>
        </div>
        <Reveal delay={postHeadingDelay(11)} duration={0.6}>
          <DemoSplit />
        </Reveal>
      </section>

      {/* Sandbox — moon-image graphic stage (back from the
          `sandbox.md` reference) tinted with Forma's yellow/gold
          gradient overlays. The image is anchored to the section box,
          so it scrolls with the section instead of being pinned to the
          viewport. */}
      <section
        id="sandbox"
        className="relative flex min-h-screen scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6"
        style={{
          paddingTop: "clamp(3rem,8vh,6rem)",
          paddingBottom: "clamp(3rem,8vh,6rem)",
          gap: "clamp(1rem,2.5vh,2rem)",
        }}
      >
        {/* Base moon image — sits behind the gold tint so the texture
            shows through but the section reads as Forma-gold rather
            than the raw greyscale photo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            // No `fixed` attachment — the bg moves with the section
            // as the user scrolls, matching their preference.
            opacity: 0.55,
          }}
        />

        {/* Gold tint pass — three layered radials + a warm base, all
            anchored to the section so they scroll with it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 55%, rgba(212, 184, 122, 0.45) 0%, rgba(212, 184, 122, 0.22) 38%, rgba(212, 184, 122, 0.06) 65%, transparent 80%), " +
              "radial-gradient(ellipse 55% 45% at 18% 25%, rgba(231, 207, 149, 0.22) 0%, transparent 65%), " +
              "radial-gradient(ellipse 55% 45% at 82% 18%, rgba(212, 184, 122, 0.18) 0%, transparent 65%), " +
              "linear-gradient(180deg, rgba(25, 22, 14, 0.55) 0%, rgba(15, 14, 10, 0.5) 100%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Bottom fade into the page bg so the next section blends. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, rgba(25,26,31,0) 0%, rgba(25,26,31,0.85) 100%)",
          }}
        />

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

      {/* Solution — long vague sentence brightens word-by-word and gold
          per-line underlines draw under every wrapped line. The font
          size is fluid (clamp) so the entire sentence stays visible at
          its natural size on every viewport — no scale/zoom morph. */}
      <section id="solution" data-snap-start className="scroll-mt-20">
        <TextRevealByWord
          text="Forma is some kind of helpful smart tool thing that maybe sorta turns those random kinda vague description-y prompt words you type into something that's like, more clear and proper for getting back the UI components you actually wanted in the first place, hopefully."
        />
      </section>

      {/* About — eyebrow removed, content centered vertically and
          horizontally. Heading + subtitle blur-words in. */}
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
          <BlurText
            as="h2"
            align="center"
            baseDelay={HEADING_BASE_DELAY}
            duration={HEADING_DURATION}
            underline
            underlineWidth="min(16rem, 55%)"
            className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl"
            content="Design-language research, shipped as a tool."
          />
          <BlurText
            as="p"
            align="center"
            startDelay={postHeadingDelay(6)}
            baseDelay={0.035}
            duration={0.7}
            blur={8}
            y={10}
            className="mt-4 max-w-2xl text-base text-white/55 sm:text-lg"
            content="Forma is a translation layer between human intent and the AI tools that build UI — opinionated, open, pointed at the precision frontier of generative interfaces."
          />
        </div>
        <Reveal delay={postHeadingDelay(6) + 0.6} duration={0.6}>
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
