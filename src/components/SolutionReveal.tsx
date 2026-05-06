import { type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

const SENTENCE =
  "Forma turns vague UI words into precise, generation-ready vocabulary.";

/**
 * Scroll-driven sentence reveal — adapted from the TextRevealByWord pattern.
 * The outer container is 200vh; an inner sticky panel pins the sentence in
 * the viewport for the duration. Each word's opacity is mapped to its slice
 * of scrollYProgress, so the sentence brightens as the user scrolls. Once
 * the words are revealed, a gold dashed underline draws left-to-right with
 * a brief mid-stroke pause (the "breaking" feel from the prior design).
 */
export function SolutionReveal() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const words = SENTENCE.split(" ");

  // Underline draws from 0% → 100% as the reader passes through the second
  // half of the section. Multi-stop input creates a small pause around 38%
  // (the "break" in the line that matches the original Forma look).
  const underlineWidth = useTransform(
    scrollYProgress,
    [0.6, 0.8, 0.85, 1],
    ["0%", "38%", "38%", "100%"],
  );

  return (
    <div ref={targetRef} className="relative h-[200vh]">
      <div className="sticky top-0 mx-auto flex h-screen max-w-4xl flex-col items-center justify-center px-6">
        <p className="flex flex-wrap justify-center text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
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
            maxWidth: "46rem",
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
    <span className="relative mx-1 lg:mx-2">
      <span className="opacity-20">{children}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 text-white"
      >
        {children}
      </motion.span>
    </span>
  );
}
