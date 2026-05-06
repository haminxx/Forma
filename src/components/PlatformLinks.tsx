import type { FC, MouseEvent, SVGProps } from "react";
import { useAnimate } from "framer-motion";

/**
 * Five-tile ClipPathLinks adaptation: same square box per platform, hover
 * triggers a clip-path corner reveal from the nearest edge (lifted from the
 * user's pasted snippet), click opens the platform's prompt page in a new
 * tab.
 *
 * Brand marks are inline SVG to avoid pulling in two icon libraries
 * (react-icons + lucide-react) just for five closed-set logos. The marks
 * are simplified — recognizable but not pixel-perfect; if you want exact
 * brand assets later, drop them into `public/` and swap.
 */

type Side = "left" | "right" | "top" | "bottom";

const NO_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
const BOTTOM_RIGHT_CLIP = "polygon(0 0, 100% 0, 0 0, 0% 100%)";
const TOP_RIGHT_CLIP = "polygon(0 0, 0 100%, 100% 100%, 0% 100%)";
const BOTTOM_LEFT_CLIP = "polygon(100% 100%, 100% 0, 100% 100%, 0 100%)";
const TOP_LEFT_CLIP = "polygon(0 0, 100% 0, 100% 100%, 100% 0)";

const ENTRANCE_KEYFRAMES: Record<Side, string[]> = {
  left: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  bottom: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  top: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  right: [TOP_LEFT_CLIP, NO_CLIP],
};

const EXIT_KEYFRAMES: Record<Side, string[]> = {
  left: [NO_CLIP, TOP_RIGHT_CLIP],
  bottom: [NO_CLIP, TOP_RIGHT_CLIP],
  top: [NO_CLIP, TOP_RIGHT_CLIP],
  right: [NO_CLIP, BOTTOM_LEFT_CLIP],
};

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

const LovableMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8C19 16.5 12 21 12 21z" />
  </svg>
);

const BoltMark: FC<LogoProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z" />
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
  { name: "Manus", href: "https://manus.im", Logo: ManusMark },
  { name: "Lovable", href: "https://lovable.dev", Logo: LovableMark },
  { name: "Bolt", href: "https://bolt.new", Logo: BoltMark },
];

function getNearestSide(e: MouseEvent<HTMLAnchorElement>): Side {
  const box = e.currentTarget.getBoundingClientRect();
  const candidates: Array<{ side: Side; d: number }> = [
    { side: "left", d: Math.abs(box.left - e.clientX) },
    { side: "right", d: Math.abs(box.right - e.clientX) },
    { side: "top", d: Math.abs(box.top - e.clientY) },
    { side: "bottom", d: Math.abs(box.bottom - e.clientY) },
  ];
  candidates.sort((a, b) => a.d - b.d);
  return candidates[0]!.side;
}

function LinkBox({ name, href, Logo }: Platform) {
  const [scope, animate] = useAnimate();

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const side = getNearestSide(e);
    animate(scope.current, { clipPath: ENTRANCE_KEYFRAMES[side] });
  };

  const handleMouseLeave = (e: MouseEvent<HTMLAnchorElement>) => {
    const side = getNearestSide(e);
    animate(scope.current, { clipPath: EXIT_KEYFRAMES[side] });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name}`}
      title={name}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative grid aspect-square w-full place-content-center bg-white/[0.03] text-white/75 transition-colors"
    >
      <Logo className="h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11" />

      <div
        ref={scope}
        style={{ clipPath: BOTTOM_RIGHT_CLIP }}
        className="absolute inset-0 grid place-content-center bg-[#d4b87a] text-[#1a1612] transition-colors duration-300"
      >
        <Logo className="h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11" />
      </div>
    </a>
  );
}

export function PlatformLinks() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-5 divide-x divide-white/10 border border-white/10">
      {PLATFORMS.map((p) => (
        <LinkBox key={p.name} {...p} />
      ))}
    </div>
  );
}
