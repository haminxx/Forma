import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Github } from "lucide-react";
import { PillNav } from "../components/PillNav";
import { SiteFooter } from "../components/SiteFooter";

const SCROLL_GLASS_THRESHOLD = 24;

/**
 * Three-column sticky top bar:
 *   [Forma brand]  [PillNav]  [GitHub button]
 *
 * The grid template (`1fr auto 1fr`) keeps the pill perfectly centered
 * regardless of brand/button widths, so adding/removing copy on the side
 * columns never shifts the nav.
 *
 * Once the user scrolls past `SCROLL_GLASS_THRESHOLD` pixels the dark
 * glass backdrop fades in behind the header — hero is undisturbed at
 * rest, but every scrolled section gets a clean readable bar above it.
 */
export function AppShell() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      setScrolled(y > SCROLL_GLASS_THRESHOLD);
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

  return (
    <div
      data-app-shell
      className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]"
    >
      {/* Glass backdrop behind the top bar — fades in only after scroll
          starts so the hero (which already has its own depth) isn't
          washed out at rest. ~80% dark glass with a subtle hairline. */}
      <div
        aria-hidden="true"
        data-scrolled={scrolled ? "true" : "false"}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[88px] transition-opacity duration-300 ease-out"
        style={{
          opacity: scrolled ? 1 : 0,
          background: "rgba(20, 21, 24, 0.78)",
          backdropFilter: "saturate(140%) blur(14px)",
          WebkitBackdropFilter: "saturate(140%) blur(14px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      />

      <header className="sticky top-5 z-50 mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <BrandMark />
        <div className="justify-self-center">
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
      className="group inline-flex h-11 items-center gap-2 rounded-full px-2 text-white transition-opacity hover:opacity-90"
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
      className="group inline-flex h-11 items-center gap-2 justify-self-end rounded-full border border-white/15 bg-white/[0.04] px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
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
