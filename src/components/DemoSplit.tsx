import { useState } from "react";
import { PromptInput } from "./PromptInput";

// Rough, rambling, vague — typed the way someone describes a thing when
// they don't yet know the words for what they mean. No component vocab,
// no motion spec, no library — just vibes.
const VIBE_PROMPT =
  "yo so like can u make me one of those lil popup thingys that pops up in the corner when smth good happens?? like top right ish, kinda slides in or fades or whatever looks clean, with a green check and a msg like 'nice it worked', and it should poof away by itself after a sec but also have a lil x to close, oh and the close shouldnt feel snappy/janky, more like smooth y'know";

// Same intent, written as a precise English sentence that names real UI
// component terminology, motion language, and the libraries an LLM
// should reach for. No JSX-as-prose, no shorthand: a sentence a senior
// designer-engineer would actually write.
const FORMA_PROMPT =
  "Render a success Toast notification anchored to the top-right corner of the viewport. On mount, slide in from the right with a 220 ms ease-out transition; auto-dismiss after 4 seconds, and on exit ease out with a fade and 8 px upward offset. Compose it with a leading CheckCircle status icon, a semibold Title row, a muted Description row, and a trailing IconButton with an X glyph for manual close. Implement using a Framer Motion AnimatePresence wrapper around a motion.div, expose accessible role=\"status\" and aria-live=\"polite\", and ensure it stacks safely with up to three concurrent toasts in a top-right region.";

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
