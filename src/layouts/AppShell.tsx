import { Columns2, Home, ScanSearch } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 border-b border-transparent pb-1 text-[13px] font-medium uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-200";

export function AppShell() {
  return (
    <div className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <NavLink
            to="/"
            className="text-[15px] font-semibold tracking-[0.08em] text-white"
          >
            Forma
          </NavLink>
          <nav className="flex gap-8">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "border-white text-white" : ""}`
              }
            >
              <Home className="size-4 opacity-70" strokeWidth={1.5} aria-hidden />
              Home
            </NavLink>
            <NavLink
              to="/detector"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "border-white text-white" : ""}`
              }
            >
              <ScanSearch className="size-4 opacity-70" strokeWidth={1.5} aria-hidden />
              Detector
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "border-white text-white" : ""}`
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
