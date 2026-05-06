import { Outlet, useLocation } from "react-router-dom";
import { DotField } from "../components/DotField";
import { DitheringBackground } from "../components/DitheringBackground";
import { PillNav } from "../components/PillNav";

export function AppShell() {
  const { pathname } = useLocation();

  return (
    <div className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]">
      {pathname === "/" ? <DitheringBackground /> : null}
      <DotField />

      <div className="relative z-10 flex min-h-full flex-col">
        <PillNav />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
