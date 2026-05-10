import type { ComponentProps, ReactNode } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { HoverPeek } from "../HoverPeek";

/**
 * LogoCloud — Forma's 8 supported AI design/IDE platforms.
 *
 * Visual rules (per latest spec):
 *   - Each cell renders the brand mark (PNG or SVG) in **full colour by default**.
 *   - When the user hovers anywhere in the grid, the hovered cell stays
 *     full colour while every other cell dims (grayscale + opacity 40%).
 *     Implemented with a `group/cloud` parent + per-card
 *     `group-hover/cloud:* hover:!revert` so no JS state is needed.
 *   - Cells are uniform-sized frosted-glass tiles so logo widths
 *     normalise inside the same bounding box.
 *   - Each cell is wrapped in HoverPeek for the Microlink-style preview
 *     pop; clicking opens the platform's prompt page.
 */

type Platform = {
  name: string;
  src: string;
  href: string;
  /**
   * Set true when the source mark is black-on-transparent. The img gets
   * `filter: invert(1)` so it reads on the dark grid. Kept for v0.png;
   * transparent SVG marks are expected to ship contrast-ready.
   */
  invert?: boolean;
  /**
   * Uniform cell + `object-contain` still leaves uneven *visual* weight
   * when SVG viewBoxes differ. `1` = default; nudge toward v0.png size.
   */
  scale?: number;
};

const PLATFORMS: Platform[] = [
  { name: "Vercel v0", src: "/logos/v0.png", href: "https://v0.app", invert: true },
  { name: "Replit", src: "/logos/replit.svg", href: "https://replit.com" },
  { name: "Bolt", src: "/logos/bolt.svg", href: "https://bolt.new", invert: true },
  { name: "Lovable", src: "/logos/lovable.svg", href: "https://lovable.dev", invert: true },
  { name: "Manus", src: "/logos/manus.svg", href: "https://manus.im" },
  { name: "Figma Make", src: "/logos/figma-make.svg", href: "https://www.figma.com/make/" },
  { name: "Base 44", src: "/logos/Base44.svg", href: "https://base44.com" },
  { name: "Tempo", src: "/logos/tempo.png", href: "https://www.tempo.new/" },
];

type LogoCloudProps = ComponentProps<"div">;

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    /* `group/cloud` lets each cell react to a sibling card being
       hovered — used to dim the non-hovered cells. */
    <div
      className={cn(
        "group/cloud relative grid w-full max-w-3xl grid-cols-2 border-x border-white/10 md:grid-cols-4",
        className,
      )}
      {...props}
    >
      {/* Top horizontal full-width rule (purely visual). */}
      <div className="pointer-events-none absolute -top-px left-1/2 w-screen -translate-x-1/2 border-t border-white/10" />

      {PLATFORMS.map((p, i) => {
        // 4 × 2 (md) / 2 × 4 (sm) grid:
        //   row 1: cells 1..4 (md) or 1..2 (sm)
        //   row 2: cells 5..8 (md) or 3..4 etc (sm)
        // Border decisions per cell:
        //   - All cells get border-r except md last column (every 4th, i % 4 === 3).
        //   - Top row gets border-b; bottom row keeps it on mobile (same logic).
        // We keep border-r on every cell on mobile so columns stay separated;
        // border-b on every cell except the very last row (>= 6 in md, >= 6 in sm too).
        const isMdLastCol = i % 4 === 3;
        const isMdLastRow = i >= 4;
        const isSmLastRow = i >= 6;
        const cellBorder = cn(
          "border-white/10",
          // mobile: every right cell (odd index) gets no border-r;
          // desktop: every 4th gets no border-r.
          i % 2 === 1 ? "" : "border-r",
          isMdLastCol ? "md:border-r-0" : "md:border-r",
          isSmLastRow ? "" : "border-b",
          isMdLastRow ? "md:border-b-0" : "md:border-b",
        );

        // Frosted-glass tiles: heavy backdrop-blur over a thin tint so the
        // gold sandbox bloom is visible *through* each cell but blurred
        // enough that wordmarks still read. Alternating tint depth keeps
        // a subtle checker rhythm without going opaque.
        const checker = (i + Math.floor(i / 4)) % 2 === 0;
        const cellBg = checker
          ? "bg-white/[0.05] backdrop-blur-2xl backdrop-saturate-150"
          : "bg-white/[0.025] backdrop-blur-2xl backdrop-saturate-150";

        // PlusIcon at the centre horizontal line ONLY — the bottom-right
        // of top-row cells (i = 0, 2) sits on the divider between rows.
        // The bottom-row pluses (i = 4, 6) used to anchor the LOWER edge
        // and have been removed; only the inter-row centre pluses remain.
        const showPlusBR = i === 0 || i === 2;

        return (
          <LogoCard
            key={p.name}
            href={p.href}
            src={p.src}
            alt={`${p.name} logo`}
            invert={p.invert}
            scale={p.scale ?? 1}
            className={cn(cellBorder, cellBg)}
          >
            {showPlusBR ? (
              <PlusIcon
                aria-hidden="true"
                strokeWidth={1}
                className="pointer-events-none absolute -right-[12.5px] -bottom-[12.5px] z-10 size-6 text-white/40"
              />
            ) : null}
          </LogoCard>
        );
      })}

      {/* Bottom horizontal full-width rule (purely visual). */}
      <div className="pointer-events-none absolute -bottom-px left-1/2 w-screen -translate-x-1/2 border-b border-white/10" />
    </div>
  );
}

type LogoCardProps = {
  href: string;
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
  /** Apply CSS `filter: invert(1)` for black-on-anything source PNGs. */
  invert?: boolean;
  /** Visual size nudge vs the shared frame (v0 reference). */
  scale: number;
};

function LogoCard({ href, src, alt, className, children, invert, scale }: LogoCardProps) {
  return (
    <HoverPeek url={href}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${alt}`}
        className={cn(
          "group/cell relative flex items-center justify-center px-4 py-9 transition-colors duration-200",
          "hover:bg-[#d4b87a]/10 md:p-12",
          className,
        )}
      >
        {/* Bigger uniform frame: h-14 / w-[200px] mobile, h-16 / w-[240px]
            desktop. Each img is `h-full w-full object-contain` inside a
            scale wrapper so per-brand `scale` can match v0 without
            changing the grid. */}
        <span className="relative flex h-14 w-[200px] items-center justify-center md:h-16 md:w-[240px]">
          <span
            className="flex h-full w-full items-center justify-center overflow-visible"
            style={
              scale !== 1
                ? { transform: `scale(${scale})`, transformOrigin: "center center" }
                : undefined
            }
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              style={invert ? { filter: "invert(1) brightness(1.05)" } : undefined}
              // Default: full colour. When the *grid* is hovered, dim
              // every cell with grayscale + low opacity. The cell that
              // is *itself* hovered overrides back to full colour with
              // !important so it stays the focal point.
              className={cn(
                "pointer-events-none h-full w-full max-h-full max-w-full select-none object-contain transition duration-300",
                "group-hover/cloud:opacity-40 group-hover/cloud:grayscale",
                "group-hover/cell:!opacity-100 group-hover/cell:!grayscale-0",
              )}
            />
          </span>
        </span>
        {children}
      </a>
    </HoverPeek>
  );
}
