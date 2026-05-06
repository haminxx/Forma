import { PlatformCard, type PlatformId } from "../components/PlatformCard";
import { PromptDemoBox } from "../components/PromptDemoBox";

const BOOKMARKLET_SCRIPT =
  "(function(){ alert('Forma Bookmarklet Installed and Working!'); })();";

export function bookmarkletHref(): string {
  return `javascript:${encodeURIComponent(BOOKMARKLET_SCRIPT)}`;
}

const PLATFORMS: readonly PlatformId[] = ["v0", "lovable", "replit", "bolt", "manus"] as const;

export function HomePage() {
  return (
    <div>
      {/* ------------------------------------------------------------------ *
       * Hero — eyebrow / headline / non-interactive prompt demo.
       * Padding-bottom is generous so the FORMA SUGGESTS popover beneath
       * the prompt box can fully unfold without colliding with section 2.
       * ------------------------------------------------------------------ */}
      <section className="relative px-6 pt-16 pb-[44rem] sm:pt-24 sm:pb-[40rem]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-aurora-purple)]" />
            AI-native prompt vocabulary
          </span>
          <h1 className="mt-8 text-balance text-5xl font-semibold tracking-[-0.02em] text-white sm:text-7xl">
            Precise Prompts.
            <span className="block bg-gradient-to-r from-[var(--color-aurora-blue)] via-[var(--color-aurora-purple)] to-[var(--color-aurora-pink)] bg-clip-text text-transparent">
              Perfect UI.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Surface-grade vocabulary for component prompts. Forma quietly
            corrects vague UI words while you write — before generation runs.
          </p>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-2xl">
          <PromptDemoBox />
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Bento — platform compatibility grid as glassy rounded-3xl cards.
       * ------------------------------------------------------------------ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
              Works everywhere
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Drop into the prompt boxes you already use.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
              Forma rides on top of any prompt input — no plugin to install on
              the platform side, no UI to learn. Type as you always do.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <PlatformCard key={platform} platform={platform} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Install bookmarklet — preserved entry point.
       * ------------------------------------------------------------------ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl forma-glass p-10 sm:p-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
            Install Forma
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            One drag. Then it&apos;s on every tab.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Drag the control below into your bookmarks bar. Invoke it on any
            page to verify the bookmarklet shell.
          </p>

          <div className="mt-10">
            <a
              draggable
              href={bookmarkletHref()}
              className="inline-flex cursor-grab select-none items-center justify-center rounded-full border border-white/15 bg-white px-8 py-4 text-sm font-semibold tracking-tight text-black shadow-[0_18px_40px_-22px_rgba(255,255,255,0.4)] transition hover:bg-white/90 active:cursor-grabbing"
            >
              Forma · Drag to bookmarks
            </a>
          </div>

          <p className="mt-6 max-w-md text-xs uppercase tracking-[0.18em] text-white/40">
            Drag this button to your browser&apos;s bookmarks bar, then click
            the new bookmark on any tab.
          </p>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06] px-6 py-10 text-center text-xs tracking-tight text-white/40">
        Forma · designed for the prompt-first era.
      </footer>
    </div>
  );
}
