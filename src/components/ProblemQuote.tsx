import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import DotPattern from "./ui/dot-pattern";
import { cn } from "../lib/cn";

/**
 * Problem screen quote — dot-pattern framed block adapted from the
 * user-pasted `dot-pattern-1` snippet. We swap the snippet's red
 * accents for Forma's gold (#d4b87a) and add a per-line reveal so the
 * quote builds up dramatically as the section scrolls into view.
 *
 *   ┌─■──────────────────────────────────────────────■─┐  ← gold pixel corners
 *   │ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │  ← gold dot pattern
 *   │                                                  │
 *   │   gold eyebrow                                   │
 *   │                                                  │
 *   │   "You ask for a 'card.'      <- line 1         │
 *   │   Your teammate hears         <- line 2         │
 *   │   something entirely          <- line 3         │
 *   │   different."                 <- line 4         │
 *   │                                                  │
 *   └─■──────────────────────────────────────────────■─┘
 *
 * Each line uses an alternating bold/thin weight rhythm
 * (the same trick from the reference snippet) so the eye lands on
 * the stressed words.
 */

type Token = { text: string; weight: "bold" | "thin" };
type Line = { tokens: Token[] };

const QUOTE_LINES: Line[] = [
  {
    tokens: [
      { text: '"You ask for a', weight: "bold" },
      { text: "'card.'", weight: "thin" },
    ],
  },
  {
    tokens: [
      { text: "Your teammate", weight: "thin" },
      { text: "hears", weight: "bold" },
    ],
  },
  {
    tokens: [
      { text: "something", weight: "thin" },
      { text: "entirely", weight: "bold" },
    ],
  },
  {
    tokens: [{ text: 'different."', weight: "bold" }],
  },
];

interface ProblemQuoteProps {
  className?: string;
}

export function ProblemQuote({ className }: ProblemQuoteProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // `once: false` so the per-line stagger replays whenever the user
  // scrolls back into the section — same revert-on-exit behaviour the
  // testimonial used to have.
  const inView = useInView(ref, { amount: 0.35, once: false });

  return (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full max-w-7xl px-6 md:px-8 xl:px-0",
        className,
      )}
    >
      <div className="relative flex flex-col items-center border border-[#d4b87a]/30">
        <DotPattern
          width={5}
          height={5}
          className="fill-[#d4b87a]/30 md:fill-[#d4b87a]/55"
        />

        {/* Gold pixel corners — same idea as the snippet's red squares,
            keyed to Forma's accent. */}
        <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-[#d4b87a]" />
        <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-[#d4b87a]" />
        <div className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-[#d4b87a]" />
        <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-[#d4b87a]" />

        <div className="relative z-20 mx-auto w-full max-w-7xl rounded-[40px] py-8 md:p-10 xl:py-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={
              inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="md:text-md text-xs font-medium uppercase tracking-[0.22em] text-[#d4b87a] lg:text-base xl:text-lg"
          >
            We've all said it.
          </motion.p>

          <div className="mt-3 text-2xl tracking-tighter text-white md:mt-4 md:text-5xl lg:text-6xl xl:text-7xl">
            {QUOTE_LINES.map((line, lineIdx) => (
              <motion.div
                key={lineIdx}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={
                  inView
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 24, filter: "blur(8px)" }
                }
                transition={{
                  duration: 0.55,
                  // Staggered per-line entry — each line lands ~0.35s
                  // after the one before it, with a tiny lead-in so
                  // the eyebrow has time to settle first.
                  delay: 0.25 + lineIdx * 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-wrap items-baseline gap-1 md:gap-2 lg:gap-3 xl:gap-4"
              >
                {line.tokens.map((token, tokenIdx) => (
                  <span
                    key={tokenIdx}
                    className={
                      token.weight === "bold"
                        ? "font-semibold text-white"
                        : "font-thin text-white/65"
                    }
                  >
                    {token.text}
                  </span>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
