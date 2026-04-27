import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Suggestion } from "@/lib/types";
import { useLexisStore } from "@/lib/store";
import { anchorBelow } from "@/lib/position";

interface Props {
  suggestion: Suggestion;
  onAdvance: () => void;
  onDismiss: () => void;
}

export function Dot({ suggestion, onAdvance, onDismiss }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const track = useLexisStore((s) => s.trackRect);

  const pos = anchorBelow(suggestion.rect, { width: 16, height: 16 });

  useEffect(() => {
    // Auto-advance to pill after the configured expand delay.
    const t = setTimeout(onAdvance, 800);
    return () => clearTimeout(t);
  }, [onAdvance]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = `dot-${suggestion.id}`;
    track(id, el.getBoundingClientRect());
    return () => track(id, null);
  }, [suggestion.id, track]);

  return (
    <motion.div
      ref={ref}
      role="button"
      aria-label={`Lexis suggestion: ${suggestion.canonical}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="lexis-ui animate-lexis-pulse"
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: 10,
        height: 10,
        borderRadius: 999,
        background: categoryColor(suggestion.category),
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.35)",
      }}
      onMouseEnter={onAdvance}
      onContextMenu={(e) => {
        e.preventDefault();
        onDismiss();
      }}
    />
  );
}

export function categoryColor(c: Suggestion["category"]): string {
  switch (c) {
    case "component":
      return "#f5b042";
    case "pattern":
      return "#42d4f5";
    case "style":
      return "#a142f5";
    case "motion":
      return "#42f58d";
    default:
      return "rgba(120, 180, 255, 0.85)";
  }
}
