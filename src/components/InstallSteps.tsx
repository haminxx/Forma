import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
  useState,
} from "react";
import { Download, ExternalLink, Lock } from "lucide-react";
import { HoverPeek } from "./HoverPeek";

/** Bundled ZIP from `/public`; served by Vite/Railway as a static asset. */
const FORMA_EXTENSION_ZIP = "/forma-extension.zip";

function downloadFormaExtension() {
  const a = document.createElement("a");
  a.href = FORMA_EXTENSION_ZIP;
  a.download = "forma-extension.zip";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

type Step = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Step 1 only: runs on first click (also advances progress). Steps 2+: optional follow-up click. */
  onAction?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  previewPlaceholder?: boolean;
  previewImage?: string;
  previewImages?: string[];
};

const STEPS: Step[] = [
  {
    label: "Download Forma",
    icon: Download,
    ariaLabel:
      "Download Forma Chrome extension as a ZIP (load unpacked after extracting)",
    onAction: downloadFormaExtension,
  },
  {
    label: "Visit Chrome Extensions",
    icon: ExternalLink,
    ariaLabel:
      "Copy chrome://extensions/ to clipboard and try to open Extensions",
    previewImage: "/preview/sandbox-step-2.png",
    onAction: () => {
      const url = "chrome://extensions/";
      try {
        navigator.clipboard?.writeText(url);
      } catch {
        // ignore
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },
  },
  {
    label: "Enable Developer Mode",
    previewImage: "/preview/sandbox-step-3.png",
  },
  {
    label: "Test Forma",
    previewImage: "/preview/sandbox-step-4.png",
  },
];

/**
 * Progress model:
 * - `progress` counts completed steps (gold bars). Range 0 … STEPS.length.
 * - Step 1 (index 0): **click** completes it and runs `onAction`.
 * - Steps 2–4 (index ≥ 1): hovering the unlocked row completes that step and unlocks the next.
 * - After a later step is hovered-done, users can still **click** rows with `onAction` (e.g. open Chrome)
 *   without advancing progress.
 */
export function InstallSteps() {
  const [progress, setProgress] = useState(0);

  const handlePointerEnterRow = (index: number) => {
    if (index < 1) return;
    setProgress((prev) => {
      if (prev !== index) return prev;
      return Math.min(STEPS.length, prev + 1);
    });
  };

  const handleClick = (
    index: number,
    step: Step,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    if (progress < index) {
      event.preventDefault();
      return;
    }

    if (index === 0) {
      if (progress === 0) setProgress(1);
      step.onAction?.(event);
      return;
    }

    /* Steps 2+: click only fires side effects once that step is complete (hover-first). */
    if (progress > index) step.onAction?.(event);
  };

  return (
    <div className="w-full max-w-[min(calc(100vw-3rem),96rem)] px-2 py-2 sm:px-4">
      <ol className="grid grid-cols-2 gap-x-4 gap-y-6 py-1 sm:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isPast = index < progress;
          const isUnlocked = index <= progress;
          const isLocked = progress < index;

          const bar = (
            <div
              className="h-[3px] w-full rounded-full transition-colors duration-300"
              style={{
                background: isPast ? "#d4b87a" : "rgba(255, 255, 255, 0.15)",
              }}
            />
          );

          const labelRow = (
            <span
              className="flex items-center gap-1.5 text-xs font-medium tracking-wide transition-colors"
              style={{
                color: isPast
                  ? "#ffffff"
                  : isUnlocked
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.35)",
              }}
            >
              {step.label}
              {Icon ? (
                <Icon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-colors"
                  strokeWidth={2}
                  style={{
                    color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)",
                  }}
                />
              ) : null}
              {isLocked ? (
                <Lock
                  aria-hidden="true"
                  className="h-3 w-3"
                  strokeWidth={2}
                  style={{ color: "rgba(255,255,255,0.4)" }}
                />
              ) : null}
            </span>
          );

          const trigger = (
            <button
              type="button"
              aria-label={step.ariaLabel ?? step.label}
              aria-disabled={isLocked}
              disabled={isLocked}
              onClick={(e) => handleClick(index, step, e)}
              className={`flex w-full flex-col items-start gap-2 rounded text-left transition-colors focus-visible:outline-none ${
                isLocked ? "cursor-not-allowed" : "hover:bg-white/[0.04]"
              }`}
            >
              {bar}
              {labelRow}
            </button>
          );

          const showPreview = isUnlocked;

          return (
            <li
              key={step.label}
              className="flex flex-col items-start gap-1.5"
              onPointerEnter={() => handlePointerEnterRow(index)}
            >
              <span
                className="text-[11px] font-semibold tracking-[0.18em] transition-colors"
                style={{
                  color: isPast
                    ? "rgba(255,255,255,0.8)"
                    : isUnlocked
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(255,255,255,0.3)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {showPreview && step.previewPlaceholder ? (
                <HoverPeek
                  isStatic
                  placeholder
                  url=""
                  preventPreviewNavigation
                  enableLensEffect
                  enableMouseFollow={false}
                  peekWidth={260}
                  peekHeight={160}
                >
                  {trigger}
                </HoverPeek>
              ) : showPreview && step.previewImages ? (
                <HoverPeek
                  isStatic
                  imageSrcs={step.previewImages}
                  url={step.previewImages[0] ?? ""}
                  enableLensEffect={false}
                  peekWidth={260}
                  peekHeight={220}
                >
                  {trigger}
                </HoverPeek>
              ) : showPreview && step.previewImage ? (
                <HoverPeek
                  isStatic
                  imageSrc={step.previewImage}
                  url={step.previewImage}
                  preventPreviewNavigation
                  enableLensEffect
                  enableMouseFollow={false}
                  peekWidth={300}
                  peekHeight={208}
                >
                  {trigger}
                </HoverPeek>
              ) : (
                trigger
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
