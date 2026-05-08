import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/cn";

/**
 * Streamlined adaptation of the user-pasted `feature-showcase`
 * snippet.
 *
 * The reference implementation pulled in the full shadcn/ui radix
 * tree (Tabs / Accordion / Card / Button / Badge) plus `next/link`,
 * which Forma's Vite project has no use for. This rewrite keeps the
 * exact visual layout (left column: badge → headline → blurb → chips
 * → accordion → CTAs; right column: image panel with bottom-pinned
 * tab pills) but drives the tabs and accordion entirely from local
 * `useState`.
 *
 * Benefits:
 *   - Zero new npm dependencies.
 *   - Accordion height transitions via the
 *     `grid-rows-[0fr] → grid-rows-[1fr]` trick — no JS height
 *     measurement, no `tw-animate-css`.
 *   - Theme adapted to Forma's dark surface + gold accent.
 */

export type TabMedia = {
  /** Unique identifier for the tab. */
  value: string;
  label: string;
  /** Image URL displayed when this tab is active. */
  src: string;
  alt?: string;
};

export type ShowcaseStep = {
  id: string;
  title: string;
  text: string;
};

export type FeatureShowcaseProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Small chips rendered under the description. */
  stats?: string[];
  /** Accordion entries on the left column. */
  steps?: ShowcaseStep[];
  /** Image tabs on the right column. */
  tabs: TabMedia[];
  /** Initially-active tab value. Defaults to the first tab. */
  defaultTab?: string;
  /** Pixel height of the right-column panel. */
  panelMinHeight?: number;
  /** Optional href for the primary CTA. */
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  /** Optional href for the secondary CTA. */
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
  className?: string;
};

const DEFAULT_STEPS: ShowcaseStep[] = [
  {
    id: "step-1",
    title: "Drop a reference",
    text:
      "Upload a single image. We read it like a brief and extract palette, texture and cues.",
  },
  {
    id: "step-2",
    title: "Pick the vibe",
    text:
      "Switch between mockup, screen, or abstract views and tune the mood instantly.",
  },
  {
    id: "step-3",
    title: "Export & share",
    text:
      "Get a moodboard ready for your team with consistent visuals and notes.",
  },
];

export function FeatureShowcase({
  eyebrow = "Discover",
  title,
  description,
  stats = [],
  steps = DEFAULT_STEPS,
  tabs,
  defaultTab,
  panelMinHeight = 480,
  primaryCtaHref = "#sandbox",
  primaryCtaLabel = "Get started",
  secondaryCtaHref = "#demo",
  secondaryCtaLabel = "Browse examples",
  className,
}: FeatureShowcaseProps) {
  const initialTab = defaultTab ?? tabs[0]?.value ?? "tab-0";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openStep, setOpenStep] = useState<string | null>(steps[0]?.id ?? null);

  return (
    <section
      className={cn("w-full text-white", className)}
      aria-label={typeof title === "string" ? title : undefined}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-12 md:py-16 lg:gap-14">
        {/* ── Left column ──────────────────────────────────────── */}
        <div className="md:col-span-6">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/65">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4b87a]" />
            {eyebrow}
          </span>

          <h2 className="text-balance text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h2>

          {description ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
              {description}
            </p>
          ) : null}

          {stats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {stats.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/70"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 max-w-xl">
            {steps.map((step) => {
              const isOpen = openStep === step.id;
              return (
                <div key={step.id} className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => setOpenStep(isOpen ? null : step.id)}
                    aria-expanded={isOpen}
                    aria-controls={`step-content-${step.id}`}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left text-base font-medium text-white transition-colors hover:text-[#e7cf95]"
                  >
                    <span>{step.title}</span>
                    <ChevronDown
                      size={16}
                      strokeWidth={2}
                      className={cn(
                        "shrink-0 text-white/55 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`step-content-${step.id}`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-4 pr-2 text-sm leading-relaxed text-white/60">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={primaryCtaHref}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#d4b87a] px-6 text-sm font-semibold text-[#191a1f] shadow-sm transition-colors hover:bg-[#e2c890]"
              >
                {primaryCtaLabel}
              </a>
              <a
                href={secondaryCtaHref}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-transparent px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
              >
                {secondaryCtaLabel}
              </a>
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────── */}
        <div className="md:col-span-6">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm"
            style={{ height: panelMinHeight, minHeight: panelMinHeight }}
          >
            <div className="relative h-full w-full">
              {tabs.map((t, idx) => (
                <div
                  key={t.value}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    activeTab === t.value
                      ? "opacity-100"
                      : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={activeTab !== t.value}
                >
                  <img
                    src={t.src}
                    alt={t.alt ?? t.label}
                    className="h-full w-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              ))}
              {/* Bottom legibility gradient — keeps the tab pills
                  readable on top of bright photos. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(20,20,24,0) 0%, rgba(20,20,24,0.7) 100%)",
                }}
              />
            </div>

            <div className="pointer-events-auto absolute inset-x-0 bottom-4 z-10 flex w-full justify-center px-4">
              <div
                role="tablist"
                aria-label="Showcase tabs"
                className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/15 bg-black/45 p-1 backdrop-blur-md"
              >
                {tabs.map((t) => {
                  const isActive = activeTab === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(t.value)}
                      className={cn(
                        "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#d4b87a] text-[#191a1f]"
                          : "text-white/70 hover:text-white",
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
