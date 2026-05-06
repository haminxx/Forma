import type { ComponentType, MouseEvent, SVGProps } from "react";
import { Steps } from "@ark-ui/react/steps";
import { Download, ExternalLink } from "lucide-react";

type Step = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  onAction?: (e: MouseEvent<HTMLButtonElement>) => void;
  iconLabel?: string;
};

const STEPS: Step[] = [
  {
    label: "Download Forma",
    icon: Download,
    iconLabel: "Download Forma extension (coming soon)",
    onAction: (e) => {
      // Placeholder — the .crx / zip isn't shipped yet. Keep the button
      // clickable so the affordance is real, but no-op until then.
      e.preventDefault();
    },
  },
  {
    label: "Visit Chrome Extensions",
    icon: ExternalLink,
    iconLabel: "Open chrome://extensions/ in a new tab",
    onAction: () => {
      // Chrome blocks direct `chrome://` navigation from a regular link, so
      // we hand the user the URL via the clipboard and open a tab they can
      // paste into. Most modern browsers honour `window.open` for chrome://
      // when invoked from a user gesture; if blocked we still copy.
      const url = "chrome://extensions/";
      try {
        navigator.clipboard?.writeText(url);
      } catch {
        // ignore — fall through to window.open
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },
  },
  { label: "Enable Developer Mode" },
  { label: "Load unpacked Forma" },
];

/**
 * Forma install path: a numeric label sits above each progress bar (1-4),
 * the bar itself, and the step name below. The Download and Visit steps
 * carry small icon buttons next to their label — Download is a placeholder
 * (no file yet), Visit copies and tries to open `chrome://extensions/`.
 *
 * Ark UI Steps.Item supplies the `data-state` attribute that paints the
 * bar gold when the step is current/complete.
 */
export function InstallSteps() {
  return (
    <div className="w-full max-w-3xl px-4 py-2">
      <Steps.Root count={STEPS.length} defaultStep={1} className="w-full">
        <Steps.List className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Steps.Item
                key={step.label}
                index={index}
                className="group flex flex-col items-start gap-1.5"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-white/40 group-data-[state=current]:text-white/80 group-data-[state=complete]:text-white/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Steps.Trigger
                  aria-label={step.label}
                  className="flex w-full flex-col items-start gap-2 text-left"
                >
                  <div className="h-[3px] w-full rounded-full bg-white/15 transition-colors group-data-[state=complete]:bg-[#d4b87a] group-data-[state=current]:bg-[#d4b87a]" />
                  <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/65 transition-colors group-data-[state=current]:text-white">
                    {step.label}
                    {Icon ? (
                      <button
                        type="button"
                        aria-label={step.iconLabel ?? step.label}
                        onClick={step.onAction}
                        className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    ) : null}
                  </span>
                </Steps.Trigger>
              </Steps.Item>
            );
          })}
        </Steps.List>
      </Steps.Root>
    </div>
  );
}
