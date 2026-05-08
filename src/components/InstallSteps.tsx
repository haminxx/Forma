import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
  useState,
} from "react";
import { Download, ExternalLink, Lock } from "lucide-react";
import { HoverPeek } from "./HoverPeek";

type Step = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Fires when the user clicks anywhere in the step row (label or icon). */
  onAction?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  /**
   * If provided, hovering the step row pops the same Microlink-style
   * preview card as the LogoCloud cells, but driven by a local image
   * instead of a URL.
   */
  previewImage?: string;
  /** Multi-image preview — vertical stack inside the same hover card. */
  previewImages?: string[];
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
    previewImages: [
      "/preview/chrome-step-1-puzzle.png",
      "/preview/chrome-step-2-manage.png",
    ],
    onAction: () => {
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
 * the bar itself, and the step name below.
 *
 * Sequential gating:
 *   - Initially only step 1 is unlocked. Steps 2–4 are visually locked
 *     (lock icon next to the label, bar stays grey, button disabled).
 *   - Clicking an unlocked step fires its `onAction` and turns its bar
 *     gold. The next step is then unlocked.
 *   - The component tracks `clickedCount` — every step with index <
 *     clickedCount has been clicked (gold bar). Step at index ===
 *     clickedCount is the next unlocked step (grey bar). Anything past
 *     that is locked.
 */
export function InstallSteps() {
  const [clickedCount, setClickedCount] = useState(0);

  const handleClick = (
    index: number,
    step: Step,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    if (index > clickedCount) {
      event.preventDefault();
      return;
    }
    setClickedCount((prev) => Math.max(prev, index + 1));
    step.onAction?.(event);
  };

  return (
    <div className="w-full max-w-[min(98vw,88rem)] px-2 py-2 sm:px-4">
      <div
        className="rounded-2xl border border-white/18 p-4 sm:p-5"
        style={{
          background: "rgba(18, 19, 24, 0.82)",
          backdropFilter: "blur(20px) saturate(145%)",
          WebkitBackdropFilter: "blur(20px) saturate(145%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isClicked = index < clickedCount;
          const isUnlocked = index <= clickedCount;
          const isLocked = !isUnlocked;

          const bar = (
            <div
              className="h-[3px] w-full rounded-full transition-colors duration-300"
              style={{
                background: isClicked ? "#d4b87a" : "rgba(255, 255, 255, 0.15)",
              }}
            />
          );

          const labelRow = (
            <span
              className="flex items-center gap-1.5 text-xs font-medium tracking-wide transition-colors"
              style={{ color: isClicked ? "#ffffff" : isUnlocked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)" }}
            >
              {step.label}
              {Icon ? (
                <Icon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-colors"
                  strokeWidth={2}
                  style={{ color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)" }}
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
              className={`flex w-full flex-col items-start gap-2 rounded text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b87a]/60 ${
                isLocked
                  ? "cursor-not-allowed"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              {bar}
              {labelRow}
            </button>
          );

          // Preview hover card is only enabled once the step is unlocked,
          // so locked rows don't hint at content the user can't reach yet.
          const showPreview = isUnlocked;

          return (
            <li
              key={step.label}
              className="flex flex-col items-start gap-1.5"
            >
              <span
                className="text-[11px] font-semibold tracking-[0.18em] transition-colors"
                style={{
                  color: isClicked
                    ? "rgba(255,255,255,0.8)"
                    : isUnlocked
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(255,255,255,0.3)",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {showPreview && step.previewImages ? (
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
                  enableLensEffect={false}
                  peekWidth={260}
                  peekHeight={160}
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
    </div>
  );
}
