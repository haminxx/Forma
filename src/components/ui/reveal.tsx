import { type CSSProperties, type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the animation starts after entering view. */
  delay?: number;
  /** Animation duration in seconds. Default 0.6. */
  duration?: number;
  /** Vertical offset (px) of the initial state. Default 16. */
  y?: number;
  /** Replay every time the element scrolls back into view. */
  once?: boolean;
  /** Negative root-margin string for `useInView`. Default "-80px". */
  margin?: `${number}px` | `${number}%`;
  style?: CSSProperties;
  as?: "div" | "section" | "li" | "span";
}

/**
 * Generic enter-on-view animation: opacity 0 → 1 + slight slide-up.
 * Use for eyebrows, subtitles, body copy, cards, and any structural
 * block that should "land" gracefully when the user scrolls to it.
 *
 * Pair with `TypingHeading` for full section choreography:
 *   <Reveal>eyebrow</Reveal>
 *   <TypingHeading>heading</TypingHeading>
 *   <Reveal delay={1.0}>subtitle</Reveal>
 *   <Reveal delay={1.3}>...content...</Reveal>
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 16,
  once = true,
  margin = "-80px",
  style,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once, margin });

  const MotionTag =
    as === "section"
      ? motion.section
      : as === "li"
        ? motion.li
        : as === "span"
          ? motion.span
          : motion.div;

  return (
    <MotionTag
      // The ref union across motion.div | motion.section | motion.li |
      // motion.span doesn't intersect cleanly, but every concrete tag
      // returns an HTMLElement at runtime — the cast is safe.
      ref={ref as never}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.22, 0.68, 0, 1] }}
      className={className}
      style={style}
    >
      {children}
    </MotionTag>
  );
}
