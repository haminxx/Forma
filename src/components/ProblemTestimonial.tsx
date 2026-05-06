import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

/**
 * Problem-screen statement. Same Testimonial vocabulary the user pasted
 * (quote glyph + balanced quote + small attribution row), but now without
 * a card / panel chrome — the type sits directly on the page bg, much
 * larger, set in an SF-Pro-Display-leaning bold stack.
 */
type ProblemTestimonialProps = HTMLAttributes<HTMLDivElement> & {
  quote: string;
  highlightedText?: string;
  authorName: string;
  authorPosition: string;
};

const SF_DISPLAY_STACK =
  '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", system-ui, sans-serif';

export const ProblemTestimonial = forwardRef<HTMLDivElement, ProblemTestimonialProps>(
  (
    {
      className,
      quote,
      highlightedText,
      authorName,
      authorPosition,
      ...props
    },
    ref,
  ) => {
    const renderQuote = () => {
      if (!highlightedText || !quote.includes(highlightedText)) {
        return <>“{quote}”</>;
      }
      const parts = quote.split(highlightedText);
      return (
        <>
          “{parts[0]}
          <span className="text-[#d4b87a]">{highlightedText}</span>
          {parts.slice(1).join(highlightedText)}”
        </>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative isolate w-full max-w-5xl px-4 sm:px-6",
          className,
        )}
        {...props}
      >
        <QuoteGlyph
          aria-hidden="true"
          className="mb-6 h-10 w-10 text-white/85 sm:h-12 sm:w-12"
        />

        <p
          className="text-balance text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[5rem]"
          style={{
            fontFamily: SF_DISPLAY_STACK,
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          {renderQuote()}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-white/55">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-medium uppercase tracking-[0.18em] text-white/55"
          >
            {authorName
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </span>
          <span className="text-white/75">
            {authorName}
            <span className="text-white/35">, {authorPosition}</span>
          </span>
        </div>
      </div>
    );
  },
);

ProblemTestimonial.displayName = "ProblemTestimonial";

function QuoteGlyph(props: React.SVGProps<SVGSVGElement>) {
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
