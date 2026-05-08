import { type FC, type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

import { cn } from "../../lib/cn";

interface TextRevealByWordProps {
  /** The long vague version that reveals first, word by word. */
  text: string;
  /** Optional short, clean version that morphs IN after the underline draws. */
  shortText?: string;
  className?: string;
  /** Fraction of scroll consumed by the per-word brighten pass. Default 0.55. */
  wordsEnd?: number;
  /** When the dashed gold underline begins to draw. Default `wordsEnd`. */
  underlineStart?: number;
  /** When the underline reaches full width. Default 0.72. */
  underlineEnd?: number;
  /** When the long sentence begins fading out. Default 0.74. */
  morphStart?: number;
  /** When the short sentence is fully present. Default 0.92. */
  morphEnd?: number;
}

/**
 * Scroll-driven sentence reveal with an optional "vague → precise" morph.
 *
 * Layout: a 200vh outer block; the visible "stage" is a `sticky top-0`
 * full-screen flex centre. Framer-motion's `useScroll({ target })`
 * returns a `0 → 1` MotionValue that drives every animation phase.
 *
 * Phases:
 *   0           → wordsEnd        each word interpolates dim → bright
 *   underlineStart → underlineEnd dashed gold underline grows 0% → 100%
 *   morphStart  → morphEnd        long sentence fades + scales out;
 *                                  short sentence fades in over the top.
 *
 * If `shortText` is omitted the morph layer is skipped entirely and the
 * component behaves like the original word-brighten + underline reveal.
 */
const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  shortText,
  className,
  wordsEnd = 0.55,
  underlineStart,
  underlineEnd = 0.72,
  morphStart = 0.74,
  morphEnd = 0.92,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const ulStart = underlineStart ?? wordsEnd;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const words = text.split(" ");
  const underlineWidth = useTransform(scrollYProgress, [ulStart, underlineEnd], ["0%", "100%"]);

  const longOpacity = useTransform(scrollYProgress, [morphStart, morphEnd], [1, 0]);
  const longScale = useTransform(scrollYProgress, [morphStart, morphEnd], [1, 0.92]);
  const longBlur = useTransform(scrollYProgress, [morphStart, morphEnd], ["blur(0px)", "blur(8px)"]);

  const shortOpacity = useTransform(
    scrollYProgress,
    [morphStart + (morphEnd - morphStart) * 0.25, morphEnd],
    [0, 1],
  );
  const shortScale = useTransform(
    scrollYProgress,
    [morphStart + (morphEnd - morphStart) * 0.25, morphEnd],
    [1.08, 1],
  );

  const headingClass =
    "flex flex-wrap items-center justify-center text-balance text-center font-semibold tracking-tight text-2xl md:text-4xl lg:text-5xl xl:text-6xl";

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[220vh] w-full", className)}>
      <div className="sticky top-0 mx-auto flex h-screen max-w-5xl flex-col items-center justify-center px-6">
        {/* Stage: long + short occupy the same area so the morph cross-fades
            in place. minHeight reserves vertical space so the underline
            below doesn't jump when the short sentence collapses to one line. */}
        <div
          className="relative flex w-full items-center justify-center"
          style={{ minHeight: "clamp(180px, 32vh, 320px)" }}
        >
          <motion.p
            className={cn("absolute inset-0 m-0 flex items-center justify-center", headingClass)}
            style={
              shortText
                ? { opacity: longOpacity, scale: longScale, filter: longBlur }
                : undefined
            }
          >
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
          </motion.p>

          {shortText ? (
            <motion.p
              className={cn(
                "absolute inset-0 m-0 flex items-center justify-center text-white",
                headingClass,
              )}
              style={{ opacity: shortOpacity, scale: shortScale }}
            >
              {shortText}
            </motion.p>
          ) : null}
        </div>

        {/* Dashed gold underline grows from the LEFT after all words light.
            Stays visible through the morph so the short sentence inherits
            the same flourish. */}
        <div
          aria-hidden="true"
          className="mt-4 w-full"
          style={{ maxWidth: "min(46rem, calc(100vw - 3rem))" }}
        >
          <motion.div
            className="h-[2px]"
            style={{
              width: underlineWidth,
              backgroundImage:
                "repeating-linear-gradient(90deg, #d4b87a 0 6px, transparent 6px 10px)",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const color = useTransform(
    progress,
    [range[0], range[1]],
    ["rgba(255,255,255,0.18)", "rgba(255,255,255,1)"],
  );
  return (
    <motion.span style={{ color }} className="mx-1 lg:mx-2.5">
      {children}
    </motion.span>
  );
};

export { TextRevealByWord };
