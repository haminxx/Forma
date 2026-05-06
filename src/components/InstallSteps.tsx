import { Steps } from "@ark-ui/react/steps";

const STEPS = [
  "Download Forma",
  "Visit Chrome Extensions",
  "Enable Developer Mode",
  "Load unpacked Forma",
] as const;

/**
 * Forma install path — 4-step Ark UI Steps indicator. Themed for the
 * Forma dark canvas with a gold accent on completed/current rings.
 */
export function InstallSteps() {
  return (
    <div className="w-full px-4 py-6">
      <Steps.Root count={STEPS.length} defaultStep={0} className="mx-auto w-full max-w-2xl">
        <Steps.List className="flex items-center justify-between">
          {STEPS.map((label, index) => (
            <Steps.Item
              key={label}
              index={index}
              className="relative flex flex-1 items-center last:flex-initial"
            >
              <Steps.Trigger className="flex items-center gap-3 rounded-md text-left">
                <Steps.Indicator className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors data-[state=complete]:border-[#d4b87a] data-[state=complete]:bg-[#d4b87a] data-[state=complete]:text-[#1a1612] data-[state=current]:border-[#d4b87a] data-[state=current]:bg-[#d4b87a] data-[state=current]:text-[#1a1612] data-[state=incomplete]:border-white/20 data-[state=incomplete]:bg-white/5 data-[state=incomplete]:text-white/60">
                  {index + 1}
                </Steps.Indicator>
                <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-white/70 sm:inline-block">
                  {label}
                </span>
              </Steps.Trigger>
              <Steps.Separator
                hidden={index === STEPS.length - 1}
                className="mx-3 h-0.5 flex-1 bg-white/10 data-[state=complete]:bg-[#d4b87a]"
              />
            </Steps.Item>
          ))}
        </Steps.List>
      </Steps.Root>
    </div>
  );
}
