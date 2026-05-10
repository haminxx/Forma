import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties, FC } from "react";

/** Solid demo backdrop: matches `gradientColors[1]` (warm near-black lower band of the hero radial). */
export const HOME_HERO_DEMO_SOLID_BG = "#1a1612";

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
const AnimatedGradientBackground: FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 125,
  breathing = true,
  gradientColors = [
    "#0A0A0A", // canvas
    "#1a1612", // near-black warm
    "#3a2a18", // deep bronze
    "#7a5a2a", // burnt umber
    "#c89a4a", // amber
    "#d4b87a", // Forma gold
    "#f3e0a8", // soft cream highlight
  ],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
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
