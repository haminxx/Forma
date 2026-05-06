import { Steps } from "@ark-ui/react/steps";

/**
 * Forma install path — 4-step Ark UI Steps indicator.
 *
 * Visual matches the user-pasted reference (numbered circles + connecting
 * bars, blue-600 accent on complete/current, gray-800 surface). The site is
 * permanently dark so the `dark:` variants from the reference are folded
 * into the base classes. Step labels are kept on Trigger as `aria-label`
 * for accessibility — the reference UI deliberately shows numbers only.
 */
const STEPS = [
  "Download Forma",
  "Visit Chrome Extensions",
  "Enable Developer Mode",
  "Load unpacked Forma",
] as const;

export function InstallSteps() {
  return (
    <div className="flex w-full max-w-3xl items-center justify-center rounded-xl bg-gray-800 px-4 py-12">
      <Steps.Root count={STEPS.length} defaultStep={1} className="w-full max-w-2xl">
        <Steps.List className="flex items-center justify-between">
          {STEPS.map((label, index) => (
            <Steps.Item
              key={label}
              index={index}
              className="relative flex items-center not-last:flex-1"
            >
              <Steps.Trigger
                aria-label={label}
                className="flex items-center gap-3 rounded-md text-left"
              >
                <Steps.Indicator className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold data-[state=complete]:border-blue-600 data-[state=complete]:bg-blue-600 data-[state=complete]:text-white data-[state=current]:border-blue-600 data-[state=current]:bg-blue-600 data-[state=current]:text-white data-[state=incomplete]:border-gray-600 data-[state=incomplete]:bg-gray-700 data-[state=incomplete]:text-gray-300">
                  {index + 1}
                </Steps.Indicator>
              </Steps.Trigger>
              <Steps.Separator
                hidden={index === STEPS.length - 1}
                className="mx-3 h-0.5 flex-1 bg-gray-700 data-[state=complete]:bg-blue-600"
              />
            </Steps.Item>
          ))}
        </Steps.List>
      </Steps.Root>
    </div>
  );
}
