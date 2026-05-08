import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useInView } from "framer-motion";
import { FastForward, Rewind } from "lucide-react";

import { cn } from "../../lib/cn";

/** One slide entry — `id` is stable within the carousel set only. */
export interface CarouselItem {
  id: number;
  title: string;
}

type InfiniteCarouselItem = CarouselItem & {
  /** Unique React key spanning all triplicated instances. */
  keyId: string;
  originalIndex: number;
};

function createInfiniteItems(
  originalItems: CarouselItem[],
): InfiniteCarouselItem[] {
  const out: InfiniteCarouselItem[] = [];
  for (let copy = 0; copy < 3; copy += 1) {
    originalItems.forEach((item, index) => {
      out.push({
        ...item,
        keyId: `${copy}-${item.id}-${index}`,
        originalIndex: index,
      });
    });
  }
  return out;
}

interface RulerLinesProps {
  top?: boolean;
  totalLines?: number;
}

/** Horizontal tick ruler — mirrors the reference aesthetic with Forma's gold accents. */
function RulerLines({ top = true, totalLines = 100 }: RulerLinesProps) {
  const lines: ReactNode[] = [];
  const lineSpacing = 100 / (totalLines - 1);

  for (let i = 0; i < totalLines; i += 1) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let height = "h-3";
    let color = "bg-white/35";

    if (isCenter) {
      height = "h-8";
      color = "bg-[#d4b87a]";
    } else if (isFifth) {
      height = "h-4";
      color = "bg-[#e7cf95]/85";
    }

    const anchor = top ? "top-0" : "bottom-0";

    lines.push(
      <div
        key={i}
        className={`absolute w-px ${height} ${color} ${anchor}`}
        style={{ left: `${i * lineSpacing}%` }}
      />,
    );
  }

  return <div className="relative h-8 w-full px-4">{lines}</div>;
}

export interface RulerCarouselProps {
  originalItems: CarouselItem[];
  /** Which original item index (0-based) is visually centred on mount. */
  initialOriginalIndex?: number;
  className?: string;
}

/**
 * Infinite horizontal “ruler carousel” adapted from `ruler-carousel.tsx`.
 *
 * Improvements over the paste:
 *   - **Responsive sizing** — `ResizeObserver` measures slide width +
 *     computed flex-gap so translation stays centred on every breakpoint.
 *   - **Forma styling** — gold ticks + typography on the dark bg.
 *   - **Keyboard nav only when visible** — arrows only while ≥20 %
 *     in view so we don't steal keys elsewhere on long pages.
 *   - **Strict TypeScript** — triplicated slides carry synthetic `keyId`.
 */
