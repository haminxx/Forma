import { type FC, type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

import { cn } from "../../lib/cn";

interface TextRevealByWordProps {
  text: string;
  className?: string;
  /**
   * Fraction of scroll progress consumed by the per-word brighten pass.
   * Words finish lighting up at this point; underline draws after.
   * Default: 0.72 (≈72 % of the 200vh scroll spent on words).
   */
  wordsEnd?: number;
  /** When the dashed underline begins to draw. */
  underlineStart?: number;
}

/**
 * Scroll-driven sentence reveal.
 *
 * Layout: a 200vh outer block; the visible "stage" is a `sticky top-0`,
 * full-screen flex centre. As the user scrolls the 200vh, framer-motion's
 * `useScroll({ target })` returns a `0 → 1` `scrollYProgress` MotionValue.
 *
 * Animation phases (driven by that single MotionValue):
 *   - 0   → wordsEnd        : each word interpolates from dim → bright in
 *                             order, left → right.
 *   - underlineStart → 1    : a dashed gold underline grows from `0%` to
 *                             `100%` width below the sentence.
 *
 * This is a fresh approach vs. the earlier two-span overlay: each word is
 * a single `motion.span` whose `color` MotionValue interpolates from a
 * muted token to white. Because the value drives `color` directly, the
 * brighten always runs in scroll order — there's no "pop on" because the
 * baseline already shows the word at low contrast.
 */
const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
  wordsEnd = 0.72,
  underlineStart = 0.78,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const words = text.split(" ");
  const underlineWidth = useTransform(scrollYProgress, [underlineStart, 1], ["0%", "100%"]);

  return (
    <div
      ref={targetRef}
      className={cn("relative z-0 h-[200vh] w-full", className)}
    >
      <div className="sticky top-0 mx-auto flex h-screen max-w-5xl flex-col items-center justify-center px-6">
        <p className="flex flex-wrap items-center justify-center text-balance text-center font-semibold tracking-tight text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
          {words.map((word, i) => {
            const start = (i / words.length) * wordsEnd;
            const end = ((i + 1) / words.length) * wordsEnd;
            return (
              <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>

        {/* Dashed gold underline grows from the LEFT after all words light. */}
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
