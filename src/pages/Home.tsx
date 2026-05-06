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
    <div className="bg-[var(--color-forma-bg)]">
      {/* ------------------------------------------------------------------ *
       * Hero — eyebrow / headline / non-interactive prompt demo.
       * The PromptDemoBox renders its FORMA SUGGESTS popover beneath itself,
       * so we reserve generous padding-bottom on the hero to fit the popover.
       * ------------------------------------------------------------------ */}
      <section className="relative px-6 pt-20 pb-[44rem] sm:pb-[40rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-forma-gold)]">
            Forma
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--color-forma-fg)] sm:text-6xl">
            Precise Prompts.
            <span className="block text-[var(--color-forma-muted)]">Perfect UI.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-forma-muted)] sm:text-lg">
            Surface-grade vocabulary for component prompts. Forma quietly
            corrects vague UI words while you write, before generation runs.
          </p>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-2xl">
          <PromptDemoBox />
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Platform integration grid — Forma slots into the prompt boxes you
       * already use. Each card is a stylized mock of that platform's input.
       * ------------------------------------------------------------------ */}
      <section className="border-t border-[var(--color-forma-border)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-forma-gold)]">
              Works everywhere
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-forma-fg)] sm:text-4xl">
              Drop into the prompt boxes you already use.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-forma-muted)] sm:text-base">
              Forma rides on top of any prompt input — no plugin to install on
              the platform side, no UI to learn. Type as you always do.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <PlatformCard key={platform} platform={platform} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ *
       * Install bookmarklet — preserved from the previous Home page.
       * ------------------------------------------------------------------ */}
      <section className="border-t border-[var(--color-forma-border)] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-forma-gold)]">
            Install Forma
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-forma-fg)] sm:text-4xl">
            One drag. Then it&apos;s on every tab.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--color-forma-muted)] sm:text-base">
            Drag the control below into your bookmarks bar. Invoke it on any
            page to verify the bookmarklet shell.
          </p>

          <div className="mt-10">
            <a
              draggable
              href={bookmarkletHref()}
              className="inline-flex cursor-grab select-none items-center justify-center rounded-full border border-[var(--color-forma-gold)]/30 bg-[var(--color-forma-gold)]/10 px-8 py-4 text-sm font-semibold tracking-tight text-[var(--color-forma-gold-bright)] shadow-[0_18px_40px_-22px_rgba(212,184,122,0.5)] backdrop-blur-md transition hover:border-[var(--color-forma-gold)]/60 hover:bg-[var(--color-forma-gold)]/15 active:cursor-grabbing"
            >
              Forma · Drag to bookmarks
            </a>
          </div>

          <p className="mt-6 max-w-md text-xs uppercase tracking-[0.18em] text-[var(--color-forma-faint)]">
            Drag this button to your browser&apos;s bookmarks bar, then click
            the new bookmark on any tab.
          </p>
        </div>
      </section>
    </div>
  );
}
