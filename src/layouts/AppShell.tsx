import { Outlet } from "react-router-dom";
import { DotField } from "../components/DotField";
import { FloatingHeader } from "../components/FloatingHeader";

export function AppShell() {
  return (
    <div className="relative flex min-h-full flex-col text-[var(--color-stitch-fg)]">
      <DotField />

      <div className="relative z-10 flex min-h-full flex-col">
        <FloatingHeader />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
