import { useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useLexisStore } from "@/lib/store";
import { Dot } from "./Dot";
import { Pill } from "./Pill";
import { Card } from "./Card";
import { LivePreviewPanel } from "./LivePreviewPanel";

/**
 * The overlay root.
 *
 * Layout invariant: the root itself is click-through
 * (`pointer-events: none`); every child that should capture input must
 * live inside a `.lexis-ui` wrapper AND register its rect with the
 * store (so Rust can flip `ignore_cursor_events` appropriately).
 */
export function Overlay() {
  const { suggestions, activeId, level, setLevel, setActive } = useLexisStore();

  const active = useMemo(
    () => suggestions.find((s) => s.id === activeId) ?? suggestions[0],
    [suggestions, activeId],
  );

  useEffect(() => {
    if (!active) return;
    if (level !== "hidden") return;
    setLevel("dot");
  }, [active, level, setLevel]);

  // Keyboard: Tab accepts, Esc dismisses (handled inside Card).
  // Ctrl+Space upgrades to Live preview.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return;
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        setLevel(level === "live" ? "card" : "live");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, level, setLevel]);

  return (
    <div className="lexis-overlay-root">
      <AnimatePresence mode="wait">
        {active && level === "dot" && (
          <Dot
            key={`dot-${active.id}`}
            suggestion={active}
            onAdvance={() => setLevel("pill")}
            onDismiss={() => setActive(null)}
          />
        )}
        {active && level === "pill" && (
          <Pill
            key={`pill-${active.id}`}
            suggestion={active}
            onAdvance={() => setLevel("card")}
            onDismiss={() => setLevel("dot")}
          />
        )}
        {active && level === "card" && (
          <Card
            key={`card-${active.id}`}
            suggestion={active}
            onLive={() => setLevel("live")}
            onDismiss={() => setLevel("hidden")}
          />
        )}
        {active && level === "live" && (
          <LivePreviewPanel
            key={`live-${active.id}`}
            suggestion={active}
            onBack={() => setLevel("card")}
            onClose={() => setLevel("hidden")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
