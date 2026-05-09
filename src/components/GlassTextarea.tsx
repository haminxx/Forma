import { useState } from "react";
import { ArrowUp, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

/**
 * Sandbox-section prompt input — liquid-glass frame inspired by the
 * `ruixen-moon-chat` reference. A frosted-glass card with:
 *   - shared `Textarea` from `@/components/ui/textarea`
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
    <div className="relative w-full max-w-[min(calc(100vw-2rem),120rem)]">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/14 sm:rounded-[1.35rem]"
        style={{
          background: "rgba(18, 19, 24, 0.78)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Narrow top ridge — flatter silhouette than rounded-3xl glass. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
        />

        <Textarea
          value={message}
          onChange={(v) => setMessage(v ?? "")}
          size="large"
          placeholder="Describe your UI component and animation"
          aria-label="Forma sandbox prompt"
          style={{ minHeight: 52, maxHeight: 72 }}
          className="relative !h-[52px] !min-h-[52px] !max-h-[4.5rem] overflow-y-auto !border-0 !bg-transparent px-[clamp(1rem,3.5vw,2rem)] py-2 text-[clamp(0.9rem,2.2vw,1.05rem)] leading-snug !text-white placeholder:!text-white/45 hover:!border-transparent focus:!border-transparent focus:!shadow-none !ring-0 focus:!ring-0"
        />

        <div className="relative flex items-center justify-between px-[clamp(0.9rem,3vw,1.75rem)] pb-[clamp(0.65rem,2vw,0.85rem)] pt-0.5">
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
