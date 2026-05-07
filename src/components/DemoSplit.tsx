import { useState } from "react";
import { PromptInput } from "./PromptInput";

// Rough, vague — two sentences typed the way someone describes a thing
// when they don't yet know the words for what they mean.
const VIBE_PROMPT =
  "make me one of those little popup thingys that slides in from the corner when smth good happens, with a green check and a small close x. should poof away by itself after a sec but smooth, not janky.";

// Same intent in ONE sentence using direct UI component terminology, a
// real anchor, motion spec, and the React library an LLM should reach
// for.
const FORMA_PROMPT =
  "Render a success Toast (top-right anchor, 220 ms slide-in ease-out, 4 s auto-dismiss) with a CheckCircle status icon, semibold Title, muted Description, and trailing IconButton X for manual close, wrapped in a Framer Motion AnimatePresence + motion.div.";

/**
 * Side-by-side demo of the same intent expressed two different ways:
 *
 *   ┌─ Vibe Coder ──────────┐   ┌─ Forma User ──────────┐
 *   │ vague chatty prompt    │   │ precise UI vocab       │
 *   └────────────────────────┘   └────────────────────────┘
 *
 * Default (left) gradient = green→cyan→indigo, magic (right) = rose→
 * fuchsia→indigo. The credits banner from the user's PromptInput paste
 * is removed.
 */
export function DemoSplit() {
  const [left, setLeft] = useState(VIBE_PROMPT);
  const [right, setRight] = useState(FORMA_PROMPT);

  return (
    <div className="grid w-full max-w-6xl gap-6 px-4 md:grid-cols-2 md:gap-8">
      <PromptInput
        variant="default"
        label="Vibe Coder"
        caption="vague intent"
        value={left}
        onChange={(e) => setLeft(e.target.value)}
        placeholder="describe the thing you want…"
      />
      <PromptInput
        variant="magic"
        label="Forma User"
        caption="precise vocab"
        value={right}
        onChange={(e) => setRight(e.target.value)}
        placeholder="ask for the exact component, anchor, motion spec…"
      />
    </div>
  );
}
