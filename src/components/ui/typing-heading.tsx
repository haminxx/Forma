import { type CSSProperties, type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

type Tag = "h1" | "h2" | "h3";
type Align = "left" | "center";

interface TypingHeadingProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Heading tag. Default `h2`. */
  as?: Tag;
  /** Wipe duration in seconds. Default 1.2. */
  duration?: number;
  /** Show the gold flourish underline below the heading. Default true. */
  underline?: boolean;
  /** Underline draw duration. Default 0.6. */
  underlineDuration?: number;
  /** Underline colour (Forma gold by default). */
  underlineColor?: string;
  /** Underline thickness in px. Default 2. */
  underlineHeight?: number;
  /** Underline width — CSS length string. Default `min(14rem, 60%)`. */
  underlineWidth?: string;
  /** Top margin of the underline. Default `0.75rem`. */
  underlineGap?: string;
  /** Aligns the underline (origin + horizontal margin). Default `left`. */
  align?: Align;
  /** Replay if scrolled back into view. */
  once?: boolean;
}

/**
 * Section heading with a left-to-right "typing" wipe and a gold flourish
 * underline that draws after the wipe finishes.
 *
 * Visual model:
 *   - Heading text exists in DOM with normal layout (so anchor links,
 *     line wrapping, font metrics all behave). A `clip-path` of
 *     `inset(0 100% 0 0)` hides everything to the right initially, then
 *     animates to `inset(0 0% 0 0)` revealing the text left → right.
 *     Reads as a smooth typing reveal without per-character spans.
 *   - After the wipe (`delay = duration * 0.85`), the underline scales
 *     X from 0 → 1 with `transformOrigin: left|center` for the flourish.
 *
 * Use `align="center"` when the heading is rendered inside a centered
 * column so the underline tracks the heading's centerline.
 */
export function TypingHeading({
  children,
  className,
  style,
  as = "h2",
  duration = 1.2,
  underline = true,
  underlineDuration = 0.6,
  underlineColor = "#d4b87a",
  underlineHeight = 2,
  underlineWidth = "min(14rem, 60%)",
  underlineGap = "0.75rem",
  align = "left",
  once = true,
}: TypingHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-100px" });

  const MotionTag =
    as === "h1" ? motion.h1 : as === "h3" ? motion.h3 : motion.h2;

  const isCenter = align === "center";

  return (
    <div
      ref={ref}
      className={isCenter ? "flex flex-col items-center" : "flex flex-col items-start"}
    >
      <MotionTag
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
        transition={{ duration, ease: [0.5, 0, 0.2, 1] }}
        className={className}
        style={style}
      >
        {children}
      </MotionTag>

      {underline && (
        <motion.span
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: underlineDuration,
            delay: duration * 0.85,
            ease: [0.22, 0.68, 0, 1],
          }}
          style={{
            display: "block",
            transformOrigin: isCenter ? "center" : "left",
            background: underlineColor,
            height: underlineHeight,
            marginTop: underlineGap,
            width: underlineWidth,
          }}
        />
      )}
    </div>
  );
}
