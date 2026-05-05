export function ComparePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
          Comparison
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Before / after.
          <span className="block text-zinc-500">Side by side.</span>
        </h1>
        <p className="mt-8 text-base leading-relaxed tracking-tight text-zinc-400">
          A stark canvas reserved for prompt diffs—two columns, one verdict. Coming
          soon for the hackathon narrative arc.
        </p>
      </div>

      <div className="mt-auto grid flex-1 gap-6 pb-12 pt-24 md:grid-cols-2">
        <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] p-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
            Column A
          </p>
          <p className="mt-8 text-sm tracking-tight text-zinc-500">
            Raw prompt placeholder.
          </p>
        </div>
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-transparent p-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
            Column B
          </p>
          <p className="mt-8 text-sm tracking-tight text-zinc-500">
            Forma-refined placeholder.
          </p>
        </div>
      </div>
    </div>
  );
}
