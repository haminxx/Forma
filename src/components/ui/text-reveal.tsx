import { type FC, type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

import { cn } from "../../lib/cn";

interface TextRevealByWordProps {
  /** The long vague sentence that brightens word-by-word. */
  text: string;
  /** Optional short clean tagline that morphs in after the underline lands. */
  shortText?: string;
  className?: string;
  /** Fraction of scroll consumed by the per-word brighten pass. Default 0.55. */
  wordsEnd?: number;
  /** When the gold per-line underline begins drawing. Default `wordsEnd`. */
  underlineStart?: number;
  /** When the per-line underline reaches full width on every line. Default 0.72. */
  underlineEnd?: number;
  /** When the long sentence begins shrinking out. Default 0.74. */
  morphStart?: number;
  /** When the short tagline is fully present. Default 0.94. */
  morphEnd?: number;
}

/**
 * Scroll-driven sentence reveal modelled on `animations/prompt.md`
 * (`MagicText`) — a permanently-dim "ghost" copy of every word with a
 * brighter overlay that fades in as the user scrolls.
 *
 *   0          → wordsEnd        each word's bright overlay opacity 0 → 1
 *   ulStart    → underlineEnd    `background-size` of an inline gradient
 *                                  with `box-decoration-break: clone`
 *                                  grows 0% → 100% — paints a dashed
 *                                  gold underline UNDER EACH wrapped
 *                                  line independently.
 *   morphStart → morphEnd        long sentence + its line-underlines
 *                                  shrink + blur + fade out, while the
 *                                  short tagline scales + fades in.
 *
 * Layout: a 220vh outer block; the visible "stage" is a `sticky top-0`
 * full-screen flex centre, so the user scrolls through the section to
 * advance every phase.
 */
const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  shortText,
  className,
  wordsEnd = 0.55,
  underlineStart,
  underlineEnd = 0.72,
  morphStart = 0.74,
  morphEnd = 0.94,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const ulStart = underlineStart ?? wordsEnd;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const words = text.split(" ");

  // Per-line underline width animated as `background-size: X% 2px`.
  // Because the bg lives on an inline element with
  // `box-decoration-break: clone`, the gradient paints separately on
  // every wrapped line, so the underlines all draw left → right at the
  // same rate.
  const ulPct = useTransform(scrollYProgress, [ulStart, underlineEnd], [0, 100]);
  const ulBgSize = useTransform(ulPct, (p) => `${Math.max(0, Math.min(100, p))}% 2px`);

  // Long sentence morph: visible shrink so it reads as the long sentence
  // physically collapsing into the short one.
  const longOpacity = useTransform(scrollYProgress, [morphStart, morphEnd], [1, 0]);
  const longScale = useTransform(scrollYProgress, [morphStart, morphEnd], [1, 0.55]);
  const longBlur = useTransform(
    scrollYProgress,
    [morphStart, morphEnd],
    ["blur(0px)", "blur(6px)"],
  );

  const shortFadeStart = morphStart + (morphEnd - morphStart) * 0.4;
  const shortOpacity = useTransform(scrollYProgress, [shortFadeStart, morphEnd], [0, 1]);
  const shortScale = useTransform(scrollYProgress, [shortFadeStart, morphEnd], [0.95, 1]);

  const headingClass =
    "m-0 text-balance text-center font-semibold tracking-tight leading-[1.25] text-2xl md:text-4xl lg:text-5xl xl:text-6xl";

  return (
    <div
      ref={targetRef}
      className={cn("relative z-0 h-[220vh] w-full", className)}
    >
      <div className="sticky top-0 mx-auto flex h-screen max-w-5xl flex-col items-center justify-center px-6">
        <div
          className="relative w-full"
          style={{ minHeight: "clamp(220px, 40vh, 360px)" }}
        >
          {/* LONG sentence — multi-line, per-line gold underline drawn
              via inline bg-image with `box-decoration-break: clone`. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={
              shortText
                ? { opacity: longOpacity, scale: longScale, filter: longBlur }
                : undefined
            }
          >
            <p className={headingClass}>
              <UnderlineSpan bgSize={ulBgSize}>
                {words.map((word, i) => {
                  const start = (i / words.length) * wordsEnd;
                  const end = ((i + 1) / words.length) * wordsEnd;
                  return (
                    <Word
                      key={`${word}-${i}`}
                      progress={scrollYProgress}
                      range={[start, end]}
                    >
                      {word}
                    </Word>
                  );
                })}
              </UnderlineSpan>
            </p>
          </motion.div>

          {/* SHORT tagline — scales + fades in over the same area. */}
          {shortText ? (
            <motion.p
              className={cn(
                "absolute inset-0 flex items-center justify-center text-white",
                headingClass,
              )}
              style={{ opacity: shortOpacity, scale: shortScale }}
            >
              {shortText}
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface UnderlineSpanProps {
  bgSize: MotionValue<string>;
  children: ReactNode;
}

/**
 * Inline wrapper that paints a dashed gold underline at the bottom of
 * EVERY wrapped line of its text. Driven by an animated background-size.
 * `box-decoration-break: clone` is the bit that makes the gradient
 * repeat per line fragment instead of being one giant gradient across
 * the whole element.
 */
const UnderlineSpan: FC<UnderlineSpanProps> = ({ bgSize, children }) => (
  <motion.span
    style={{
      display: "inline",
      WebkitBoxDecorationBreak: "clone",
      boxDecorationBreak: "clone",
      backgroundImage:
        "repeating-linear-gradient(90deg, #d4b87a 0 6px, transparent 6px 10px)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 100%",
      backgroundSize: bgSize as unknown as string,
      paddingBottom: "0.18em",
    }}
  >
    {children}
  </motion.span>
);

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

/**
 * MagicText-style ghost + bright overlay:
 *   - The "ghost" is a permanently dim copy of the word, positioned
 *     absolutely behind the bright copy. So before any scroll, the user
 *     can already read the sentence at low contrast.
 *   - The "bright" copy starts at opacity 0 and animates to 1 across
 *     the word's slice of `scrollYProgress`. As the user scrolls, the
 *     bright copy lights up and dominates the visual.
 */
const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, [range[0], range[1]], [0, 1]);
  return (
    <span style={{ position: "relative", marginRight: "0.4ch" }}>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          color: "rgba(255,255,255,0.18)",
        }}
      >
        {children}
      </span>
      <motion.span style={{ opacity, color: "#ffffff" }}>{children}</motion.span>
    </span>
  );
};

export { TextRevealByWord };
