import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";

interface NavItem {
  label: string;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "Demo", id: "demo" },
  { label: "Sandbox", id: "sandbox" },
  { label: "Problem", id: "problem" },
  { label: "Solution", id: "solution" },
  { label: "About", id: "about" },
  { label: "Docs", id: "docs" },
];

/**
 * 3D Adaptive Navigation Pill (PillBase) — adopted verbatim style-wise.
 * Modifications:
 *   - 6 sections, click → smooth-scroll to anchor.
 *   - Active section tracked from scroll via IntersectionObserver.
 *   - Collapsed label animates per-character on change.
 */
// Pill sizing. Collapsed is fixed; expanded scales with the viewport so
// the pill never escapes the visible window on narrow screens. Sized so
// brand + GitHub button (each ~140 px) still get breathing room on the
// flanks at the smallest viewport we care about (~360 px).
const COLLAPSED_W = 116;
const EXPANDED_MAX = 560;
const EXPANDED_FLANK_RESERVE = 320;

function clampExpandedWidth(viewport: number): number {
  if (!Number.isFinite(viewport) || viewport <= 0) return EXPANDED_MAX;
  const usable = viewport - EXPANDED_FLANK_RESERVE;
  return Math.max(COLLAPSED_W + 60, Math.min(EXPANDED_MAX, usable));
}

export const PillNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [vw, setVw] = useState<number>(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const expandedWidth = clampExpandedWidth(vw);

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true);
      pillWidth.set(expandedWidth);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        pillWidth.set(COLLAPSED_W);
      }, 600);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hovering, pillWidth, expandedWidth]);

  // Re-snap the spring target if the viewport changes while expanded so
  // the pill grows / shrinks live with the window instead of waiting for
  // the next hover.
  useEffect(() => {
    if (hovering) pillWidth.set(expandedWidth);
  }, [expandedWidth, hovering, pillWidth]);

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  const handleSectionClick = (sectionId: string) => {
    // Trigger transition state
    setIsTransitioning(true);
    prevSectionRef.current = sectionId;
    setActiveSection(sectionId);

    // Collapse the pill after selection
    setHovering(false);

    // Lock IO-driven active updates while smooth-scroll is mid-flight,
    // otherwise mid-scroll sections would temporarily flip the label.
    userScrollLockUntil.current = Date.now() + 800;

    // Scroll so the section's vertical centre lands at the viewport
    // centre — every page's content sits in the middle of its section,
    // so this puts the heading / hero / panel directly behind the pill.
    const node = document.getElementById(sectionId);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
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
        className="relative rounded-full"
        style={{
          width: pillWidth,
          height: "44px",
          // Dark charcoal glass — Forma's #191a1f bg with a subtle tonal
          // shift so the pill reads as raised against the page rather
          // than the previous silver/light look that fought the theme.
          background: `
          linear-gradient(135deg,
            #2c2e35 0%,
            #25272d 30%,
            #1d1f24 65%,
            #2a2c33 100%
          )
        `,
          boxShadow: expanded
            ? `
            0 2px 4px rgba(0, 0, 0, 0.45),
            0 8px 18px rgba(0, 0, 0, 0.40),
            0 18px 36px rgba(0, 0, 0, 0.30),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 0 rgba(0, 0, 0, 0.45),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.10)
          `
            : isTransitioning
              ? `
            0 3px 8px rgba(0, 0, 0, 0.45),
            0 8px 18px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.07),
            inset 0 -1px 0 rgba(0, 0, 0, 0.4),
            inset 0 0 0 0.5px rgba(212, 184, 122, 0.18)
          `
              : `
            0 3px 8px rgba(0, 0, 0, 0.40),
            0 8px 18px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 0 rgba(0, 0, 0, 0.4),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.08)
          `,
          x: pillShift,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease-out",
        }}
      >
        {/* Top edge highlight — narrow gold-tinted ridge so the pill
            reads as part of Forma's accent palette without screaming. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 rounded-t-full"
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, rgba(212,184,122,0) 0%, rgba(212,184,122,0.18) 18%, rgba(255,255,255,0.20) 50%, rgba(212,184,122,0.18) 82%, rgba(212,184,122,0) 100%)",
          }}
        />

        {/* Subtle top-hemisphere light catch */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 rounded-full"
          style={{
            height: "55%",
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 60%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom inner shadow for depth */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-full"
          style={{
            height: "55%",
            background:
              "linear-gradient(0deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 0, 0, 0.16) 35%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Navigation items container */}
        <div
          ref={containerRef}
          className="relative z-10 flex h-full items-center justify-center px-4"
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
            <div className="flex w-full items-center justify-evenly">
              {navItems.map((item, index) => {
                const isActive = item.id === activeSection;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                    onClick={() => handleSectionClick(item.id)}
                    className="relative cursor-pointer transition-all duration-200"
                    style={{
                      fontSize: isActive ? "12.5px" : "12px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#d4b87a" : "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      letterSpacing: "0.4px",
                      background: "transparent",
                      border: "none",
                      padding: "8px 12px",
                      outline: "none",
                      whiteSpace: "nowrap",
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      transform: isActive
                        ? "translateY(-1px)"
                        : "translateY(0)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.92)";
                        e.currentTarget.style.transform = "translateY(-0.5px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
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

