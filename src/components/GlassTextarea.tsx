import { useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

/**
 * Sandbox-section prompt input — liquid-glass style.
 *
 * Sized per the latest direction at a roughly 3:1 width-to-height
 * ratio so the prompt reads as a chunky "pad" instead of a thin
 * search bar:
 *   max-w-xl  ≈ 576 px wide
 *   min-h-48  ≈ 192 px tall
 *   ratio     ≈ 3 : 1
 *
 * Layered glass:
 *   - heavy backdrop-blur + saturate for the frosted base
 *   - hairline border + inner highlight ring for the rim
 *   - faint top gradient ridge for the "light caught on glass" feel
 */
export function GlassTextarea() {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;

  return (
    <div className="relative w-full max-w-xl px-2 sm:px-4">
      <div
        className="group relative flex min-h-48 flex-col overflow-hidden rounded-2xl border border-white/15 transition-colors duration-200 focus-within:border-white/30 sm:rounded-[1.25rem]"
        style={{
          background:
            "linear-gradient(180deg, rgba(28, 30, 38, 0.55) 0%, rgba(18, 19, 24, 0.65) 100%)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px -28px rgba(0,0,0,0.55)",
        }}
      >
        {/* Top ridge — narrow highlight that catches the "light on
            glass" effect along the upper edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* The input itself — given more vertical breathing room
            (minRows 4) so the prompt-pad fills the 3:1 frame
            instead of leaving a wide blank patch under the cursor.
            Scrollbar defensively hidden across all browsers. */}
        <TextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={4}
          maxRows={8}
          placeholder="Describe the UI component and animation you want…"
          aria-label="Forma sandbox prompt"
          className="relative block w-full flex-1 resize-none border-0 bg-transparent px-5 pt-5 text-base leading-relaxed text-white placeholder:text-white/40 focus:outline-none focus:ring-0 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:text-[1.05rem]"
          style={{ scrollbarWidth: "none" }}
        />

        {/* Footer row: paperclip on the left, gold Send pill on the
            right. The pill activates only when the textarea has
            non-whitespace content. */}
        <div className="relative flex items-center justify-between px-3 pb-3 pt-2 sm:px-4">
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
                : "rgba(255,255,255,0.06)",
              color: canSend ? "#191a1f" : "rgba(255,255,255,0.45)",
              cursor: canSend ? "pointer" : "not-allowed",
              boxShadow: canSend
                ? "0 8px 22px -10px rgba(212,184,122,0.6), inset 0 1px 0 rgba(255,255,255,0.45)"
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