export function RulerCarousel({
  originalItems,
  initialOriginalIndex = 4,
  className,
}: RulerCarouselProps) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;
  const boundedStart = Math.min(
    Math.max(0, initialOriginalIndex % Math.max(itemsPerSet, 1)),
    Math.max(0, itemsPerSet - 1),
  );

  const [activeIndex, setActiveIndex] = useState(itemsPerSet + boundedStart);
  const [translateX, setTranslateX] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const inView = useInView(rootRef, { amount: 0.2 });

  const [geom, setGeom] = useState({ slide: 400, gap: 64, vp: 800 });

  const measure = () => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;

    const firstSlot = track.querySelector<HTMLElement>("[data-carousel-slot]");
    if (!firstSlot) return;

    const slidePx = firstSlot.offsetWidth;
    const cs = window.getComputedStyle(track);
    const gapRaw = cs.columnGap || cs.gap || "0";
    const gapPx = Number.parseFloat(gapRaw) || 0;

    setGeom({
      slide: slidePx,
      gap: gapPx,
      vp: vp.clientWidth,
    });
  };

  useLayoutEffect(() => {
    measure();
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      measure();
    });
    const vpEl = viewportRef.current;
    const trEl = trackRef.current;
    if (vpEl) ro.observe(vpEl);
    if (trEl) ro.observe(trEl);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const step = geom.slide + geom.gap;

  useEffect(() => {
    if (step <= 0 || geom.slide <= 0) return;
    const centred = geom.vp / 2 - activeIndex * step - geom.slide / 2;
    setTranslateX(centred);
  }, [activeIndex, step, geom.slide, geom.vp]);

  /** Boundary indices briefly exist one frame until `rewarpMiddle` snaps them. */
  const isOutOfMiddleBand =
    itemsPerSet > 0 &&
    (activeIndex < itemsPerSet || activeIndex >= itemsPerSet * 2);

  const [hasPainted, setHasPainted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHasPainted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const instantMotion = !hasPainted || isOutOfMiddleBand;

  /** Instantly rewarp from phantom first/third copy into middle copy before paint. */
  useLayoutEffect(() => {
    if (itemsPerSet <= 0) return;

    setActiveIndex((idx) => {
      if (idx < itemsPerSet) return idx + itemsPerSet;
      if (idx >= itemsPerSet * 2) return idx - itemsPerSet;
      return idx;
    });
  }, [activeIndex, itemsPerSet]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!inView || isOutOfMiddleBand) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((prev) => prev - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inView, isOutOfMiddleBand]);

  const handleItemClick = (clickedIndex: number) => {
    if (isOutOfMiddleBand || itemsPerSet <= 0) return;
    const targetOriginalIndex = clickedIndex % itemsPerSet;

    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ];

    let closestIndex = possibleIndices[0] ?? 0;
    let smallestDistance = Math.abs(closestIndex - activeIndex);

    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    }

    setActiveIndex(closestIndex);
  };

  const handlePrevious = () => {
    if (isOutOfMiddleBand) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isOutOfMiddleBand) return;
    setActiveIndex((prev) => prev + 1);
  };

  const safeSet = Math.max(itemsPerSet, 1);
  const currentPage = ((activeIndex % safeSet) + safeSet) % safeSet + 1;
  const totalPages = itemsPerSet;

  if (itemsPerSet <= 0) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex w-full flex-col items-center justify-center px-4",
        className,
      )}
    >
      <div className="relative flex h-[min(280px,34vh)] w-full max-w-6xl flex-col justify-center">
        <div className="flex items-center justify-center">
          <RulerLines top />
        </div>

        <div
          ref={viewportRef}
          className="relative flex w-full flex-1 items-center justify-center overflow-hidden"
        >
          <motion.div
            ref={trackRef}
            className="flex items-center gap-[clamp(1.75rem,4vw,4.25rem)]"
            animate={{
              x: translateX,
            }}
            transition={
              instantMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 26,
                    mass: 1,
                  }
            }
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={item.keyId}
                  type="button"
                  data-carousel-slot
                  onClick={() => handleItemClick(index)}
                  className={cn(
                    "flex w-[clamp(260px,38vw,440px)] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap text-4xl font-bold tracking-tighter text-white md:text-5xl lg:text-6xl",
                    isActive
                      ? "text-[#ffecc4]"
                      : "text-white/40 hover:text-white/65",
                  )}
                  animate={{
                    scale: isActive ? 1 : 0.78,
                    opacity: isActive ? 1 : 0.45,
                  }}
                  transition={
                    instantMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 400,
                          damping: 26,
                        }
                  }
                >
                  {item.title}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="flex items-center justify-center">
          <RulerLines top={false} />
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isOutOfMiddleBand}
          aria-label="Previous item"
          className="rounded-full p-2 text-[#d4b87a] transition-colors hover:bg-white/10 hover:text-[#ffecc4] disabled:opacity-40"
        >
          <Rewind className="h-5 w-5" aria-hidden strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-2 font-medium tabular-nums text-white/55">
          <span className="text-sm">{currentPage}</span>
          <span className="text-sm text-white/35">/</span>
          <span className="text-sm">{totalPages}</span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={isOutOfMiddleBand}
          aria-label="Next item"
          className="rounded-full p-2 text-[#d4b87a] transition-colors hover:bg-white/10 hover:text-[#ffecc4] disabled:opacity-40"
        >
          <FastForward className="h-5 w-5" aria-hidden strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
