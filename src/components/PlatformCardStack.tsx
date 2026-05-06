import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Card stack of AI design/IDE platforms Forma plugs into. Adapted from the
 * AnimatedCardStack reference: 5 platforms cycle through the front three
 * positions; each card is a link to the platform's prompt-input page. Visuals
 * use platform-tinted gradients (no external OG hotlinks — those drift /
 * CORS / break in production).
 */

type PlatformContent = {
  title: string;
  tagline: string;
  url: string;
  gradient: string;
  fg: string;
};

const PLATFORMS: readonly PlatformContent[] = [
  {
    title: "Vercel v0",
    tagline: "Generate UI from a prompt.",
    url: "https://v0.app",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    fg: "#ffffff",
  },
  {
    title: "Replit",
    tagline: "Cloud IDE with Agent.",
    url: "https://replit.com",
    gradient: "linear-gradient(135deg, #0e1525 0%, #1c2333 60%, #f26207 130%)",
    fg: "#ffffff",
  },
  {
    title: "Manus",
    tagline: "An autonomous agent for tasks.",
    url: "https://manus.im",
    gradient: "linear-gradient(135deg, #0d1014 0%, #1a1f25 100%)",
    fg: "#ffffff",
  },
  {
    title: "Lovable",
    tagline: "Idea to app in seconds.",
    url: "https://lovable.dev",
    gradient: "linear-gradient(135deg, #150f1d 0%, #2a1f3d 60%, #c084fc 130%)",
    fg: "#ffffff",
  },
  {
    title: "Bolt",
    tagline: "Prompt, run, deploy full-stack.",
    url: "https://bolt.new",
    gradient: "linear-gradient(135deg, #0c1116 0%, #1c252e 60%, #22d3ee 130%)",
    fg: "#ffffff",
  },
] as const;

type Card = { id: number; platformIndex: number };

const INITIAL_CARDS: Card[] = [
  { id: 1, platformIndex: 0 },
  { id: 2, platformIndex: 1 },
  { id: 3, platformIndex: 2 },
];

const positionStyles: Array<{ scale: number; y: number }> = [
  { scale: 1, y: 12 },
  { scale: 0.95, y: -16 },
  { scale: 0.9, y: -44 },
];

const exitAnimation = { y: 340, scale: 1, zIndex: 10 } as const;
const enterAnimation = { y: -16, scale: 0.9 } as const;

function CardContent({ platform }: { platform: PlatformContent }) {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <a
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        className="-outline-offset-1 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-xl outline outline-white/10"
        style={{ background: platform.gradient }}
        aria-label={`Open ${platform.title}`}
      >
        <span
          className="select-none text-3xl font-semibold tracking-tight"
          style={{ color: platform.fg }}
        >
          {platform.title}
        </span>
      </a>
      <div className="flex w-full items-center justify-between gap-2 px-3 pb-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-white">{platform.title}</span>
          <span className="text-white/55">{platform.tagline}</span>
        </div>
        <a
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 shrink-0 select-none items-center gap-1 rounded-full bg-white pl-4 pr-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Visit
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M9.5 18L15.5 12L9.5 6" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function AnimatedCard({
  card,
  index,
  isAnimating,
}: {
  card: Card;
  index: number;
  isAnimating: boolean;
}) {
  const pos = positionStyles[index] ?? positionStyles[2]!;
  const { scale, y } = pos;
  const zIndex = index === 0 && isAnimating ? 10 : 3 - index;

  const exitAnim = index === 0 ? exitAnimation : undefined;
  const initialAnim = index === 2 ? enterAnimation : undefined;

  const platform = PLATFORMS[card.platformIndex] ?? PLATFORMS[0]!;

  return (
    <motion.div
      key={card.id}
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{ type: "spring", duration: 1, bounce: 0 }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        bottom: 0,
      }}
      className="absolute flex h-[280px] w-[324px] items-center justify-center overflow-hidden rounded-t-xl border-x border-t border-white/10 bg-white/[0.04] p-1 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl will-change-transform sm:w-[512px]"
    >
      <CardContent platform={platform} />
    </motion.div>
  );
}

export function PlatformCardStack() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextId, setNextId] = useState(4);

  const handleAnimate = () => {
    setIsAnimating(true);
    const last = cards[cards.length - 1];
    if (!last) return;
    const nextPlatformIndex = (last.platformIndex + 1) % PLATFORMS.length;

    setCards([...cards.slice(1), { id: nextId, platformIndex: nextPlatformIndex }]);
    setNextId((prev) => prev + 1);
    setIsAnimating(false);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative h-[380px] w-full overflow-hidden sm:w-[644px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 3).map((card, index) => (
            <AnimatedCard
              key={card.id}
              card={card}
              index={index}
              isAnimating={isAnimating}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-white/10 py-4">
        <button
          onClick={handleAnimate}
          className="flex h-9 select-none items-center justify-center gap-1 overflow-hidden rounded-lg border border-white/15 bg-white/5 px-3 font-medium text-white transition-all hover:bg-white/10 active:scale-[0.98]"
        >
          Animate
        </button>
      </div>
    </div>
  );
}
