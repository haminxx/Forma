
/**
 * Sections use Tailwind `scroll-mt-24` so their tops clear the fixed navbar.
 * `scrollIntoView({ block: "start" })` respects that scroll margin (manual
 * subtraction from getBoundingClientRect does not mirror it exactly).
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
