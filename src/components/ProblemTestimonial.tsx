import type { HTMLAttributes, SVGProps } from "react";
import { forwardRef, useRef } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView } from "framer-motion";
import { cn } from "../lib/cn";
import { DotPattern } from "./ui/dot-pattern";
import { TextRotate, type TextRotateRef } from "./ui/text-rotate";

/**
 * Problem-screen statement with dot-pattern frame and rotating quote / attribution.
 */
type ProblemTestimonialProps = HTMLAttributes<HTMLDivElement> & {
  quotes: string[];
  attributions: string[];
};

const SF_DISPLAY_STACK =
  '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", system-ui, sans-serif';

const ROTATION_MS = 5000;

export const ProblemTestimonial = forwardRef<HTMLDivElement, ProblemTestimonialProps>(
  ({ className, quotes, attributions, ...props }, ref) => {
    const attributionRef = useRef<TextRotateRef>(null);
    // Track viewport entry so the testimonial "types" in on enter and
    // "untypes" out on exit. `amount: 0.4` means 40 % of the block must be
    // visible to be considered in view — keeps the toggle from flickering
    // at the edges of the section.
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(containerRef, { amount: 0.4 });

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

        <AnimatePresence mode="wait">
          {inView ? (
            <motion.div
              key="problem-typo"
              className="relative z-10"
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
          <QuoteGlyph
            aria-hidden="true"
            className="mb-6 h-10 w-10 text-white/85 sm:h-12 sm:w-12"
          />

          <LayoutGroup>
            <TextRotate
              texts={quotes}
              auto
              rotationInterval={ROTATION_MS}
              onNext={(index) => attributionRef.current?.jumpTo(index)}
              splitBy="words"
              staggerFrom="first"
              staggerDuration={0.01}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              animatePresenceMode="wait"
              mainClassName={cn(
                "text-balance text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[5rem]",
              )}
              style={{
                fontFamily: SF_DISPLAY_STACK,
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            />

            <motion.div
              layout
              className="my-8 h-2 w-2 rounded-full bg-[#ff5941] sm:h-3 sm:w-3"
              aria-hidden="true"
            />

            <TextRotate
              ref={attributionRef}
              texts={attributions}
              auto={false}
              splitBy="characters"
              staggerFrom="first"
              staggerDuration={0.025}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              animatePresenceMode="wait"
              mainClassName="text-sm text-white/75 sm:text-base"
            />
          </LayoutGroup>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
