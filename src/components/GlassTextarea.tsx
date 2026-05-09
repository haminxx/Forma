import { useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

/**
 * Sandbox-section prompt input. Built around the user-pasted shadcn
 * `Textarea` (`@/components/ui/textarea`) with the Geist token system,
 * wrapped in a thin frame that adds:
 *   - paperclip "attach" affordance on the left
 *   - gold "Send" pill on the right that activates only when text
 *     exists
 *
 * Width is matched to the LogoCloud below so the prompt aligns
 * edge-to-edge with the 4 × 2 brand grid (`max-w-3xl`). The textarea
 * itself uses `size="large"` so its base height matches the Geist
 * spec.
 */
export function GlassTextarea() {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;

  return (
    <div className="relative w-full max-w-3xl px-2 sm:px-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={message}
          onChange={(v) => setMessage(v ?? "")}
          size="large"
          placeholder="Describe your UI component and animation"
          aria-label="Forma sandbox prompt"
          // The shadcn Textarea ships with `bg-background-100` (light
          // mode) / `var(--ds-background-100)` (dark mode). We override
          // the height so the bar feels generous on the gold backdrop.
          className="!h-auto min-h-[88px] !resize-none !rounded-xl !text-base"
        />

        {/* Action row sits below the input so the textarea remains the
            full Geist-spec component, while the send button + attach
            affordance still feel attached. */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="Attach reference"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Paperclip size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            disabled={!canSend}
            aria-label="Send prompt"
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all"
            style={{
              background: canSend
                ? "linear-gradient(180deg, #e7cf95 0%, #d4b87a 100%)"
                : "rgba(255,255,255,0.08)",
              color: canSend ? "#191a1f" : "rgba(255,255,255,0.45)",
              cursor: canSend ? "pointer" : "not-allowed",
              boxShadow: canSend
                ? "0 8px 22px -10px rgba(212, 184, 122, 0.6), inset 0 1px 0 rgba(255,255,255,0.45)"
                : "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <ArrowUp size={14} strokeWidth={2.2} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
