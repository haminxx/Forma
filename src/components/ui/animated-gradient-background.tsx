import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties, FC } from "react";

interface AnimatedGradientBackgroundProps {
  /** Initial size of the radial gradient (% width). Default 125. */
  startingGap?: number;
  /** Toggle the breathing in/out animation. Default false. */
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
 * Full-bleed animated radial gradient. Adopted from the user-pasted
 * reference. Uses `framer-motion` for the entrance scale/fade and a
 * raw rAF loop to drive an optional "breathing" oscillation directly
 * on the inner div's `background` style — no React re-renders per
 * frame.
 *
 * Defaults swapped to the Forma palette so the gradient bleeds from
 * deep charcoal -> Forma gold -> warm-amber -> violet -> teal -> blue,
 * matching the rest of the marketing site instead of the original
 * blue/pink/orange/yellow rainbow.
 */
const AnimatedGradientBackground: FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 125,
  breathing = true,
  gradientColors = [
    "#0A0A0A", // canvas
    "#1a1a1f", // near-black
    "#3D5AFE", // electric blue
    "#8B5CF6", // violet
    "#FF80AB", // soft pink
    "#FFD66B", // amber
    "#D4B87A", // Forma gold
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
