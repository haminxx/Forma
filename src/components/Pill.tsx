import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Suggestion } from "@/lib/types";
import { useLexisStore } from "@/lib/store";
import { anchorBelow } from "@/lib/position";
import { categoryColor } from "./Dot";

interface Props {
  suggestion: Suggestion;
  onAdvance: () => void;
  onDismiss: () => void;
}

export function Pill({ suggestion, onAdvance, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const track = useLexisStore((s) => s.trackRect);

  const pos = anchorBelow(suggestion.rect, { width: 220, height: 40 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = `pill-${suggestion.id}`;
    track(id, el.getBoundingClientRect());
    return () => track(id, null);
  }, [suggestion.id, track]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="lexis-ui glass-pill"
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        padding: "6px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 13,
        color: "var(--lexis-text, #e8e8ec)",
        cursor: "pointer",
      }}
      onMouseEnter={onAdvance}
      onClick={onAdvance}
      onContextMenu={(e) => {
        e.preventDefault();
        onDismiss();
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: categoryColor(suggestion.category),
          flex: "0 0 auto",
        }}
      />
      <span className="truncate max-w-[160px]">{suggestion.canonical}</span>
      <kbd
        style={{
          marginLeft: 4,
          padding: "1px 6px",
          borderRadius: 6,
          fontSize: 10,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        Tab
      </kbd>
    </motion.div>
  );
}
