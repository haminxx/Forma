const BOOKMARKLET_SCRIPT =
  "(function(){ alert('Forma Bookmarklet Installed and Working!'); })();";

export function bookmarkletHref(): string {
  return `javascript:${encodeURIComponent(BOOKMARKLET_SCRIPT)}`;
}

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
        Forma
      </p>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Precise Prompts.
        <span className="block text-zinc-400">Perfect UI.</span>
      </h1>
      <p className="mt-8 max-w-xl text-lg leading-relaxed tracking-tight text-zinc-400">
        Surface-grade vocabulary for component prompts—quiet corrections while you
        write, before generation runs.
      </p>

      <section className="mt-20 border-t border-white/[0.06] pt-16">
        <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Install Forma
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
          Drag the control below into your bookmarks bar. Invoke it on any page to
          verify the bookmarklet shell.
        </p>

        <div className="mt-10">
          <a
            draggable
            href={bookmarkletHref()}
            className="inline-flex cursor-grab select-none items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-8 py-4 text-sm font-semibold tracking-tight text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.75)] backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.1] active:cursor-grabbing"
          >
            Forma · Drag to bookmarks
          </a>
        </div>

        <p className="mt-6 max-w-md text-xs uppercase tracking-[0.18em] text-zinc-600">
          Drag this button to your browser&apos;s bookmarks bar, then click the new
          bookmark on any tab.
        </p>
      </section>
    </div>
  );
}
