import { cn } from "../lib/cn";

export type Alternative = {
  title: string;
  description: string;
};

type FormaSuggestsCardProps = {
  professionalTerm: string;
  description: string;
  alternatives: readonly [Alternative, Alternative, Alternative];
  /** Footer status — model · hardware · latency · mode. */
  status?: {
    model: string;
    hardware: string;
    latencyMs: number;
    mode: string;
  };
  className?: string;
};

const DEFAULT_STATUS = {
  model: "Llama 3.1 8B",
  hardware: "AMD MI300X",
  latencyMs: 1345,
  mode: "keyword",
};

/**
 * Presentational popover that mirrors the FORMA SUGGESTS screenshot:
 *   - Eyebrow row ("FORMA SUGGESTS" / "Click accept")
 *   - Headline + description
 *   - Animated component preview (bars + sliding panel)
 *   - Three alternative pill-cards
 *   - Accept (gold) + Skip (outline) action row
 *   - Status footer with pulsing green dot
 *
 * Pure visual — no clicks wired up; this is a preview shown beneath the
 * landing page's prompt demo box.
 */
export function FormaSuggestsCard({
  professionalTerm,
  description,
  alternatives,
  status = DEFAULT_STATUS,
  className,
}: FormaSuggestsCardProps) {
  return (
    <div
      className={cn(
        "w-[min(34rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--color-forma-border-strong)] bg-[var(--color-forma-card)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]",
        className,
      )}
      role="dialog"
      aria-label={`Forma suggests ${professionalTerm}`}
    >
      <div className="space-y-5 p-5">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-forma-gold)]">
            Forma suggests
          </p>
          <p className="text-[11px] tracking-tight text-[var(--color-forma-muted)]">
            Click accept
          </p>
        </div>

        {/* Headline + description */}
        <div className="space-y-2">
          <h3 className="text-[26px] font-semibold leading-tight tracking-tight text-[var(--color-forma-fg)]">
            {professionalTerm}
          </h3>
          <p className="max-w-[28rem] text-sm leading-relaxed text-[var(--color-forma-muted)]">
            {description}
          </p>
        </div>

        {/* Animated component preview — bars on left, sliding panel on right */}
        <PreviewStage />

        {/* Alternatives */}
        <div className="grid grid-cols-3 gap-2">
          {alternatives.map((alt) => (
            <div
              key={alt.title}
              className="rounded-xl border border-[var(--color-forma-border)] bg-[var(--color-forma-card-2)] p-3"
            >
              <p className="text-[13px] font-semibold leading-tight tracking-tight text-[var(--color-forma-fg)]">
                {alt.title}
              </p>
              <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-[var(--color-forma-muted)]">
                {alt.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="flex items-stretch gap-2 pt-1">
          <div
            className="flex flex-1 items-center justify-center rounded-xl bg-[var(--color-forma-gold)] px-4 py-3 text-[13px] font-semibold tracking-tight text-[#1a1612] shadow-[0_10px_30px_-12px_rgba(200,184,154,0.6)]"
            aria-hidden
          >
            Accept &ldquo;{professionalTerm}&rdquo;
          </div>
          <div
            className="flex items-center justify-center rounded-xl border border-[var(--color-forma-border-strong)] px-5 py-3 text-[13px] font-medium text-[var(--color-forma-muted)]"
            aria-hidden
          >
            Skip
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div className="flex items-center gap-2 border-t border-[var(--color-forma-border)] bg-[var(--color-forma-surface)] px-5 py-3 font-mono text-[11px] tracking-tight text-[var(--color-forma-status)]">
        <span className="forma-status-dot inline-block h-2 w-2 rounded-full bg-[var(--color-forma-status)]" />
        <span>{status.model}</span>
        <span className="text-[var(--color-forma-faint)]">·</span>
        <span>{status.hardware}</span>
        <span className="text-[var(--color-forma-faint)]">·</span>
        <span>{status.latencyMs}ms</span>
        <span className="text-[var(--color-forma-faint)]">·</span>
        <span>
          Mode: <span className="text-[var(--color-forma-gold-bright)]">{status.mode}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * The animated mini-preview inside the suggests card.
 * Two text bars on the left, a thin vertical gold "spine", and a panel of
 * menu lines on the right that slides in — visually evoking an off-canvas
 * menu without being term-specific (good enough for any UI suggestion).
 */
function PreviewStage() {
  return (
    <div className="relative h-[120px] overflow-hidden rounded-xl border border-[var(--color-forma-border)] bg-[var(--color-forma-surface)]">
      <div className="absolute inset-0 flex items-center">
        {/* Left content (page bars) */}
        <div className="flex flex-1 flex-col gap-2 px-5">
          <div
            className="h-[3px] w-[70%] rounded-full bg-[var(--color-forma-gold)]/70"
            style={{ animation: "forma-preview-bar1 4s ease-in-out infinite" }}
          />
          <div
            className="h-[3px] w-[55%] rounded-full bg-[var(--color-forma-gold)]/55"
            style={{ animation: "forma-preview-bar2 4s ease-in-out infinite" }}
          />
          <div
            className="h-[3px] w-[78%] rounded-full bg-[var(--color-forma-gold)]/45"
            style={{
              animation: "forma-preview-bar2 4s ease-in-out infinite",
              animationDelay: "0.15s",
            }}
          />
        </div>

        {/* Vertical gold spine separating page and panel */}
        <div className="h-[80%] w-px bg-gradient-to-b from-transparent via-[var(--color-forma-gold-strong)] to-transparent" />

        {/* Right "menu panel" sliding in */}
        <div
          className="flex w-[44%] flex-col gap-2 bg-[var(--color-forma-card-2)] px-5 py-4"
          style={{ animation: "forma-preview-panel 4s ease-in-out infinite" }}
        >
          <div className="h-[3px] w-[80%] rounded-full bg-[var(--color-forma-gold)]/80" />
          <div className="h-[3px] w-[65%] rounded-full bg-[var(--color-forma-gold)]/60" />
          <div className="h-[3px] w-[75%] rounded-full bg-[var(--color-forma-gold)]/55" />
          <div className="h-[3px] w-[50%] rounded-full bg-[var(--color-forma-gold)]/45" />
        </div>
      </div>
    </div>
  );
}
