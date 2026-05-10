import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties, FC } from "react";

interface AnimatedGradientBackgroundProps {
  /** Initial size of the radial gradient (% width). Default 125. */
  startingGap?: number;
  /** Toggle the breathing in/out animation. Default true. */
  breathing?: boolean;
  /** Colour stops (hex). Length must equal `gradientStops`. */
  gradientColors?: string[];
  /** Per-stop percentage (0–100). Length must equal `gradientColors`. */
  gradientStops?: number[];
  /** Speed of the breathing oscillation. Default 0.02. */
  animationSpeed?: number;
  /** Max ± delta the gradient breathes. Default 5. */
  breathingRange?: number;
  /** Inline styles forwarded to the inner gradient div. */
  containerStyle?: CSSProperties;
  /** Extra classNames forwarded to the framer wrapper. */
  containerClassName?: string;
  /** Vertical offset added to the radial Y dimension. */
  topOffset?: number;
}

/**
 * AnimatedGradientBackground
 *
 * Full-bleed animated radial gradient. Uses `framer-motion` for the
 * entrance scale/fade and a raw rAF loop to drive an optional
 * "breathing" oscillation directly on the inner div's `background`
 * style — no React re-renders per frame.
 *
 * Default palette is now an all-warm gold spectrum per the latest
 * direction: deep charcoal core -> warm bronze -> amber -> Forma
 * gold -> soft buttery cream at the rim. The result reads as a
 * single yellow/gold radial that bleeds straight into Forma's gold
 * marketing accent.
 */

/** Shared with `AnimatedGradientBackground` defaults — single source of truth. */
const DEFAULT_HERO_GRADIENT_COLORS = [
  "#0A0A0A",
  "#1a1612",
  "#3a2a18",
  "#7a5a2a",
  "#c89a4a",
  "#d4b87a",
  "#f3e0a8",
] as const;

const DEFAULT_HERO_GRADIENT_STOPS = [35, 50, 60, 70, 80, 90, 100] as const;

/** Default ellipse axes — must match `AnimatedGradientBackground` (`startingGap`, `topOffset`). */
export const HERO_RADIAL_DEFAULT_WIDTH_PCT = 125;
export const HERO_RADIAL_DEFAULT_TOP_OFFSET = -20;

/**
 * Static demo-track field: **same** palette + stop order as the home radial
 * (not colour-reversed). Anchor is flipped to the bottom (`82%` vs `20%`) so
 * it mirrors the hero: moving away from each centre hits the **same** rim
 * gold/cream — avoids a dark seam where reversed stops had black on the outer edge.
 */
export function cssInvertedHeroTrackBackdrop(
  widthPct = HERO_RADIAL_DEFAULT_WIDTH_PCT,
  heightPct = HERO_RADIAL_DEFAULT_WIDTH_PCT + HERO_RADIAL_DEFAULT_TOP_OFFSET,
): string {
  const colors = [...DEFAULT_HERO_GRADIENT_COLORS];
  const stops = [...DEFAULT_HERO_GRADIENT_STOPS];
  const pairs = stops.map((stop, i) => `${colors[i]!} ${stop}%`).join(", ");
  return `radial-gradient(${widthPct}% ${heightPct}% at 50% 82%, ${pairs})`;
}

const AnimatedGradientBackground: FC<AnimatedGradientBackgroundProps> = ({
  startingGap = HERO_RADIAL_DEFAULT_WIDTH_PCT,
  breathing = true,
  gradientColors = [...DEFAULT_HERO_GRADIENT_COLORS],
  gradientStops = [...DEFAULT_HERO_GRADIENT_STOPS],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `AnimatedGradientBackground: gradientColors (${gradientColors.length}) and gradientStops (${gradientStops.length}) must be the same length.`,
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame = 0;
    let width = startingGap;
    let directionWidth = 1;

    const animate = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;
      if (!breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;

      const stops = gradientStops
        .map((stop, i) => `${gradientColors[i]} ${stop}%`)
        .join(", ");

      const gradient = `radial-gradient(${width}% ${
        width + topOffset
      }% at 50% 20%, ${stops})`;

      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [
    startingGap,
    breathing,
    gradientColors,
    gradientStops,
    animationSpeed,
    breathingRange,
    topOffset,
  ]);

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{ opacity: 0, scale: 1.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 2,
          ease: [0.25, 0.1, 0.25, 1] as const,
        },
      }}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform"
      />
    </motion.div>
  );
};

export default AnimatedGradientBackground;
export { AnimatedGradientBackground };
