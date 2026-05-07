import type { ComponentType, MouseEvent, SVGProps } from "react";
import { Steps } from "@ark-ui/react/steps";
import { Download, ExternalLink } from "lucide-react";
import { HoverPeek } from "./HoverPeek";

type Step = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Fires when the user clicks anywhere in the step row (label or icon). */
  onAction?: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  /**
   * If provided, hovering the step row pops the same Microlink-style
   * preview card as the LogoCloud cells, but driven by a local image
   * instead of a URL. The user supplies the file in /public/preview/…;
   * if it's missing, HoverPeek falls back to "Preview unavailable".
   */
  previewImage?: string;
};

const STEPS: Step[] = [
  {
    label: "Download Forma",
    icon: Download,
    ariaLabel: "Download Forma extension (coming soon)",
    onAction: (e) => {
      // Placeholder — the .crx / zip isn't shipped yet. Keep the row
      // clickable so the affordance is real, but no-op until then.
      e.preventDefault();
    },
  },
  {
    label: "Visit Chrome Extensions",
    icon: ExternalLink,
    ariaLabel: "Open chrome://extensions/ in a new tab",
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
  {
    label: "Enable Developer Mode",
    previewImage: "/preview/enable-developer-mode.png",
  },
  {
    label: "Load unpacked Forma",
    previewImage: "/preview/load-unpacked-forma.png",
  },
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
            const trigger = (
              <Steps.Trigger
                aria-label={step.ariaLabel ?? step.label}
                onClick={step.onAction}
                className="flex w-full flex-col items-start gap-2 rounded text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b87a]/60"
              >
                <div className="h-[3px] w-full rounded-full bg-white/15 transition-colors group-data-[state=complete]:bg-[#d4b87a] group-data-[state=current]:bg-[#d4b87a]" />
                <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/65 transition-colors group-data-[state=current]:text-white">
                  {step.label}
                  {Icon ? (
                    <Icon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-white/55 transition-colors group-hover:text-white"
                      strokeWidth={2}
                    />
                  ) : null}
                </span>
              </Steps.Trigger>
            );

            return (
              <Steps.Item
                key={step.label}
                index={index}
                className="group flex flex-col items-start gap-1.5"
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-white/40 group-data-[state=current]:text-white/80 group-data-[state=complete]:text-white/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step.previewImage ? (
                  <HoverPeek
                    isStatic
                    imageSrc={step.previewImage}
                    url={step.previewImage}
                    enableLensEffect={false}
                    peekWidth={260}
                    peekHeight={160}
                  >
                    {trigger}
                  </HoverPeek>
                ) : (
                  trigger
                )}
              </Steps.Item>
            );
          })}
        </Steps.List>
      </Steps.Root>
    </div>
  );
}
