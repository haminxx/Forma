import { Outlet } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Github } from "lucide-react";
import { PillNav } from "../components/PillNav";
import { SiteFooter } from "../components/SiteFooter";

/** Seconds after load — lands just after the nav pill finishes widening. */
const FLANK_ENTRANCE_DELAY = 0.62;

/**
 * Header layout (revised per latest direction):
 *
 *   - Brand mark + GitHub button + PillNav are ALL `position: fixed`
 *     in the same row at top: 5 of the viewport. The whole header
 *     floats together as the user scrolls — none of the three
 *     elements scroll out of view.
 *   - Single grid wrapper (`1fr auto 1fr`) keeps the pill perfectly
 *     centred regardless of brand / button widths, exactly like the
 *     pre-split layout.
 *   - The wrapper is `pointer-events-none` so its empty centre column
 *     never blocks clicks on hero content beneath; the children re-
 *     enable pointer events on themselves.
 *   - Logo + GitHub play a delayed fade/slide **after** the pill
 *     expansion (see `FLANK_ENTRANCE_DELAY`): logo from the right,
 *     GitHub from the left, as if emerging from the growing bar.
 *
 * <main> starts at y=0 of the document because the header is out of
 * flow (fixed). The home hero (`h-screen`) fills the viewport from
 * the very top.
 */
export function AppShell() {
  const reduceMotion = useReducedMotion();
  const flankTransition = reduceMotion
    ? { duration: 0.01 }
    : {
        delay: FLANK_ENTRANCE_DELAY,
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1] as const,
      };

  return (
    <div
      data-app-shell
      className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]"
    >
      <header className="pointer-events-none fixed inset-x-0 top-5 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <BrandMark transition={flankTransition} reduceMotion={!!reduceMotion} />
        <div className="pointer-events-auto justify-self-center">
          <PillNav />
        </div>
        <GithubButton transition={flankTransition} reduceMotion={!!reduceMotion} />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

function BrandMark({
  transition,
  reduceMotion,
}: {
  transition: { duration: number; delay?: number; ease?: readonly [number, number, number, number] };
  reduceMotion: boolean;
}) {
  return (
    <motion.a
      href="/"
      aria-label="Forma — home"
      className="pointer-events-auto group inline-flex min-h-[52px] shrink-0 items-center rounded-full py-1 pl-1 pr-1 text-white transition-opacity hover:opacity-90 sm:min-h-[56px]"
      initial={reduceMotion ? false : { opacity: 0, x: 44 }}
      animate={{ opacity: 1, x: 0 }}
      transition={transition}
    >
      <img
        src="/logos/forma-wordmark.png"
        alt=""
        draggable={false}
        className="h-10 w-auto max-w-[min(52vw,220px)] object-contain opacity-[0.98] sm:h-12 sm:max-w-none md:h-[52px]"
      />
    </motion.a>
  );
}

function GithubButton({
  transition,
  reduceMotion,
}: {
  transition: { duration: number; delay?: number; ease?: readonly [number, number, number, number] };
  reduceMotion: boolean;
}) {
  return (
    <motion.a
      href="https://github.com/haminxx/forma"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Forma on GitHub"
      className="pointer-events-auto group inline-flex h-11 items-center gap-2 justify-self-end rounded-full border border-white/15 bg-white/[0.04] px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      initial={reduceMotion ? false : { opacity: 0, x: -44 }}
      animate={{ opacity: 1, x: 0 }}
      transition={transition}
    >
      <Github
        size={16}
        strokeWidth={1.8}
        className="text-white/80 transition-colors group-hover:text-white"
      />
      <span className="hidden sm:inline">GitHub</span>
    </motion.a>
  );
}
