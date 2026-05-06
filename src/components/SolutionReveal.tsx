import { type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

const SENTENCE =
  "Forma turns vague text into precise visual UI components.";

/**
 * Scroll-driven one-line reveal. Sentence stays pinned in the viewport while
 * the user scrolls through a 200vh container; each word's opacity is mapped
 * to its slice of progress (compressed into 0 → 0.65 of the scroll). After
 * the words finish, a gold dashed underline draws left-to-right between
 * progress 0.7 and 1.0.
 *
 * The font size is fluid via `clamp(...vw...)` so all eight words can fit on
 * a single line across viewport widths without flex-wrap.
 */
export function SolutionReveal() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const words = SENTENCE.split(" ");

  // Word reveals occupy the first 65% of the scroll; the remaining 35%
  // belongs to the underline draw (with a small breath between).
  const WORDS_END = 0.65;
  const UNDERLINE_START = 0.72;

  const underlineWidth = useTransform(
    scrollYProgress,
    [UNDERLINE_START, 1],
    ["0%", "100%"],
  );

  return (
    <div ref={targetRef} className="relative h-[200vh]">
      <div className="sticky top-0 mx-auto flex h-screen max-w-6xl flex-col items-center justify-center px-6">
        <p
          className="flex items-center justify-center font-semibold tracking-tight text-white"
          style={{ fontSize: "clamp(1rem, 3.2vw, 2.75rem)" }}
        >
          {words.map((word, i) => {
            const start = (i / words.length) * WORDS_END;
            const end = ((i + 1) / words.length) * WORDS_END;
            return (
              <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>

        <motion.div
          aria-hidden="true"
          className="mt-8 h-[2px]"
          style={{
            width: underlineWidth,
            maxWidth: "min(46rem, calc(100vw - 3rem))",
            backgroundImage:
              "repeating-linear-gradient(90deg, #d4b87a 0 6px, transparent 6px 10px)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 2px",
          }}
        />
      </div>
    </div>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 whitespace-pre lg:mx-2">
      <span className="opacity-20">{children}</span>
      <motion.span style={{ opacity }} className="absolute inset-0 text-white">
        {children}
      </motion.span>
    </span>
  );
}
