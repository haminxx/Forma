import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollDocumentToSectionWithRetries } from "../lib/scroll-section";
import { cn } from "../lib/cn";

interface NavItem {
  label: string;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "Demo", id: "demo" },
  { label: "Sandbox", id: "sandbox" },
  { label: "Docs", id: "docs" },
];

/**
 * 3D Adaptive Navigation Pill (PillBase) — adopted verbatim style-wise.
 * Modifications:
 *   - 4 sections, click → smooth-scroll to anchor.
 *   - Active section tracked from scroll via IntersectionObserver.
 *   - Collapsed label animates per-character on change.
 */
// Pill sizing — collapsed fixed; expanded width is measured from the real
// button row plus padding (+ small gutter) then clamped so it clears flanks.
const COLLAPSED_W = 108;
const EXPANDED_ABSOLUTE_CEIL = 520;
const EXPANDED_FLANK_RESERVE = 360;
/** Small horizontal slack so the capsule reads slightly wider than the labels */
const EXPANDED_EDGE_SLOP_PX = 14;

function clampExpandedViewportCeil(viewport: number): number {
  if (!Number.isFinite(viewport) || viewport <= 0)
    return EXPANDED_ABSOLUTE_CEIL;
  const usable = viewport - EXPANDED_FLANK_RESERVE;
  return Math.max(COLLAPSED_W + 32, Math.min(EXPANDED_ABSOLUTE_CEIL, usable));
}

// Pixels of scroll past which the pill auto-collapses. Set tight so
// the very first scroll movement (~16px) collapses the pill — per
// the latest direction, the pill should "immediately get small" the
// moment the user starts scrolling.
const SCROLL_COLLAPSE_THRESHOLD = 16;

