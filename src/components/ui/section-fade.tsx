import { type CSSProperties } from "react";

import { cn } from "../../lib/cn";

/**
 * Soft section-edge fades. Two flavours, both designed to be dropped
 * into a `position: relative` section as the very first child:
 *
 *   - `SectionFade`   — paints a vertical gradient that bleeds the
 *                       page bg (#191a1f) into transparency at the
 *                       section edge. Optionally adds a `backdrop-filter`
 *                       strip whose mask tapers into the section
 *                       interior, so content frosts as it scrolls past
 *                       the boundary instead of crossing a hard line.
 *
 *   - `EdgeGlow`      — paints a low-opacity gold radial bloom at the
 *                       section edge with `mix-blend-mode: screen`.
 *                       When two adjacent sections both have an
 *                       `EdgeGlow` at the boundary, the blooms overlap
 *                       and create the illusion of warmth flowing
 *                       continuously across the divide instead of two
 *                       separate dark sections butting against each
 *                       other.
 *
 * Cheap by design: no JS, no observers, no event listeners. Both
 * components are pure render-time gradients pinned to the section's
 * top or bottom edge.
 */

type Position = "top" | "bottom";

const PAGE_BG_RGB = "25, 26, 31"; // matches Forma's #191a1f page bg

function pageFade(opacity: number) {
  return `rgba(${PAGE_BG_RGB}, ${opacity})`;
}

export interface SectionFadeProps {
  position: Position;
  /** CSS length for the strip height. Default: clamp 4rem..8rem. */
  height?: string;
  /** Backdrop-blur amount in pixels. Omit for a pure colour fade. */
  blur?: number;
  /** Stacking order. Default 30 (above section content). */
  z?: number;
  className?: string;
}

export function SectionFade({
  position,
  height = "clamp(4rem, 9vh, 8rem)",
  blur,
  z = 30,
  className,
}: SectionFadeProps) {
  const isTop = position === "top";

  // Four-stop gradient produces a smoother S-curve than a two-stop
  // straight ramp; the page bg holds at full opacity for the first
  // 35 % of the strip, then accelerates out to transparent.
  const gradient = isTop
    ? `linear-gradient(180deg, ${pageFade(1)} 0%, ${pageFade(0.85)} 35%, ${pageFade(0.45)} 65%, ${pageFade(0)} 100%)`
    : `linear-gradient(0deg, ${pageFade(1)} 0%, ${pageFade(0.85)} 35%, ${pageFade(0.45)} 65%, ${pageFade(0)} 100%)`;

  const style: CSSProperties = {
    height,
    background: gradient,
    [isTop ? "top" : "bottom"]: 0,
    zIndex: z,
  };

  if (blur && blur > 0) {
    const filter = `blur(${blur}px)`;
    style.backdropFilter = filter;
    (
      style as CSSProperties & { WebkitBackdropFilter?: string }
    ).WebkitBackdropFilter = filter;

    // Mask the blur so the frost is strongest at the page-bg side and
    // tapers off as we move into the section interior. Without this
    // the entire strip is uniformly frosted, which reads as a hard
    // horizontal band.
    const mask = isTop
      ? "linear-gradient(180deg, black 0%, black 50%, transparent 100%)"
      : "linear-gradient(0deg, black 0%, black 50%, transparent 100%)";
    style.maskImage = mask;
    (
      style as CSSProperties & { WebkitMaskImage?: string }
    ).WebkitMaskImage = mask;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-0", className)}
      style={style}
    />
  );
}

export interface EdgeGlowProps {
  position: Position;
  /** CSS length for the strip height. Default: clamp 6rem..12rem. */
  height?: string;
  /** Peak alpha at the bloom centre. Default 0.06. */
  intensity?: number;
  /** RGB triplet for the bloom colour. Default: Forma gold. */
  color?: string;
  /** Stacking order. Default 0 (between bg and content). */
  z?: number;
  className?: string;
}

export function EdgeGlow({
  position,
  height = "clamp(6rem, 14vh, 12rem)",
  intensity = 0.06,
  color = "212, 184, 122",
  z = 0,
  className,
}: EdgeGlowProps) {
  const isTop = position === "top";

  const radial = isTop
    ? `radial-gradient(ellipse 70% 100% at 50% 0%, rgba(${color}, ${intensity}) 0%, rgba(${color}, ${intensity * 0.4}) 35%, transparent 70%)`
    : `radial-gradient(ellipse 70% 100% at 50% 100%, rgba(${color}, ${intensity}) 0%, rgba(${color}, ${intensity * 0.4}) 35%, transparent 70%)`;

  const style: CSSProperties = {
    height,
    [isTop ? "top" : "bottom"]: 0,
    background: radial,
    mixBlendMode: "screen",
    zIndex: z,
  };

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-0", className)}
      style={style}
    />
  );
}
