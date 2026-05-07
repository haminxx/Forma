import type { HTMLAttributes, SVGProps } from "react";
import { forwardRef, useRef } from "react";
import { LayoutGroup, motion, useInView } from "framer-motion";
import { cn } from "../lib/cn";
import { DotPattern } from "./ui/dot-pattern";
import { TextRotate } from "./ui/text-rotate";

/**
 * Problem-screen statement with dot-pattern frame and a single quote +
 * attribution. Per spec:
 *   - On first scroll-into-view, the per-character stagger animation
 *     plays once.
 *   - No outer fade-in / blur entry on the wrapper itself.
 *   - No auto-rotation through quotes.
 *   - When the user scrolls out and back in, the in-view key changes so
 *     the stagger replays from its initial state ("animation reverts").
 */
type ProblemTestimonialProps = HTMLAttributes<HTMLDivElement> & {
  quotes: string[];
  attributions: string[];
};

const SF_DISPLAY_STACK =
  '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", system-ui, sans-serif';

export const ProblemTestimonial = forwardRef<HTMLDivElement, ProblemTestimonialProps>(
  ({ className, quotes, attributions, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(containerRef, { amount: 0.4 });

    const quote = quotes[0] ?? "";
    const attribution = attributions[0] ?? "";

    // Toggling `inView` forces a remount of the inner animated block so
    // the per-character stagger replays from initial each time the user
    // re-enters the section.
    const animKey = inView ? "in" : "out";

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
        }}
        className={cn("relative isolate w-full max-w-5xl px-4 sm:px-6", className)}
        {...props}
      >
        <DotPattern className="fill-white/15 md:fill-white/20" />

        <div key={animKey} className="relative z-10">
          <QuoteGlyph
            aria-hidden="true"
            className="mb-6 h-10 w-10 text-white/85 sm:h-12 sm:w-12"
          />

          <LayoutGroup>
            {inView ? (
              <TextRotate
                texts={[quote]}
                auto={false}
                splitBy="words"
                staggerFrom="first"
                staggerDuration={0.04}
                initial={{ y: "60%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                animatePresenceMode="wait"
                animatePresenceInitial
                mainClassName="text-balance text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[5rem]"
                style={{
                  fontFamily: SF_DISPLAY_STACK,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              />
            ) : null}

            <motion.div
              layout
              className="my-8 h-2 w-2 rounded-full bg-[#ff5941] sm:h-3 sm:w-3"
              aria-hidden="true"
            />

            {inView ? (
              <TextRotate
                texts={[attribution]}
                auto={false}
                splitBy="characters"
                staggerFrom="first"
                staggerDuration={0.018}
                initial={{ y: "60%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 360, delay: 0.25 }}
                animatePresenceMode="wait"
                animatePresenceInitial
                mainClassName="text-sm text-white/75 sm:text-base"
              />
            ) : null}
          </LayoutGroup>
        </div>
      </div>
    );
  },
);

ProblemTestimonial.displayName = "ProblemTestimonial";

function QuoteGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M9.5 22H5l3-9h-3v-3h7l-2.5 12Zm12.5 0h-4.5l3-9h-3v-3h7l-2.5 12Z" />
    </svg>
  );
}
