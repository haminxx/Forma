import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";

interface NavItem {
  label: string;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "Problem", id: "problem" },
  { label: "Solution", id: "solution" },
  { label: "Demo", id: "demo" },
  { label: "Sandbox", id: "sandbox" },
  { label: "Docs", id: "docs" },
];

/**
 * 3D Adaptive Navigation Pill (PillBase) — adopted verbatim style-wise.
 * Modifications:
 *   - 6 sections, click → smooth-scroll to anchor.
 *   - Active section tracked from scroll via IntersectionObserver.
 *   - Collapsed label animates per-character on change.
 */
export const PillNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSectionRef = useRef("home");
  const userScrollLockUntil = useRef<number>(0);

  const navItems = NAV_ITEMS;

  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 });
  const pillShift = useSpring(0, { stiffness: 220, damping: 25, mass: 1 });

  // Handle hover expansion
  useEffect(() => {
    if (hovering) {
      setExpanded(true);
      pillWidth.set(720);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        pillWidth.set(140);
      }, 600);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hovering, pillWidth]);

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
          height: "56px",
          background: `
          linear-gradient(135deg, 
            #fcfcfd 0%, 
            #f8f8fa 15%, 
            #f3f4f6 30%, 
            #eeeff2 45%, 
            #e9eaed 60%, 
            #e4e5e8 75%, 
            #dee0e3 90%, 
            #e2e3e6 100%
          )
        `,
          boxShadow: expanded
            ? `
            0 2px 4px rgba(0, 0, 0, 0.08),
            0 6px 12px rgba(0, 0, 0, 0.12),
            0 12px 24px rgba(0, 0, 0, 0.14),
            0 24px 48px rgba(0, 0, 0, 0.10),
            inset 0 2px 2px rgba(255, 255, 255, 0.8),
            inset 0 -3px 8px rgba(0, 0, 0, 0.12),
            inset 3px 3px 8px rgba(0, 0, 0, 0.10),
            inset -3px 3px 8px rgba(0, 0, 0, 0.09),
            inset 0 -1px 2px rgba(0, 0, 0, 0.08)
          `
            : isTransitioning
              ? `
            0 3px 6px rgba(0, 0, 0, 0.10),
            0 8px 16px rgba(0, 0, 0, 0.08),
            0 16px 32px rgba(0, 0, 0, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.10),
            inset 0 2px 1px rgba(255, 255, 255, 0.85),
            inset 0 -2px 6px rgba(0, 0, 0, 0.08),
            inset 2px 2px 8px rgba(0, 0, 0, 0.06),
            inset -2px 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 0 1px rgba(0, 0, 0, 0.12),
            inset 0 0 20px rgba(255, 255, 255, 0.15)
          `
              : `
            0 3px 6px rgba(0, 0, 0, 0.12),
            0 8px 16px rgba(0, 0, 0, 0.10),
            0 16px 32px rgba(0, 0, 0, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.12),
            inset 0 2px 1px rgba(255, 255, 255, 0.7),
            inset 0 -2px 6px rgba(0, 0, 0, 0.10),
            inset 2px 2px 8px rgba(0, 0, 0, 0.08),
            inset -2px 2px 8px rgba(0, 0, 0, 0.07),
            inset 0 0 1px rgba(0, 0, 0, 0.15)
          `,
          x: pillShift,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease-out",
        }}
      >
        {/* Primary top edge ridge - ultra bright */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 rounded-t-full"
          style={{
            height: "2px",
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 5%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(255, 255, 255, 0.95) 95%, rgba(255, 255, 255, 0) 100%)",
            filter: "blur(0.3px)",
          }}
        />

        {/* Top hemisphere light catch */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 rounded-full"
          style={{
            height: "55%",
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0.10) 60%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Directional light - top left */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.20) 20%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0) 65%)",
          }}
        />

        {/* Premium gloss reflection - main */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            left: expanded ? "18%" : "15%",
            top: "16%",
            width: expanded ? "140px" : "60px",
            height: "14px",
            background:
              "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.10) 70%, rgba(255, 255, 255, 0) 100%)",
            filter: "blur(4px)",
            transform: "rotate(-12deg)",
            transition: "all 0.3s ease",
          }}
        />

        {/* Secondary gloss accent - only show when expanded */}
        {expanded && (
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              right: "22%",
              top: "20%",
              width: "80px",
              height: "10px",
              background:
                "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0) 100%)",
              filter: "blur(3px)",
              transform: "rotate(8deg)",
            }}
          />
        )}

        {/* Left edge illumination - only show when expanded */}
        {expanded && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 rounded-l-full"
            style={{
              width: "35%",
              background:
                "linear-gradient(90deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 40%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
        )}

        {/* Right edge shadow - only show when expanded */}
        {expanded && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 rounded-r-full"
            style={{
              width: "35%",
              background:
                "linear-gradient(270deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0) 100%)",
            }}
          />
        )}

        {/* Bottom curvature - deep shadow */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-full"
          style={{
            height: "50%",
            background:
              "linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Bottom edge contact shadow */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-full"
          style={{
            height: "20%",
            background:
              "linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)",
            filter: "blur(2px)",
          }}
        />

        {/* Inner diffuse glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: "inset 0 0 40px rgba(255, 255, 255, 0.22)",
            opacity: 0.7,
          }}
        />

        {/* Micro edge definition */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: "inset 0 0 0 0.5px rgba(0, 0, 0, 0.10)",
          }}
        />

        {/* Navigation items container */}
        <div
          ref={containerRef}
          className="relative z-10 flex h-full items-center justify-center px-6"
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
                      fontSize: "15.5px",
                      fontWeight: 680,
                      color: "#1a1a1a",
                      letterSpacing: "0.45px",
                      whiteSpace: "nowrap",
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textShadow: `
                      0 1px 0 rgba(0, 0, 0, 0.35),
                      0 -1px 0 rgba(255, 255, 255, 0.8),
                      1px 1px 0 rgba(0, 0, 0, 0.18),
                      -1px 1px 0 rgba(0, 0, 0, 0.15)
                    `,
                    }}
                  >
                    {activeChars.map((ch, i) => (
                      <motion.span
                        key={`${activeItem.id}-${i}`}
                        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                        transition={{
                          duration: 0.28,
                          delay: i * 0.035,
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
                      delay: index * 0.08,
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                    onClick={() => handleSectionClick(item.id)}
                    className="relative cursor-pointer transition-all duration-200"
                    style={{
                      fontSize: isActive ? "15.5px" : "15px",
                      fontWeight: isActive ? 680 : 510,
                      color: isActive ? "#1a1a1a" : "#656565",
                      textDecoration: "none",
                      letterSpacing: "0.45px",
                      background: "transparent",
                      border: "none",
                      padding: "10px 16px",
                      outline: "none",
                      whiteSpace: "nowrap",
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      transform: isActive
                        ? "translateY(-1.5px)"
                        : "translateY(0)",
                      textShadow: isActive
                        ? `
                        0 1px 0 rgba(0, 0, 0, 0.35),
                        0 -1px 0 rgba(255, 255, 255, 0.8),
                        1px 1px 0 rgba(0, 0, 0, 0.18),
                        -1px 1px 0 rgba(0, 0, 0, 0.15)
                      `
                        : `
                        0 1px 0 rgba(0, 0, 0, 0.22),
                        0 -1px 0 rgba(255, 255, 255, 0.65),
                        1px 1px 0 rgba(0, 0, 0, 0.12),
                        -1px 1px 0 rgba(0, 0, 0, 0.10)
                      `,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#3a3a3a";
                        e.currentTarget.style.transform = "translateY(-0.5px)";
                        e.currentTarget.style.textShadow = `
                        0 1px 0 rgba(0, 0, 0, 0.28),
                        0 -1px 0 rgba(255, 255, 255, 0.72),
                        1px 1px 0 rgba(0, 0, 0, 0.15),
                        -1px 1px 0 rgba(0, 0, 0, 0.12)
                      `;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#656565";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.textShadow = `
                        0 1px 0 rgba(0, 0, 0, 0.22),
                        0 -1px 0 rgba(255, 255, 255, 0.65),
                        1px 1px 0 rgba(0, 0, 0, 0.12),
                        -1px 1px 0 rgba(0, 0, 0, 0.10)
                      `;
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

