import { Steps } from "@ark-ui/react/steps";

const STEPS = [
  "Download Forma",
  "Visit Chrome Extensions",
  "Enable Developer Mode",
  "Load unpacked Forma",
] as const;

/**
 * Forma install path — 4 progress bars with the step name below each.
 * No numbered circles, no panel chrome (per the user's "remove the
 * background, only the bar and words below" spec). Ark UI Steps.Item
 * supplies the data-state attribute that drives the bar fill colour.
 */
export function InstallSteps() {
  return (
    <div className="w-full max-w-3xl px-4 py-2">
      <Steps.Root count={STEPS.length} defaultStep={1} className="w-full">
        <Steps.List className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((label, index) => (
            <Steps.Item
              key={label}
              index={index}
              className="group flex flex-col items-start gap-2"
            >
              <Steps.Trigger
                aria-label={label}
                className="flex w-full flex-col items-start gap-2 text-left"
              >
                <div className="h-[3px] w-full rounded-full bg-white/15 transition-colors group-data-[state=complete]:bg-blue-500 group-data-[state=current]:bg-blue-500" />
                <span className="text-xs font-medium tracking-wide text-white/65 transition-colors group-data-[state=current]:text-white">
                  {label}
                </span>
              </Steps.Trigger>
            </Steps.Item>
          ))}
        </Steps.List>
      </Steps.Root>
    </div>
  );
}
