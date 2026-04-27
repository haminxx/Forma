import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Suggestion } from "@/lib/types";
import { useLexisStore } from "@/lib/store";
import { anchorBelow } from "@/lib/position";
import { acceptSuggestion, dismissSuggestion } from "@/lib/ipc";
import { AnimationPreview } from "./AnimationPreview";
import { categoryColor } from "./Dot";

interface Props {
  suggestion: Suggestion;
  onLive: () => void;
  onDismiss: () => void;
}

export function Card({ suggestion, onLive, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const track = useLexisStore((s) => s.trackRect);
  const clear = useLexisStore((s) => s.clear);

  const pos = anchorBelow(suggestion.rect, { width: 320, height: 260 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = `card-${suggestion.id}`;
    track(id, el.getBoundingClientRect());
    return () => track(id, null);
  }, [suggestion.id, track]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Tab") {
        e.preventDefault();
        accept();
      } else if (e.code === "Escape") {
        e.preventDefault();
        dismiss("escape");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion.id]);

  async function accept() {
    try {
      await acceptSuggestion(suggestion);
    } finally {
      clear();
    }
  }

  async function dismiss(reason: string) {
    try {
      await dismissSuggestion(suggestion.term_id, suggestion.original_text, reason);
    } finally {
      onDismiss();
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="lexis-ui glass-card"
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: 320,
        padding: 16,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: categoryColor(suggestion.category),
          }}
        />
        <span style={{ fontSize: 12, opacity: 0.7, textTransform: "capitalize" }}>
          {suggestion.category}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            opacity: 0.55,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {(suggestion.confidence * 100).toFixed(0)}%
        </span>
      </header>

      <h3
        style={{
          margin: "6px 0 4px",
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {suggestion.canonical}
      </h3>

      <AnimationPreview asset={suggestion.animation_asset} />

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.45,
          margin: "8px 0",
          opacity: 0.85,
        }}
      >
        {suggestion.definition}
      </p>

      {suggestion.original_text && (
        <p
          style={{
            fontSize: 12,
            opacity: 0.55,
            margin: "6px 0 12px",
          }}
        >
          Replaces:{" "}
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              textDecoration: "line-through",
              textDecorationColor: "rgba(255,150,150,0.5)",
            }}
          >
            {suggestion.original_text}
          </span>
        </p>
      )}

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 4,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={accept}
            style={btnPrimary}
            title="Accept and replace (Tab)"
          >
            Accept
            <kbd style={kbd}>Tab</kbd>
          </button>
          {suggestion.live_preview_id && (
            <button onClick={onLive} style={btnSecondary} title="Try it live (Ctrl+Space)">
              Try it
              <kbd style={kbd}>⌃␣</kbd>
            </button>
          )}
        </div>
        <button
          onClick={() => dismiss("manual")}
          style={btnGhost}
          title="Dismiss (Esc)"
        >
          Esc
        </button>
      </footer>
    </motion.div>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontFamily: "Inter, system-ui, sans-serif",
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "inherit",
};
const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "rgba(120, 180, 255, 0.2)",
  border: "1px solid rgba(120, 180, 255, 0.45)",
};
const btnSecondary: React.CSSProperties = { ...btnBase };
const btnGhost: React.CSSProperties = {
  ...btnBase,
  opacity: 0.55,
  padding: "4px 8px",
};
const kbd: React.CSSProperties = {
  padding: "1px 6px",
  borderRadius: 6,
  fontSize: 10,
  background: "rgba(255,255,255,0.08)",
  fontFamily: "JetBrains Mono, monospace",
};
