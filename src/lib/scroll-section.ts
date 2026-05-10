import type { NavigateFunction } from "react-router-dom";

export type SectionScrollBehavior = ScrollBehavior | "instant";

/** Fine-tunes framing after programmatic scroll (#demo / #sandbox). */
const SECTION_SCROLL_TRIM_PX: Partial<Record<string, number>> = {
  demo: 72,
  sandbox: 48,
};

function applyAnchoredSectionTrim(sectionId: string) {
  const trim = SECTION_SCROLL_TRIM_PX[sectionId];
  if (!trim) return;
  requestAnimationFrame(() => {
    window.scrollBy({ left: 0, top: -trim, behavior: "auto" });
  });
}

/** `scrollIntoView({ block: "start" })` respects each section's Tailwind `scroll-mt-*`. */
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
  const tTrim =
    SECTION_SCROLL_TRIM_PX[sectionId] !== undefined
      ? window.setTimeout(() => applyAnchoredSectionTrim(sectionId), 420)
      : 0;

  return () => {
    window.clearTimeout(t);
    window.clearTimeout(t2);
    if (tTrim) window.clearTimeout(tTrim);
  };
}

/** Home → `#sandbox`; other routes SPA-navigate then `HomePage` handles state. */
export function navigateOrScrollToSandbox(
  navigate: NavigateFunction,
  pathname: string,
  behavior: SectionScrollBehavior,
) {
  if (pathname !== "/") {
    navigate("/", {
      state: { scrollToSection: "sandbox" },
      preventScrollReset: true,
    });
    return;
  }
  scrollDocumentToSectionWithRetries("sandbox", behavior);
}
