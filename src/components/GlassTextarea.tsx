import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUp, Paperclip } from "lucide-react";

/**
 * Sandbox-section prompt input — liquid-glass frame inspired by the
 * `ruixen-moon-chat` reference. A frosted-glass card with:
 *   - auto-resizing textarea
 *   - paperclip attach button on the left
 *   - gold "Send" pill on the right that activates only when text exists
 *
 * Local component state only — there is no submit target yet, so this
 * is a UI demo of the form factor users will see when Forma's sandbox
 * goes live.
 */
export function GlassTextarea() {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;

  return (
    <div className="relative w-full max-w-3xl">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/15"
        style={{
          background: "rgba(15, 16, 20, 0.55)",
          backdropFilter: "blur(22px) saturate(140%)",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
          boxShadow:
            "0 28px 70px -32px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 0.5px rgba(255,255,255,0.05)",
        }}
      >
        {/* Top liquid-glass shine — narrow gradient ridge so the frame
            reads as a single piece of frosted glass instead of a flat box. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 55%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Soft gold inner glow at the bottom — ties the textbox to the
            section's gold gradient backdrop so they read as one stage. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 bottom-0 h-12"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(212,184,122,0.12), transparent 70%)",
          }}
        />

        <TextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minRows={3}
          maxRows={8}
          placeholder="Describe your UI component and animation"
          aria-label="Forma sandbox prompt"
          className="relative block w-full resize-none border-0 bg-transparent px-7 pt-6 pb-2 text-base text-white placeholder:text-white/45 focus:outline-none focus:ring-0"
        />

        <div className="relative flex items-center justify-between px-5 pb-4 pt-1">
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
