/** Matches `scroll-mt-24` on section anchors (~6rem below viewport top). */
export const SECTION_SCROLL_TOP_RESERVE_PX = 96;

export type SectionScrollBehavior = ScrollBehavior | "instant";

/** Scroll offset under the floating header; sections use matching `scroll-mt-24`. */
export function scrollDocumentToSection(
  sectionId: string,
  behavior: SectionScrollBehavior = "smooth",
): boolean {
  const node = document.getElementById(sectionId);
  if (!node) return false;

  const y =
    node.getBoundingClientRect().top +
    window.scrollY -
    SECTION_SCROLL_TOP_RESERVE_PX;
  window.scrollTo({
    top: Math.max(0, y),
    behavior:
      behavior === "instant" ? "auto" : behavior,
  });
  return true;
}
