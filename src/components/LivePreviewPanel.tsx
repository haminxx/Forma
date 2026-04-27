import { motion } from "framer-motion";
import { lazy, Suspense, useEffect, useRef } from "react";
import type { Suggestion } from "@/lib/types";
import { useLexisStore } from "@/lib/store";
import { loadPreview } from "@/lib/previewRegistry";

interface Props {
  suggestion: Suggestion;
  onBack: () => void;
  onClose: () => void;
}

/**
 * Level 4: 21st.dev-style live component sandbox.
 *
 * Two rendering modes:
 *
 * 1. If the term's `live_preview_id` maps to a registered local
 *    component, render it directly (fast, no bundler, native DOM).
 * 2. Otherwise, lazy-load the Sandpack playground with a starter
 *    template for the term (heavier, runs a full bundler in-browser).
 *
 * We keep Sandpack behind `React.lazy` so the overlay's warm path
 * doesn't pay for it.
 */
export function LivePreviewPanel({ suggestion, onBack, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const track = useLexisStore((s) => s.trackRect);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = `live-${suggestion.id}`;
    track(id, el.getBoundingClientRect());
    return () => track(id, null);
  }, [suggestion.id, track]);

  const Local = suggestion.live_preview_id
    ? loadPreview(suggestion.live_preview_id)
    : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="lexis-ui glass-card"
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 560,
        maxWidth: "90vw",
        height: 480,
        maxHeight: "85vh",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
          {suggestion.canonical} — live
        </h3>
        <button
          onClick={onClose}
          style={{
            marginLeft: "auto",
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </header>

      <div
        style={{
          flex: 1,
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {Local ? (
          <Suspense fallback={<CenterText label="loading preview…" />}>
            <Local />
          </Suspense>
        ) : (
          <SandpackFallback />
        )}
      </div>
    </motion.div>
  );
}

function CenterText({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        opacity: 0.5,
        fontSize: 12,
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {label}
    </div>
  );
}

const SandpackView = lazy(() =>
  import("@codesandbox/sandpack-react").then((m) => ({
    default: function LocalSandpack() {
      return (
        <m.Sandpack
          template="react-ts"
          theme="dark"
          options={{ showNavigator: false, showTabs: false, editorHeight: 380 }}
        />
      );
    },
  })),
);

function SandpackFallback() {
  return (
    <Suspense fallback={<CenterText label="loading sandbox…" />}>
      <SandpackView />
    </Suspense>
  );
}
