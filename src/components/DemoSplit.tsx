import { useState } from "react";
import { PromptInput } from "./PromptInput";

// Long, chatty, vague — the kind of prompt every model has to play "what
// did they actually mean" with for a few rounds before producing usable
// UI. Concrete intent buried in connective tissue.
const VIBE_PROMPT =
  "ok so can you make me one of those little popup notification things that show up at the top right corner of the page when something good happens, like maybe slides in from the side or kinda fades in or whatever feels nice, and it should have a green check icon and some text saying it worked, and then it goes away on its own after a few seconds but also has a small x button so people can close it manually, and yeah make it look modern and clean and not janky and like the close thing should be smooth not a hard cut";

// Short(er) and surgical: real component names, anchor, motion specs,
// duration in ms, plus the exact React libs the AI should reach for.
const FORMA_PROMPT =
  '<Toast variant="success" anchor="top-right" />: 220ms slide-in from the right (ease-out), 4s auto-dismiss. CheckCircle icon, bold Title, muted Description, trailing IconButton(X) for manual close. Wrap with <AnimatePresence>+<motion.div> (Framer Motion) so exit eases out.';

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
