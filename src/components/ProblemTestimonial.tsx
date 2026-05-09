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

        {/* Depth / glow halo behind the quote — soft warm radial that
            adds vertical lift to the testimonial and matches the gold
            backdrop without competing with it. */}
        <motion.div
          aria-hidden
          key={`halo-${animKey}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={
            inView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.9 }
          }
          transition={{ duration: 0.9, ease: [0.22, 0.68, 0, 1] }}
          className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[60%]"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 50%, rgba(255,215,140,0.22) 0%, rgba(212,184,122,0.10) 35%, rgba(0,0,0,0) 70%)",
            filter: "blur(8px)",
          }}
        />

        <div key={animKey} className="relative z-10">
          <QuoteGlyph
            aria-hidden="true"
            className="mb-6 h-10 w-10 text-[#fff3cf] sm:h-12 sm:w-12"
            style={{
              filter:
                "drop-shadow(0 4px 18px rgba(0,0,0,0.45)) drop-shadow(0 0 12px rgba(212,184,122,0.35))",
            }}
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
                  // Layered text shadow: deep ambient drop + warm gold
                  // halo for richness on the gold backdrop.
                  textShadow:
                    "0 2px 30px rgba(0,0,0,0.55), 0 0 24px rgba(255,215,140,0.18)",
                }}
              />
            ) : null}

            <motion.div
              layout
              className="my-8 h-2 w-2 rounded-full bg-[#ff5941] sm:h-3 sm:w-3"
              style={{
                boxShadow:
                  "0 0 14px rgba(255,89,65,0.7), 0 4px 14px rgba(0,0,0,0.5)",
              }}
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
                transition={{
                  type: "spring",
                  damping: 28,
                  stiffness: 360,
                  delay: 0.25,
                }}
                animatePresenceMode="wait"
                animatePresenceInitial
                mainClassName="text-sm text-white/85 sm:text-base"
                style={{
                  textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                }}
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
