
/**
 * Sections use Tailwind `scroll-mt-*` on `#home` anchors so `#demo`/`#sandbox`
 * clear the floating navbar (`scroll-mt-32`, `scroll-mt-36` on large screens).
 * `scrollIntoView({ block: "start" })` respects that scroll margin.
 */
export function scrollDocumentToSection(
  sectionId: string,
  behavior: SectionScrollBehavior = "smooth",
): boolean {
  const node = document.getElementById(sectionId);
  if (!node) return false;

  node.scrollIntoView({
    behavior: behavior === "instant" ? "auto" : behavior,
    block: "start",
    inline: "nearest",
  });
  return true;
}
export type SectionScrollBehavior = ScrollBehavior | "instant";

/** Re-run briefly so layout (e.g. after route change) isn't missed on first paint. */
export function scrollDocumentToSectionWithRetries(
  sectionId: string,
  behavior: SectionScrollBehavior = "smooth",
) {
  const run = () => scrollDocumentToSection(sectionId, behavior);
  run();
  requestAnimationFrame(run);
  const t = window.setTimeout(run, 100);
  const t2 = window.setTimeout(run, 280);
  return () => {
    window.clearTimeout(t);
    window.clearTimeout(t2);
  };
}
