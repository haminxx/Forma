import { Outlet } from "react-router-dom";
import { PillNav } from "../components/PillNav";

export function AppShell() {
  return (
    <div className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]">
      <PillNav />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
