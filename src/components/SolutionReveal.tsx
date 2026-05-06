import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const SENTENCE =
  "Forma turns vague text into precise visual UI components.";

const WORD_STAGGER = 0.18; // seconds between each word reveal
const WORD_DURATION = 0.45;
const UNDERLINE_DELAY_AFTER_WORDS = 0.15; // breath between words finishing and underline starting
const UNDERLINE_DURATION = 1.1;

/**
 * Self-running solution reveal. When the section enters the viewport, the
 * sentence highlights word-by-word from left to right, and once the last
 * word lights up the gold dashed underline draws from left to right
 * underneath. No scroll-driven progress, no 200 vh tall pinned container —
 * just one `min-h-screen` section that animates itself once on entry.
 *
 * Single-line layout is preserved via fluid `clamp()` font sizing.
 */
export function SolutionReveal() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || hasPlayed) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasPlayed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasPlayed]);

  const words = SENTENCE.split(" ");
  const wordsEndAt = words.length * WORD_STAGGER + WORD_DURATION;
  const underlineDelay = wordsEndAt + UNDERLINE_DELAY_AFTER_WORDS;

  return (
    <div
      ref={sectionRef}
      className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6"
    >
      <p
        className="flex items-center justify-center font-semibold tracking-tight text-white"
        style={{ fontSize: "clamp(1rem, 3.2vw, 2.75rem)" }}
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0.2 }}
            animate={hasPlayed ? { opacity: 1 } : { opacity: 0.2 }}
            transition={{
              duration: WORD_DURATION,
              delay: i * WORD_STAGGER,
              ease: "easeOut",
            }}
            className="mx-1 whitespace-pre text-white lg:mx-2"
          >
            {word}
          </motion.span>
        ))}
      </p>

      {/* Fixed-width wrapper anchors the underline to the LEFT edge so the
          dashed line draws left → right instead of expanding from centre
          (the parent column is `items-center`, which would otherwise keep
          re-centring it). The mt is small so the line sits close to the
          baseline. */}
      <div
        aria-hidden="true"
        className="mt-2 w-full"
        style={{ maxWidth: "min(46rem, calc(100vw - 3rem))" }}
      >
        <motion.div
          className="h-[2px]"
          initial={{ width: "0%" }}
          animate={hasPlayed ? { width: "100%" } : { width: "0%" }}
          transition={{
            duration: UNDERLINE_DURATION,
            delay: underlineDelay,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #d4b87a 0 6px, transparent 6px 10px)",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
}
