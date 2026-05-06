import type { FC, SVGProps } from "react";
import { HoverPeek } from "./HoverPeek";

/**
 * 4 × 2 grid of AI/dev platforms Forma plugs into. Each cell shows an inline
 * brand mark + business name; hovering over a cell pops a Microlink-screenshot
 * preview via HoverPeek; clicking opens the platform's prompt-input page.
 *
 * Brand marks are inline SVG (simplified, recognizable). Swap for real assets
 * by dropping files into `public/` and pointing each Logo at them.
 */

type LogoProps = SVGProps<SVGSVGElement>;

const VercelMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2 L22 22 L2 22 Z" />
  </svg>
);

const ReplitMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="18" height="8" rx="1.5" />
  </svg>
);

const BoltMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z" />
  </svg>
);

const LovableMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8C19 16.5 12 21 12 21z" />
  </svg>
);

const ManusMark: FC<LogoProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M3 21V4l9 11 9-11v17" />
  </svg>
);

const FigmaMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <circle cx="9" cy="4.5" r="3" />
    <rect x="6" y="7.5" width="6" height="6" />
    <circle cx="9" cy="16.5" r="3" />
    <circle cx="15" cy="10.5" r="3" />
    <path d="M12 7.5h3a3 3 0 0 1 0 6h-3" fill="none" stroke="currentColor" strokeWidth="0" />
  </svg>
);

const Base44Mark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="4" fillOpacity="0.15" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="10"
      fontWeight="700"
      fontFamily="Inter, system-ui, sans-serif"
      fill="currentColor"
    >
      44
    </text>
  </svg>
);

const CursorMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M5 3 L19 11 L13 12.5 L11 21 Z" />
  </svg>
);

type Platform = {
  name: string;
  href: string;
  Logo: FC<LogoProps>;
};

const PLATFORMS: Platform[] = [
  { name: "Vercel v0", href: "https://v0.app", Logo: VercelMark },
  { name: "Replit", href: "https://replit.com", Logo: ReplitMark },
  { name: "Bolt", href: "https://bolt.new", Logo: BoltMark },
  { name: "Lovable", href: "https://lovable.dev", Logo: LovableMark },
  { name: "Manus", href: "https://manus.im", Logo: ManusMark },
  { name: "Figma Make", href: "https://www.figma.com/make/", Logo: FigmaMark },
  { name: "Base 44", href: "https://base44.com", Logo: Base44Mark },
  { name: "Cursor", href: "https://cursor.com/agents", Logo: CursorMark },
];

export function PlatformGrid() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 border-x border-y border-white/10 md:grid-cols-4">
      {PLATFORMS.map((p) => (
        <HoverPeek key={p.name} url={p.href}>
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${p.name}`}
            className="group flex items-center justify-center gap-3 border-b border-r border-white/10 bg-transparent px-4 py-8 text-white/65 transition-colors duration-200 hover:bg-[#d4b87a]/10 hover:text-[#d4b87a] md:p-8"
          >
            <p.Logo className="h-5 w-5 shrink-0 md:h-6 md:w-6" />
            <span className="text-sm font-medium tracking-wide md:text-base">
              {p.name}
            </span>
          </a>
        </HoverPeek>
      ))}
    </div>
  );
}
