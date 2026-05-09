import { useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

/**
 * Sandbox-section prompt input — liquid-glass style.
 *
 * Per latest direction: a clean, frosted prompt box that reads as a
 * single piece of glass (not a wrapped shadcn input). Width is
 * `max-w-3xl` so the bar spans the same horizontal footprint as the
 * `LogoCloud` brand grid sitting directly below it.
 *
 * Layered glass:
 *   - heavy backdrop-blur + saturate for the frosted base
 *   - hairline border + inner highlight ring for the rim
 *   - faint top gradient ridge for the "light caught on glass" feel
 *
 * Inputs / outputs are local-only — there is no submit endpoint yet.
 */
export function GlassTextarea() {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;

  return (
    <div className="relative w-full max-w-3xl px-2 sm:px-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/15 sm:rounded-[1.25rem]"
        style={{
          background:
            "linear-gradient(180deg, rgba(28, 30, 38, 0.55) 0%, rgba(18, 19, 24, 0.65) 100%)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px -28px rgba(0,0,0,0.55)",
        }}
      >
        {/* Top ridge — narrow gold-tinted highlight that catches the
            "light on glass" effect along the upper edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* The input itself. `react-textarea-autosize` keeps the bar a
            consistent ~2 rows tall while letting longer prompts grow
            up to ~6 rows before scrolling internally. */}
        <TextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={2}
          maxRows={6}
          placeholder="Describe the UI component and animation you want…"
          aria-label="Forma sandbox prompt"
          className="relative block w-full resize-none border-0 bg-transparent px-5 pt-4 pb-1 text-base leading-relaxed text-white placeholder:text-white/40 focus:outline-none focus:ring-0 sm:px-6 sm:text-[1.05rem]"
        />

        {/* Footer row: paperclip on the left, gold Send pill on the
            right. The pill activates only when the textarea has
            non-whitespace content. */}
        <div className="relative flex items-center justify-between px-3 pb-3 pt-1 sm:px-4">
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
