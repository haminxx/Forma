import { Grid2x2Plus, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";

/**
 * Sticky, glass-morphic floating navigation — adapted from the Asme reference.
 * No Radix dependency: the mobile drawer is a controlled overlay + side panel
 * driven by local state, with focus + ESC handling baked in.
 */

type NavItem = { label: string; to: string; end?: boolean };

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", to: "/", end: true },
  { label: "Detector", to: "/detector" },
  { label: "Compare", to: "/compare" },
];

export function FloatingHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-5 z-50 mx-auto w-full max-w-3xl px-4">
        <div
          className={cn(
            "rounded-2xl border border-white/10 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)]",
            "bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30",
          )}
        >
          <nav
            aria-label="Primary"
            className="flex items-center justify-between gap-3 p-1.5"
          >
            <NavLink
              to="/"
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-white/5"
            >
              <Grid2x2Plus
                className="size-5 text-[var(--color-aurora-purple)] transition group-hover:text-[var(--color-aurora-pink)]"
                strokeWidth={1.6}
                aria-hidden
              />
              <span className="font-mono text-[15px] font-bold tracking-tight text-white">
                Forma
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-white/60">
                Beta UI
              </span>
            </NavLink>

            <div className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-1.5 text-[13px] font-medium transition",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/65 hover:bg-white/5 hover:text-white",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/detector"
                className="hidden rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold tracking-tight text-black transition hover:bg-white/90 sm:inline-flex"
              >
                Sandbox
              </NavLink>

              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="rounded-md border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 lg:hidden"
                aria-label={open ? "Close navigation" : "Open navigation"}
                aria-expanded={open}
                aria-controls="forma-mobile-nav"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile sheet ----------------------------------------------------- */}
      <div
        id="forma-mobile-nav"
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10",
            "bg-black/80 p-6 backdrop-blur-xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Mobile navigation"
        >
          <div className="mt-12 grid gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/75 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto grid gap-2 pt-6">
            <NavLink
              to="/detector"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-white/10"
            >
              Sign in
            </NavLink>
            <NavLink
              to="/detector"
              onClick={() => setOpen(false)}
              className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Sandbox
            </NavLink>
          </div>
        </aside>
      </div>
    </>
  );
}
