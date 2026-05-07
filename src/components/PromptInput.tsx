import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Mic, WandSparkles, Paperclip, ArrowUp } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "../lib/cn";

/**
 * Adapted from the user-pasted PromptInput. Two changes:
 *   - The credits banner / `credits` / `onUpgrade` props were removed (the
 *     demo screen uses two side-by-side instances and the credit copy
 *     wasn't carrying weight there).
 *   - The textarea wrapper switches to `bg-[#0c0c0c]` to match Forma's
 *     dark surface tokens instead of `bg-background`.
 */
const promptInputVariants = cva(
  "relative w-full overflow-hidden rounded-2xl p-px",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-emerald-300/80 via-cyan-300/80 to-indigo-400/80",
        magic:
          "bg-gradient-to-r from-rose-400/80 via-fuchsia-500/80 to-indigo-500/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// `react-textarea-autosize` ships its own narrower `Style` type (height
// must be a number), so we strip `style` from the standard textarea
// attributes before extending and re-add a more permissive `style?: any`.
export interface PromptInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "style">,
    VariantProps<typeof promptInputVariants> {
  /** Optional submit handler — fires when the user hits the send button. */
  onSubmit?: () => void;
  /** Optional loading flag — replaces the arrow with a spinner. */
  isLoading?: boolean;
  /** Optional accent label rendered above the textarea ("Vibe Coder" / "Forma User"). */
  label?: string;
  /** Optional caption rendered next to the label. */
  caption?: string;
}

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (
    {
      className,
      variant,
      onSubmit,
      isLoading,
      label,
      caption,
      ...props
    },
    ref,
  ) => {
    const actionButtons = React.useMemo(
      () => [
        { icon: Mic, label: "Use microphone" },
        { icon: WandSparkles, label: "Magic tools" },
        { icon: Paperclip, label: "Attach file" },
      ],
      [],
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(promptInputVariants({ variant }), className)}
      >
        {/* Fixed box height (260 px) with the textarea region taking the
            remaining space and the action button row pinned to the
            bottom. The textarea uses overflow-hidden + scrollbar-none so
            no scrollbar ever appears inside the box; with the new short
            prompts the content fits comfortably. */}
        <div className="relative flex h-[260px] w-full flex-col rounded-[15px] bg-[#0c0c0c]">
          {label ? (
            <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              <span>{label}</span>
              {caption ? (
                <span className="normal-case tracking-normal text-white/40">
                  {caption}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col overflow-hidden p-3 sm:p-4">
            <div
              className="flex-1 overflow-hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              } as React.CSSProperties}
            >
              <TextareaAutosize
                ref={ref}
                className="block h-full w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
                minRows={3}
                maxRows={6}
                {...props}
              />
            </div>

            <div className="mt-3 flex flex-shrink-0 items-center justify-between">
              <div className="flex items-center gap-3 text-white/55">
                {actionButtons.map((Button) => (
                  <button
                    key={Button.label}
                    type="button"
                    aria-label={Button.label}
                    disabled={isLoading}
                    className="transition-colors hover:text-white disabled:opacity-50"
                  >
                    <Button.icon size={18} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onSubmit}
                aria-label="Submit prompt"
                disabled={isLoading}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b87a] text-black transition-all duration-300",
                  "hover:bg-[#e2c890]",
                  "disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40",
                )}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ArrowUp size={18} strokeWidth={2.4} />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);
PromptInput.displayName = "PromptInput";
