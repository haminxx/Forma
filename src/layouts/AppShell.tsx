import { Outlet } from "react-router-dom";
import { AuroraBackground } from "../components/AuroraBackground";
import { FloatingHeader } from "../components/FloatingHeader";

/**
 * Top-level layout. Stack:
 *   - AuroraBackground sits at z-0 and is fixed to the viewport.
 *   - FloatingHeader is sticky at the top (z-50).
 *   - Page content lives at z-10 above the aurora.
 */
export function AppShell() {
  return (
    <div className="relative flex min-h-full flex-col text-[var(--color-forma-fg)]">
      <AuroraBackground />

      <div className="relative z-10 flex min-h-full flex-col">
        <FloatingHeader />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
