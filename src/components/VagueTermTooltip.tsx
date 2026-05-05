type VagueTermTooltipProps = {
  professionalTerm: string;
  category: string;
  definition: string;
  alternatives: readonly [string, string, string];
  onAccept: () => void;
  onSkip: () => void;
};

export function VagueTermTooltip({
  professionalTerm,
  category,
  definition,
  alternatives,
  onAccept,
  onSkip,
}: VagueTermTooltipProps) {
  return (
    <div
      className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/12 bg-zinc-950/35 p-5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-2xl backdrop-saturate-150"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
            Professional term
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-white">
            {professionalTerm}
          </p>
        </div>

        <div>
          <span className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-300">
            {category}
          </span>
        </div>

        <p className="text-sm leading-relaxed tracking-tight text-zinc-400">{definition}</p>

        <div className="flex gap-2">
          {alternatives.map((label) => (
            <button
              key={label}
              type="button"
              className="flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold tracking-tight text-zinc-950 transition hover:bg-zinc-100"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm font-medium tracking-tight text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.06]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
