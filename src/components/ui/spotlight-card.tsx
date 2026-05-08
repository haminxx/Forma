import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { cn } from "../../lib/cn";

/**
 * Adapted from the user-pasted `spotlight-card` snippet with two
 * efficiency tweaks:
 *
 *   1. **One pointermove listener per page**, not per card.
 *      The original re-attached `pointermove` to `document` from each
 *      card's `useEffect`. With multiple cards in the docs section that
 *      meant N listeners writing the same `--x` / `--y` variables on
 *      every move. We now register a single document-level listener
 *      via a ref-counted module singleton and write the variables to
 *      `documentElement`. CSS variables cascade, so every GlowCard
 *      reads the same values.
 *
 *   2. **rAF-throttled writes**. The pointer event fires on every
 *      mouse-poll interval (>120 Hz on modern displays). We coalesce
 *      writes to one per animation frame so the GPU isn't asked to
 *      reflow gradients faster than it can paint.
 *
 *   3. The `gold` colour variant is added on top of the original
 *      blue/purple/green/red/orange palette so the docs cards can
 *      glow with Forma's brand accent.
 */

export type GlowColor = "blue" | "purple" | "green" | "red" | "orange" | "gold";

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  /** When true, ignores `size` and lets the consumer control sizing. */
  customSize?: boolean;
}

const glowColorMap: Record<GlowColor, { base: number; spread: number }> = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
  // Gold lives at the warm end of the wheel with a tighter spread so
  // the hue stays in Forma's brand band as the cursor moves across the
  // page rather than drifting into green/blue.
  gold: { base: 42, spread: 60 },
};

const sizeMap: Record<NonNullable<GlowCardProps["size"]>, string> = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

// ── Module-level pointer tracker ─────────────────────────────────────
let pointerListenerRefCount = 0;
let pendingFrame: number | null = null;
let lastX = 0;
let lastY = 0;

function flushPointerVars() {
  pendingFrame = null;
  const root = document.documentElement;
  root.style.setProperty("--x", lastX.toFixed(2));
  root.style.setProperty("--xp", (lastX / window.innerWidth).toFixed(3));
  root.style.setProperty("--y", lastY.toFixed(2));
  root.style.setProperty("--yp", (lastY / window.innerHeight).toFixed(3));
}

function handlePointerMove(e: PointerEvent) {
  lastX = e.clientX;
  lastY = e.clientY;
  if (pendingFrame !== null) return;
  pendingFrame = requestAnimationFrame(flushPointerVars);
}

function subscribePointer(): () => void {
  if (typeof document === "undefined") return () => {};
  if (pointerListenerRefCount === 0) {
    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
  }
  pointerListenerRefCount += 1;
  return () => {
    pointerListenerRefCount -= 1;
    if (pointerListenerRefCount <= 0) {
      pointerListenerRefCount = 0;
      document.removeEventListener("pointermove", handlePointerMove);
      if (pendingFrame !== null) {
        cancelAnimationFrame(pendingFrame);
        pendingFrame = null;
      }
    }
  };
}

// ── One-time pseudo-element style injection ──────────────────────────
let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const tag = document.createElement("style");
  tag.dataset.formaGlow = "true";
  tag.textContent = BEFORE_AFTER_STYLES;
  document.head.appendChild(tag);
}

export function GlowCard({
  children,
  className = "",
  glowColor = "gold",
  size = "md",
  width,
  height,
  customSize = false,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureStyles();
    return subscribePointer();
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const inlineStyles: CSSProperties = {
    ["--base" as never]: String(base),
    ["--spread" as never]: String(spread),
    ["--radius" as never]: "16",
    ["--border" as never]: "2",
    ["--backdrop" as never]: "hsl(0 0% 60% / 0.06)",
    ["--backup-border" as never]: "var(--backdrop)",
    ["--size" as never]: "200",
    ["--outer" as never]: "1",
    ["--border-size" as never]: "calc(var(--border, 2) * 1px)",
    ["--spotlight-size" as never]: "calc(var(--size, 150) * 1px)",
    ["--hue" as never]:
      "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)),
      transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize:
      "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
    touchAction: "none",
  };

  if (width !== undefined) {
    inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    inlineStyles.height = typeof height === "number" ? `${height}px` : height;
  }

  const sizeClasses = customSize ? "" : sizeMap[size];

  return (
    <div
      ref={cardRef}
      data-glow
      style={inlineStyles}
      className={cn(
        sizeClasses,
        !customSize && "aspect-[3/4]",
        "relative grid grid-rows-[1fr_auto] gap-4 rounded-2xl p-4 shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]",
        className,
      )}
    >
      <div ref={innerRef} data-glow></div>
      {children}
    </div>
  );
}

const BEFORE_AFTER_STYLES = `
[data-glow]::before,
[data-glow]::after {
  pointer-events: none;
  content: "";
  position: absolute;
  inset: calc(var(--border-size) * -1);
  border: var(--border-size) solid transparent;
  border-radius: calc(var(--radius) * 1px);
  background-attachment: fixed;
  background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
  background-repeat: no-repeat;
  background-position: 50% 50%;
  mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  mask-clip: padding-box, border-box;
  -webkit-mask-clip: padding-box, border-box;
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
}
[data-glow]::before {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
    calc(var(--x, 0) * 1px)
    calc(var(--y, 0) * 1px),
    hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
    transparent 100%
  );
  filter: brightness(2);
}
[data-glow]::after {
  background-image: radial-gradient(
    calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
    calc(var(--x, 0) * 1px)
    calc(var(--y, 0) * 1px),
    hsl(0 100% 100% / var(--border-light-opacity, 1)),
    transparent 100%
  );
}
[data-glow] [data-glow] {
  position: absolute;
  inset: 0;
  will-change: filter;
  opacity: var(--outer, 1);
  border-radius: calc(var(--radius) * 1px);
  border-width: calc(var(--border-size) * 20);
  filter: blur(calc(var(--border-size) * 10));
  background: none;
  pointer-events: none;
  border: none;
}
[data-glow] > [data-glow]::before {
  inset: -10px;
  border-width: 10px;
}
`;
