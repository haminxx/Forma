import { Columns2, Home, ScanSearch } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 border-b border-transparent pb-1 text-[13px] font-medium uppercase tracking-[0.2em] text-[var(--color-forma-muted)] transition hover:text-[var(--color-forma-fg)]";

export function AppShell() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--color-forma-bg)] text-[var(--color-forma-fg)]">
      <header className="border-b border-[var(--color-forma-border)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <NavLink
            to="/"
            className="text-[15px] font-semibold tracking-[0.08em] text-[var(--color-forma-fg)]"
          >
            <span className="text-[var(--color-forma-gold)]">●</span>{" "}
            <span className="ml-1">Forma</span>
          </NavLink>
          <nav className="flex gap-8">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "border-[var(--color-forma-gold)] text-[var(--color-forma-fg)]"
                    : ""
                }`
              }
            >
              <Home className="size-4 opacity-70" strokeWidth={1.5} aria-hidden />
              Home
            </NavLink>
            <NavLink
              to="/detector"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "border-[var(--color-forma-gold)] text-[var(--color-forma-fg)]"
                    : ""
                }`
              }
            >
              <ScanSearch className="size-4 opacity-70" strokeWidth={1.5} aria-hidden />
              Detector
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "border-[var(--color-forma-gold)] text-[var(--color-forma-fg)]"
                    : ""
                }`
              }
            >
              <Columns2 className="size-4 opacity-70" strokeWidth={1.5} aria-hidden />
              Compare
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
