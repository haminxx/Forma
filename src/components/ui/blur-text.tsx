import {
  Children,
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
} from "react";
import { motion, useInView } from "framer-motion";

type Tag = "h1" | "h2" | "h3" | "p" | "span";
type Align = "left" | "center";

interface BlurTextProps {
  /**
   * Plain text (auto-split by whitespace) OR an explicit array of "word
   * tokens" — a token can be a string OR a React element (e.g. an anchor)
   * so headings with inline links blur-in word-by-word like the rest.
   */
  content: string | ReactNode[];
  className?: string;
  style?: CSSProperties;
  /** Tag to render. Default `p`. */
  as?: Tag;
  /** Per-word stagger delay (sec). Default 0.07. */
  baseDelay?: number;
  /** Offset before the first word animates (sec). Default 0. */
  startDelay?: number;
  /** Per-word animation duration (sec). Default 0.85. */
  duration?: number;
  /** Initial blur (px). Default 12. */
  blur?: number;
  /** Initial vertical offset (px). Default 14. */
  y?: number;
  /** Show a gold flourish underline below the text. */
  underline?: boolean;
  underlineDuration?: number;
  underlineWidth?: string;
  underlineGap?: string;
  underlineColor?: string;
  align?: Align;
  /** Replay every time the element scrolls back into view. */
  once?: boolean;
}

/**
 * Per-word blur-in text reveal adapted from `animations/blurText.md`.
 *
 *   - Each word starts blurred + translated down + slightly scaled +
 *     opacity 0.
 *   - On enter-view, words land one after another with a small stagger
 *     and a smooth blur(0) + opacity(1) + scale(1) transition.
 *   - Optionally followed by a gold flourish underline that draws after
 *     the last word lands — keeps Forma's heading "signature" intact.
 *
 * For headings with inline anchor links (e.g. HomeHero), pass `content`
 * as an array of tokens — each anchor becomes its own animated word so
 * the link still blurs-in with the rest of the sentence.
 *
 * Performance: a single IntersectionObserver via `useInView` triggers
 * the animation; framer-motion batches the per-word transforms. Use
 * `BlurText` for headings + subtitles + eyebrows; for whole cards or
 * grids prefer `Reveal` (one observer instead of N).
 */
export function BlurText({
  content,
  className,
  style,
  as = "p",
  baseDelay = 0.07,
  startDelay = 0,
  duration = 0.85,
  blur = 12,
  y = 14,
  underline = false,
  underlineDuration = 0.55,
  underlineWidth = "min(14rem, 60%)",
  underlineGap = "0.75rem",
  underlineColor = "#d4b87a",
  align = "left",
  once = true,
}: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  const tokens = useMemo<ReactNode[]>(() => {
    if (typeof content === "string") return content.split(/\s+/).filter(Boolean);
    return Children.toArray(content);
  }, [content]);

  const lastDelay = startDelay + Math.max(0, tokens.length - 1) * baseDelay + duration;

  const MotionTag =
    as === "h1"
      ? motion.h1
      : as === "h2"
        ? motion.h2
        : as === "h3"
          ? motion.h3
          : as === "span"
            ? motion.span
            : motion.p;

  const isCenter = align === "center";

  // Per-word motion props (kept outside the map so we don't reallocate
  // identical objects 50× for long headings).
  const initial = { opacity: 0, filter: `blur(${blur}px)`, y, scale: 0.94 };
  const final = { opacity: 1, filter: "blur(0px)", y: 0, scale: 1 };
  const wordStyle: CSSProperties = {
    display: "inline-block",
    marginRight: "0.25em",
    willChange: "filter, transform, opacity",
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
  };

  return (
    <div
      ref={ref}
      className={isCenter ? "flex flex-col items-center" : "flex flex-col items-start"}
    >
      <MotionTag className={className} style={style}>
        {tokens.map((token, i) => {
          const delay = startDelay + i * baseDelay;
          return (
            <motion.span
              key={i}
              initial={initial}
              animate={inView ? final : initial}
              transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={wordStyle}
            >
              {token}
            </motion.span>
          );
        })}
      </MotionTag>

      {underline ? (
        <motion.span
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: underlineDuration,
            delay: lastDelay - 0.1,
            ease: [0.22, 0.68, 0, 1],
          }}
          style={{
            display: "block",
            transformOrigin: isCenter ? "center" : "left",
            background: underlineColor,
            height: 2,
            marginTop: underlineGap,
            width: underlineWidth,
          }}
        />
      ) : null}
    </div>
  );
}
