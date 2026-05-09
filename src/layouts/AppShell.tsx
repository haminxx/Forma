import { Outlet } from "react-router-dom";
import { Github } from "lucide-react";
import { PillNav } from "../components/PillNav";
import { SiteFooter } from "../components/SiteFooter";

/**
 * Header layout (revised per latest direction):
 *
 *   - Brand mark + GitHub button + PillNav are ALL `position: fixed`
 *     in the same row at top: 5 of the viewport. The whole header
 *     floats together as the user scrolls — none of the three
 *     elements scroll out of view.
 *   - Single grid wrapper (`1fr auto 1fr`) keeps the pill perfectly
 *     centred regardless of brand / button widths, exactly like the
 *     pre-split layout.
 *   - The wrapper is `pointer-events-none` so its empty centre column
 *     never blocks clicks on hero content beneath; the children re-
 *     enable pointer events on themselves.
 *
 * <main> starts at y=0 of the document because the header is out of
 * flow (fixed). The home hero (`h-screen`) fills the viewport from
 * the very top.
 */
export function AppShell() {
  return (
    <div
      data-app-shell
      className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]"
    >
      <header className="pointer-events-none fixed inset-x-0 top-5 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <BrandMark />
        <div className="pointer-events-auto justify-self-center">
          <PillNav />
        </div>
        <GithubButton />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

function BrandMark() {
  return (
    <a
      href="/"
      aria-label="Forma — home"
      className="pointer-events-auto group inline-flex h-11 items-center gap-2 rounded-full px-2 text-white transition-opacity hover:opacity-90"
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4b87a] text-[9px] font-bold text-black shadow-[0_4px_10px_-4px_rgba(212,184,122,0.6)]"
      >
        F
      </span>
      <span
        className="text-sm font-semibold tracking-tight"
        style={{
          fontFamily:
            '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
        }}
      >
        Forma
      </span>
    </a>
  );
}

function GithubButton() {
  return (
    <a
      href="https://github.com/haminxx/forma"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Forma on GitHub"
      className="pointer-events-auto group inline-flex h-11 items-center gap-2 justify-self-end rounded-full border border-white/15 bg-white/[0.04] px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
    >
      <Github
        size={16}
        strokeWidth={1.8}
        className="text-white/80 transition-colors group-hover:text-white"
      />
      <span className="hidden sm:inline">GitHub</span>
    </a>
  );
}
