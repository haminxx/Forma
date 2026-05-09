import { useState } from "react";
import { Code2, Sparkles, Users, type LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

/**
 * Problem-screen statement.
 *
 * Layout pattern (clickable persona pickers + sliding-blur quote +
 * active author info row) is a common testimonial-component layout —
 * uncopyrightable as an idea, implemented here from scratch with
 * Forma-original Tailwind classes, lucide icons in place of avatar
 * photos, and quotes paraphrased from Forma's own README problem
 * section. The personas are composite illustrative roles (the vibe-
 * coder / team lead / researcher), NOT real customer testimonials.
 *
 * Per latest direction the quote text is BIG + BOLD (was font-black
 * sf-display in the previous TextRotate variant); each persona icon
 * swaps the visible quote on click with a fade + blur transition.
 */

type Persona = {
  id: string;
  quote: string;
  name: string;
  role: string;
  Icon: LucideIcon;
  /** Hex used for the persona's icon tint + active-ring glow. */
  accent: string;
};

// Quotes deliberately balanced to similar lengths (~190 chars each)
// so the 3-state quote stack lands in the same vertical footprint
// regardless of which persona is active — guarantees the text
// always sits cleanly above the icon row, never overlapping it.
const PERSONAS: Persona[] = [
  {
    id: "vibe",
    quote:
      "I keep typing 'popup that slides in' and getting six different flavours of generic component back. The model isn't broken — my prompt is, and I have no shared vocabulary with the AI.",
    name: "The Vibe-Coder",
    role: "Solo builder · ships from v0 daily",
    Icon: Code2,
    accent: "#d4b87a",
  },
  {
    id: "team",
    quote:
      "Every team has a 'modal' that's actually a sheet, a dialog, and a popover all wearing the same name. Naming collisions ship to production and we burn hours redoing the same component.",
    name: "The Team Lead",
    role: "8-person product team · multiple builders",
    Icon: Users,
    accent: "#ff9c5a",
  },
  {
    id: "researcher",
    quote:
      "Builders got dramatically better at generation. The bottleneck moved upstream — to the vocabulary of the prompt itself. Precision in equals precision out; vague phrases ship vague components.",
    name: "The Researcher",
    role: "Studied AI-builder workflows",
    Icon: Sparkles,
    accent: "#b58bff",
  },
];

export function ProblemTestimonial() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 py-16">
      {/* Soft warm halo behind the quote — adds vertical lift on the
          gold backdrop without competing with the text itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[60%]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(255,215,140,0.20) 0%, rgba(212,184,122,0.10) 35%, rgba(0,0,0,0) 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Quote — single absolute-positioned stack, only the active
          quote is opaque + un-blurred. Big bold display type.
          min-h is sized for the LONGEST persona quote at desktop
          font-size so the text always sits cleanly above the icon
          row, never visually colliding with it. */}
      <div className="relative mb-14 min-h-[420px] sm:min-h-[340px] md:min-h-[320px] lg:min-h-[300px]">
        {PERSONAS.map((p, i) => (
          <p
            key={p.id}
            aria-hidden={active !== i}
            className={cn(
              "absolute inset-0 text-balance text-2xl font-bold leading-[1.2] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem]",
              "transition-all duration-500 ease-out",
              active === i
                ? "translate-y-0 opacity-100 blur-0"
                : "pointer-events-none translate-y-4 opacity-0 blur-md",
            )}
            style={{
              textShadow:
                "0 2px 28px rgba(0,0,0,0.55), 0 0 24px rgba(255,215,140,0.18)",
            }}
          >
            <span
              aria-hidden
              className="mr-1 inline-block align-top text-[#fff3cf]/85"
              style={{ fontFamily: "Georgia, serif" }}
            >
              “
            </span>
            {p.quote}
            <span
              aria-hidden
              className="ml-1 inline-block align-top text-[#fff3cf]/85"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ”
            </span>
          </p>
        ))}
      </div>

      {/* Author row: persona pickers + divider + active author info */}
      <div className="flex items-center gap-6">
        {/* Persona picker pills — clickable icon-circles. Active one
            scales up + glows with the persona's accent. */}
        <div className="flex -space-x-2">
          {PERSONAS.map((p, i) => {
            const Icon = p.Icon;
            const isActive = active === i;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                aria-label={`Show quote from ${p.name}`}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full border-2 ring-2 ring-black/40 backdrop-blur-md transition-all duration-300",
                  isActive
                    ? "z-10 scale-110"
                    : "scale-100 grayscale hover:scale-105 hover:grayscale-0",
                )}
                style={{
                  borderColor: isActive ? p.accent : "rgba(255,255,255,0.20)",
                  background: isActive
                    ? `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))`
                    : "rgba(20,20,24,0.65)",
                  color: isActive ? p.accent : "rgba(255,255,255,0.55)",
                  boxShadow: isActive
                    ? `0 0 26px -4px ${p.accent}aa, inset 0 1px 0 rgba(255,255,255,0.10)`
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/15" />

        {/* Active author info — same absolute-stack swap pattern. */}
        <div className="relative min-h-[44px] flex-1">
          {PERSONAS.map((p, i) => (
            <div
              key={p.id}
              aria-hidden={active !== i}
              className={cn(
                "absolute inset-0 flex flex-col justify-center",
                "transition-all duration-400 ease-out",
                active === i
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none -translate-x-2 opacity-0",
              )}
            >
              <span
                className="text-base font-semibold text-white"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
              >
                {p.name}
              </span>
              <span className="text-xs text-white/65 sm:text-sm">
                {p.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tiny disclosure — keeps it honest that the personas are
          illustrative composites, not real customer testimonials. */}
      <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Composite personas · quotes paraphrased from the Forma README
      </p>
    </div>
  );
}

ProblemTestimonial.displayName = "ProblemTestimonial";
