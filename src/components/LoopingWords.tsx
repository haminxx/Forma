import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * LoopingWords — vertically scrolling list of UI component names. Inspired
 * by the GSAP looping-words pattern in `animations/loopingwords.md`,
 * implemented with framer-motion (already in the bundle) so we don't
 * pull GSAP in for ~25 KB extra gzip.
 *
 * Behaviour:
 *   - Auto-advances every WORD_INTERVAL_MS with a soft spring "settle"
 *     so the word lands with a hint of elastic overshoot.
 *   - Selector "edge" brackets at the four corners snap-animate their
 *     width to match the centred word's width, mirroring the original
 *     `looping-words__edge` markers.
 *   - Hover pauses the loop and pops a tiny preview card showing a live
 *     visual of whichever component is centred.
 *   - Doubled list trick keeps wrap-around seamless: when the cursor
 *     reaches the duplicate's first word, we hot-reset back to true 0
 *     with a zero-duration step.
 */

const ROW_HEIGHT = 72;
const WORD_INTERVAL_MS = 2400;

const COMPONENT_WORDS = [
  "Button",
  "Card",
  "Modal",
  "Drawer",
  "Tabs",
  "Accordion",
  "Popover",
  "Tooltip",
  "Toast",
  "Avatar",
] as const;
type ComponentWord = (typeof COMPONENT_WORDS)[number];

