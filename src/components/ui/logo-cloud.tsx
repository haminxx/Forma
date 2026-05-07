import type { ComponentProps, ReactNode } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { HoverPeek } from "../HoverPeek";

/**
 * LogoCloud — adopted from the user-pasted shadcn reference, adapted for
 * Forma's 8 supported AI design/IDE platforms (Cursor swapped for Tempo per
 * the latest spec).
 *
 * Visual rules:
 *   - Each cell renders a brand PNG + business name. The PNG is grayscale
 *     by default and reverts to its original colour on hover (group state).
 *   - The cell tints to a subtle gold "selected" wash on hover.
 *   - Borders form a 4 × 2 grid with 8-pointed PlusIcon decorations at the
 *     interior intersections — same spirit as the reference snippet.
 *   - Each cell is wrapped in HoverPeek so a Microlink screenshot pops on
 *     hover; clicking the cell opens the platform's prompt page.
 *
 * Drop higher-resolution brand assets into /public/logos/<name>.png to swap.
 */

type Platform = {
  name: string;
  src: string;
  href: string;
};

const PLATFORMS: Platform[] = [
  { name: "Vercel v0", src: "/logos/v0.png", href: "https://v0.app" },
  { name: "Replit", src: "/logos/replit.png", href: "https://replit.com" },
  { name: "Bolt", src: "/logos/bolt.png", href: "https://bolt.new" },
  { name: "Lovable", src: "/logos/lovable.png", href: "https://lovable.dev" },
  { name: "Manus", src: "/logos/manus.png", href: "https://manus.im" },
  { name: "Figma Make", src: "/logos/figma-make.png", href: "https://www.figma.com/make/" },
  { name: "Base 44", src: "/logos/base44.png", href: "https://base44.com" },
  { name: "Tempo", src: "/logos/tempo.png", href: "https://www.tempo.new/" },
];

type LogoCloudProps = ComponentProps<"div">;

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    <div
      className={cn(
        "relative grid w-full max-w-3xl grid-cols-2 border-x border-white/10 md:grid-cols-4",
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

        // Subtle bg-secondary checkerboard so cells alternate brightness —
        // matches the reference's "bg-secondary" wash.
        const checker = (i + Math.floor(i / 4)) % 2 === 0;
        const cellBg = checker ? "bg-white/[0.025]" : "bg-transparent";

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
};

function LogoCard({ href, src, alt, className, children }: LogoCardProps) {
  return (
    <HoverPeek url={href}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${alt}`}
        className={cn(
          "group relative flex items-center justify-center px-4 py-8 transition-colors duration-200",
          "hover:bg-[#d4b87a]/10 md:p-10",
          className,
        )}
      >
        {/* Fixed bounding box gives every logo the same visual weight: square
            marks render small inside it, wide wordmarks fill the width.
            object-contain centres each mark inside this 140 × 36 cell. */}
        <span className="relative flex h-9 w-[140px] items-center justify-center md:h-10 md:w-[160px]">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="pointer-events-none max-h-full max-w-full select-none object-contain grayscale transition duration-300 group-hover:grayscale-0"
          />
        </span>
        {children}
      </a>
    </HoverPeek>
  );
}
