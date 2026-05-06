import { type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

const SENTENCE =
  "Forma turns vague text into precise visual UI components.";

/**
 * Scroll-driven sentence reveal.
 *
 * The outer container is 200vh tall. The inner panel is `sticky top-0`, so
 * the sentence stays pinned in the viewport while the user scrolls past it.
 *   - First 75 % of scroll progress: each word fades in left → right.
 *   - Last 25 %: a gold dashed "breaking" underline draws left → right
 *     beneath the entire sentence.
 *
 * Single-line layout via fluid `clamp(...vw...)` font sizing so all eight
 * words sit on one line from mobile through 4K.
 */
export function SolutionReveal() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const words = SENTENCE.split(" ");

  const WORDS_END = 0.75; // word reveal completes at 75 % scroll
  const UNDERLINE_START = 0.78; // small breath, then underline draws

  const underlineWidth = useTransform(
    scrollYProgress,
    [UNDERLINE_START, 1],
    ["0%", "100%"],
  );

  return (
    <div ref={targetRef} className="relative h-[200vh]">
      <div className="sticky top-0 mx-auto flex h-screen max-w-6xl flex-col items-center justify-center px-6">
        <p
          className="flex items-center justify-center font-semibold tracking-tight text-white/30"
          style={{ fontSize: "clamp(1rem, 3.2vw, 2.75rem)" }}
        >
          {words.map((word, i) => {
            const start = (i / words.length) * WORDS_END;
            const end = ((i + 1) / words.length) * WORDS_END;
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
        </p>

        {/* The dashed gold underline lives in a left-anchored fixed-width
            wrapper so it grows from the LEFT edge instead of expanding from
            the centre (the parent column is `items-center`, which would
            otherwise re-centre the underline as its width animates). The
            wrapper width matches the sentence's natural width via the same
            clamp scale, so the line ends right under the period. */}
        <div
          aria-hidden="true"
          className="mt-3 w-full"
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
      <span>{children}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 text-white"
      >
        {children}
      </motion.span>
    </span>
  );
}