export function LoopingWords() {
  const N = COMPONENT_WORDS.length;
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [edgeWidth, setEdgeWidth] = useState(0);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (paused || isSnapping) return;
    tickRef.current = setTimeout(() => {
      if (index < N) {
        setIndex((i) => i + 1);
      } else {
        // Reached the duplicate's first word — snap back to true 0 with a
        // zero-duration transition so the rewind is invisible.
        setIsSnapping(true);
        setTimeout(() => {
          setIndex(0);
          setIsSnapping(false);
        }, 30);
      }
    }, WORD_INTERVAL_MS);
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
  }, [paused, isSnapping, index, N]);

  // Track the centred word's natural width so the selector edges can
  // snap to it. Re-measures on index change and on window resize.
  useLayoutEffect(() => {
    const measure = () => {
      const el = wordRefs.current[index % N];
      if (!el) return;
      const inner = el.querySelector<HTMLSpanElement>("[data-word-text]");
      if (inner) setEdgeWidth(inner.getBoundingClientRect().width);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [index, N]);

  const doubled = [...COMPONENT_WORDS, ...COMPONENT_WORDS];
  const currentWord = COMPONENT_WORDS[index % N] ?? COMPONENT_WORDS[0];

  return (
    <div
      className="relative w-full max-w-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.55)] sm:p-6">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/45">
          UI vocabulary
        </p>
        <p className="mb-4 text-xs text-white/50">
          Canonical component names — the words models reach for first.
        </p>

        <div
          className="relative overflow-hidden"
          style={{ height: ROW_HEIGHT }}
          aria-live="off"
        >
        <motion.ul
          className="m-0 list-none p-0"
          animate={{ y: -index * ROW_HEIGHT }}
          transition={
            isSnapping
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 14, mass: 1 }
          }
        >
          {doubled.map((word, i) => (
            <li
              key={i}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="flex items-center"
              style={{ height: ROW_HEIGHT }}
            >
              <span
                data-word-text
                className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                style={{ color: "#d4b87a" }}
              >
                {word}
              </span>
            </li>
          ))}
        </motion.ul>

        {/* Top + bottom fades so words ease in / out of the visible row. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-[#191a1f] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-[#191a1f] to-transparent" />

        {/* Selector — corner brackets that animate-width to match the
            centred word, the same idea as the GSAP `looping-words__edge`
            elements in the spec. Padding (px-2) gives the bracket some
            breathing room around the glyph. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
          style={{ height: ROW_HEIGHT }}
          animate={{ width: edgeWidth + 20 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
        >
          <span className="absolute left-0 top-1 h-2.5 w-2.5 border-l-[1.5px] border-t-[1.5px] border-[#d4b87a]" />
          <span className="absolute right-0 top-1 h-2.5 w-2.5 border-r-[1.5px] border-t-[1.5px] border-[#d4b87a]" />
          <span className="absolute bottom-1 left-0 h-2.5 w-2.5 border-b-[1.5px] border-l-[1.5px] border-[#d4b87a]" />
          <span className="absolute bottom-1 right-0 h-2.5 w-2.5 border-b-[1.5px] border-r-[1.5px] border-[#d4b87a]" />
        </motion.div>
      </div>
      </div>

      <AnimatePresence>
        {paused && (
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, x: 12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="absolute right-full top-1/2 z-20 mr-6 -translate-y-1/2"
          >
            <WordPreviewCard word={currentWord} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WordPreviewCard({ word }: { word: ComponentWord }) {
  return (
    <div className="w-[17.5rem] rounded-xl border border-white/12 bg-[#1a1a1f]/95 p-5 shadow-[0_22px_55px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md">
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
        Component
      </p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight text-white">
        {word}
      </h3>
      <div className="mt-4 flex h-24 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <ComponentDemo word={word} />
      </div>
    </div>
  );
}

function ComponentDemo({ word }: { word: ComponentWord }): ReactNode {
  switch (word) {
    case "Button":
      return (
        <motion.button
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-black"
        >
          Click me
        </motion.button>
      );
    case "Card":
      return (
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-36 rounded-md border border-white/10 bg-white/[0.04] p-2.5"
        >
          <div className="h-1 w-12 rounded-full bg-white/30" />
          <div className="mt-1.5 h-1 w-20 rounded-full bg-white/15" />
          <div className="mt-1 h-1 w-16 rounded-full bg-white/15" />
        </motion.div>
      );
    case "Modal":
      return (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-40 rounded-md border border-white/15 bg-[#1a1a1f] p-2.5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-14 rounded-full bg-white/40" />
            <div className="h-3 w-3 rounded-sm border border-white/20" />
          </div>
          <div className="mt-2 h-1 w-24 rounded-full bg-white/15" />
          <div className="mt-1 h-1 w-20 rounded-full bg-white/15" />
        </motion.div>
      );
    case "Drawer":
      return (
        <div className="relative h-16 w-40 overflow-hidden rounded-md border border-white/10 bg-white/[0.02]">
          <motion.div
            initial={{ x: 60 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="absolute right-0 top-0 h-full w-20 bg-white/[0.08]"
          >
            <div className="m-2 h-1 w-12 rounded-full bg-white/30" />
            <div className="mx-2 mt-1 h-1 w-10 rounded-full bg-white/15" />
          </motion.div>
        </div>
      );
    case "Tabs":
      return (
        <div className="flex gap-1.5">
          {["One", "Two", "Three"].map((t, i) => (
            <motion.span
              key={t}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={
                i === 0
                  ? "rounded-md bg-white px-2.5 py-1 text-xs font-medium text-black"
                  : "rounded-md border border-white/15 px-2.5 py-1 text-xs text-white/60"
              }
            >
              {t}
            </motion.span>
          ))}
        </div>
      );
    case "Accordion":
      return (
        <div className="w-40 rounded-md border border-white/10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between border-b border-white/10 px-2.5 py-2"
          >
            <div className="h-1 w-16 rounded-full bg-white/40" />
            <span className="text-[10px] text-white/40">−</span>
          </motion.div>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 28, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-2.5 py-2"
          >
            <div className="h-1 w-20 rounded-full bg-white/15" />
            <div className="mt-1 h-1 w-12 rounded-full bg-white/10" />
          </motion.div>
          <div className="flex items-center justify-between px-2.5 py-2">
            <div className="h-1 w-12 rounded-full bg-white/40" />
            <span className="text-[10px] text-white/40">+</span>
          </div>
        </div>
      );
    case "Popover":
      return (
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-32 rounded-md border border-white/15 bg-[#1a1a1f] px-3 py-2 shadow-lg"
        >
          <div className="h-1 w-14 rounded-full bg-white/40" />
          <div className="mt-1 h-1 w-20 rounded-full bg-white/15" />
          <div
            aria-hidden="true"
            className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-[#1a1a1f]"
          />
        </motion.div>
      );
    case "Tooltip":
      return (
        <motion.div
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative rounded bg-white px-2 py-1 text-xs font-medium text-black"
        >
          Save changes
          <div
            aria-hidden="true"
            className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white"
          />
        </motion.div>
      );
    case "Toast":
      return (
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="flex w-44 items-center gap-2 rounded-md border border-white/10 bg-[#1a1a1f] p-2"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <div className="flex-1">
            <div className="h-1 w-20 rounded-full bg-white/40" />
            <div className="mt-1 h-1 w-14 rounded-full bg-white/15" />
          </div>
        </motion.div>
      );
    case "Avatar":
      return (
        <div className="flex -space-x-2">
          {["A", "B", "C"].map((ch, i) => (
            <motion.div
              key={ch}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#1a1a1f] bg-white/15 text-xs font-semibold text-white"
            >
              {ch}
            </motion.div>
          ))}
        </div>
      );
    default:
      return <span className="text-xs text-white/40">Demo</span>;
  }
}
