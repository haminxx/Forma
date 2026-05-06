/**
 * Visual-first landing placeholder.
 *
 * The page intentionally carries no design beyond a centered wordmark + a
 * single line of copy, so the Stitch-derived breathing dot field reads as
 * the protagonist. Real landing content will be layered back in once the
 * background visual is approved.
 */
export function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-6 py-24">
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
  );
}