export const PillNav: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [vw, setVw] = useState<number>(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const expandedRowRef = useRef<HTMLDivElement>(null);
  const prevSectionRef = useRef("home");
  const userScrollLockUntil = useRef<number>(0);

  const navItems = NAV_ITEMS;

  // Spring animations for smooth motion
  const pillWidth = useSpring(COLLAPSED_W, { stiffness: 220, damping: 25, mass: 1 });
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 });

  // Track viewport width so the expanded pill resizes responsively.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Track whether the user is still at the top of the home hero. When
  // they are, the pill stays in its expanded "all sections visible"
  // form. When they scroll past SCROLL_COLLAPSE_THRESHOLD we collapse
  // back to the active-section label. Coming back to the top re-
  // expands the pill automatically.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      setAtTop(y < SCROLL_COLLAPSE_THRESHOLD);
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const viewportCap = clampExpandedViewportCeil(vw);

  // Pill is expanded whenever the user is at the top OR is hovering.
  useEffect(() => {
    setExpanded(hovering || atTop);
  }, [hovering, atTop]);

  // Collapsed width is fixed; expanded width fits content (see layout effect below).
  useEffect(() => {
    if (!expanded) pillWidth.set(COLLAPSED_W);
  }, [expanded, pillWidth]);

  // Match expanded capsule width to the nav buttons (+ padding + slack), capped by viewport.
  useLayoutEffect(() => {
    if (!expanded) return;

    const shell = containerRef.current;
    const row = expandedRowRef.current;
    if (!shell || !row) {
      pillWidth.set(viewportCap);
      return;
    }

    const update = () => {
      const s = expandedRowRef.current;
      const c = containerRef.current;
      if (!s || !c) return;

      const rowW = Math.ceil(s.getBoundingClientRect().width);
      const pcs = window.getComputedStyle(c);
      const padX =
        Number.parseFloat(pcs.paddingLeft || "0") +
        Number.parseFloat(pcs.paddingRight || "0");
      const fitted = Math.max(
        COLLAPSED_W + 24,
        Math.min(viewportCap, rowW + padX + EXPANDED_EDGE_SLOP_PX),
      );
      pillWidth.set(fitted);
    };

    update();
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(row);
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [expanded, activeSection, viewportCap, pillWidth]);

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const handleSectionClick = (sectionId: string) => {
    prevSectionRef.current = sectionId;
    setActiveSection(sectionId);

    // NOTE: do NOT force `setHovering(false)` here. The cursor is still
    // on the pill after the click, so the pill should stay expanded
    // until the user actually moves their mouse off the header. The
    // existing onMouseLeave handler will collapse it naturally then.

    // Lock IO-driven active updates while smooth-scroll is mid-flight,
    // otherwise mid-scroll sections would temporarily flip the label.
    userScrollLockUntil.current = Date.now() + 1600;

    const behavior = reduceMotion ? "instant" : "smooth";

    if (location.pathname !== "/") {
      navigate("/", {
        state: { scrollToSection: sectionId },
        preventScrollReset: true,
      });
      return;
    }

    scrollDocumentToSectionWithRetries(sectionId, behavior);
  };

  const activeItem = navItems.find((item) => item.id === activeSection);

  // Track which section is most visible. Drives the collapsed label.
  useEffect(() => {
    const ratios = new Map<string, number>();
    const observers: IntersectionObserver[] = [];

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) ratios.set(id, e.intersectionRatio);

          if (Date.now() < userScrollLockUntil.current) return;

          let bestId = "home";
          let bestRatio = -1;
          ratios.forEach((r, k) => {
            if (r > bestRatio) {
              bestRatio = r;
              bestId = k;
            }
          });
          if (bestRatio > 0) {
            setActiveSection((prev) => (prev === bestId ? prev : bestId));
          }
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const activeChars = useMemo(
    () => (activeItem ? activeItem.label.split("") : []),
    [activeItem],
  );

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative isolate overflow-hidden rounded-full",
        "border border-white/[0.08]",
        "bg-[rgba(255,255,255,0.05)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.35),0_8px_32px_rgba(0,0,0,0.4)]",
        "backdrop-blur-[28px] backdrop-saturate-150 [-webkit-backdrop-filter:blur(28px)_saturate(150%)]",
      )}
      style={{
        width: pillWidth,
        height: "40px",
        x: pillShift,
      }}
    >
        {/* Navigation items container */}
        <div
          ref={containerRef}
          className="relative z-10 flex h-full items-center justify-center px-2 sm:px-3"
          style={{
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
          }}
        >
          {/* Collapsed state — per-character cross-fade as the active section
              changes mid-scroll. Each char has its own delay so the label
              "types" in and "types" out. */}
          {!expanded && (
            <div className="relative flex items-center">
              <AnimatePresence mode="wait">
                {activeItem && (
                  <motion.span
                    key={activeItem.id}
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#d4b87a",
                      letterSpacing: "0.4px",
                      whiteSpace: "nowrap",
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                    }}
                  >
                    {activeChars.map((ch, i) => (
                      <motion.span
                        key={`${activeItem.id}-${i}`}
                        initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                        transition={{
                          duration: 0.26,
                          delay: i * 0.03,
                          ease: [0.4, 0.0, 0.2, 1],
                        }}
                        style={{ display: "inline-block", whiteSpace: "pre" }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Expanded state - show all sections with stagger */}
          {expanded && (
            <div
              ref={expandedRowRef}
              className="flex w-max flex-shrink-0 items-center gap-1 sm:gap-1.5"
            >
              {navItems.map((item, index) => {
                const isActive = item.id === activeSection;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                    onClick={() => handleSectionClick(item.id)}
                    className={cn(
                      "relative shrink-0 cursor-pointer whitespace-nowrap rounded-full border-none px-[10px] py-2 outline-none transition-all duration-200 ease-out antialiased sm:px-3",
                      "tracking-[0.35px]",
                      isActive
                        ? "bg-[rgba(200,184,154,0.12)] text-[12px] font-semibold text-[#d4b87a] shadow-[inset_0_1px_0_rgba(200,184,154,0.22)]"
                        : "text-[11.5px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white/95 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:text-[12px]",
                    )}
                    style={{
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    }}
                  >
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </motion.nav>
  );
};

