import { type FC, type ReactNode, useRef } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

import { cn } from "../../lib/cn";

interface TextRevealByWordProps {
  /** The sentence that brightens word-by-word as the user scrolls. */
  text: string;
  className?: string;
  /** Fraction of scroll consumed by the per-word brighten pass. Default 0.7. */
  wordsEnd?: number;
  /** When the gold per-line underline begins drawing. Default `wordsEnd`. */
  underlineStart?: number;
  /** When the per-line underline reaches full width on every line. Default 0.92. */
  underlineEnd?: number;
}

/**
 * Scroll-driven sentence reveal modelled on `animations/prompt.md`
 * (`MagicText`) — a permanently-dim "ghost" copy of every word with a
 * brighter overlay that fades in as the user scrolls.
 *
 * Phases (driven by a single `scrollYProgress` MotionValue):
 *   0          → wordsEnd       each word's bright overlay opacity 0 → 1
 *   ulStart    → underlineEnd   `background-size` of an inline gradient
 *                                 with `box-decoration-break: clone`
 *                                 grows 0 % → 100 % — a dashed gold
 *                                 underline appears UNDER EACH wrapped
 *                                 line independently.
 *
 * No scale / blur / morph: the sentence stays at its natural size for
 * the whole sticky stage. Font size is fluid (`clamp`) so the entire
 * sentence fits whatever viewport the user is on without horizontal
 * overflow or being cut off below the fold.
 */
const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
  wordsEnd = 0.7,
  underlineStart,
  underlineEnd = 0.92,
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

  return (
    <div
      ref={targetRef}
      className={cn("relative z-0 h-[200vh] w-full", className)}
    >
      <div className="sticky top-0 mx-auto flex h-screen w-full max-w-6xl flex-col items-center justify-center px-6">
        <p
          className="m-0 w-full text-balance text-center font-semibold tracking-tight"
          style={{
            // Fluid size: small phones get ~1.4rem, ultra-wide desks
            // get ~3rem — never larger than that, so the long sentence
            // always fits in the viewport's vertical band.
            fontSize: "clamp(1.4rem, 2.8vw, 3rem)",
            lineHeight: 1.35,
          }}
        >
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
