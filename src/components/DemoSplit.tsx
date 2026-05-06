import { useState } from "react";
import { PromptInput } from "./PromptInput";

const VIBE_PROMPT = "make a card with a thingy at the top and like a button";
const FORMA_PROMPT =
  "Generate a Card with a header containing an Avatar + Title, body text, and a primary Button in the footer.";

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
        placeholder="ask for a Card with header / body / footer…"
      />
    </div>
  );
}
