import { Outlet } from "react-router-dom";
import { Github } from "lucide-react";
import { PillNav } from "../components/PillNav";
import { SiteFooter } from "../components/SiteFooter";

/**
 * Header layout (revised per latest direction):
 *
 *   - Brand mark + GitHub button: ABSOLUTE at top: 5 of the page.
 *     They scroll with the page, so they're visible while the home
 *     hero is in view and naturally leave the viewport once the user
 *     scrolls past it. They are NOT sticky.
 *
 *   - PillNav: FIXED at top: 5 of the viewport. Always visible,
 *     "floats" down with the user as they scroll through every
 *     section.
 *
 * Both layers sit at z-50 and are in their own stacking row so neither
 * pushes flow content. <main> starts at the very top of the document,
 * which lets the home hero (`h-screen`) fill the viewport from y=0
 * with no body-bg gap above it — closing the prior "small empty
 * space" at the top.
 */
export function AppShell() {
  return (
    <div
      data-app-shell
      className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]"
    >
      {/* Static brand bar — only visible while scrolled to home,
          scrolls away with the page after that. `pointer-events-none`
          on the wrapper so the empty centre column never blocks
          clicks on whatever is underneath; the children re-enable
          pointer events. */}
      <div className="pointer-events-none absolute inset-x-0 top-5 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <BrandMark />
        <div />
        <GithubButton />
      </div>

      {/* Floating PillNav — fixed at top: 5 of the viewport so it
          stays put as the user scrolls. Wrapped in a pointer-events-
          none container so the empty flanks don't block content. */}
      <div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-6">
        <div className="pointer-events-auto">
          <PillNav />
        </div>
      </div>

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
