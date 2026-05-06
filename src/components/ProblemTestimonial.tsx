import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

/**
 * Problem-screen card. Adopts the visual language of the user-pasted
 * Testimonial component (large quote mark + balanced quote + small
 * attribution row + tag pills) but rewritten for a Vite/React stack
 * (no `next/image`, no `next` imports) and pointed at Forma's "vibecoders
 * struggling with UI components" problem statement.
 *
 * Data is passed as props so the same card can host different copy in the
 * future without forking the component.
 */
type Tag = {
  label: string;
  icon?: React.ReactNode;
};

type ProblemTestimonialProps = HTMLAttributes<HTMLDivElement> & {
  quote: string;
  highlightedText?: string;
  authorName: string;
  authorPosition: string;
  authorImage?: string;
  tags?: Tag[];
};

export const ProblemTestimonial = forwardRef<HTMLDivElement, ProblemTestimonialProps>(
  (
    {
      className,
      quote,
      highlightedText,
      authorName,
      authorPosition,
      authorImage,
      tags = [],
      ...props
    },
    ref,
  ) => {
    // Render the quote with an optional run highlighted in white-bold while
    // the rest stays in foreground colour.
    const renderQuote = () => {
      if (!highlightedText || !quote.includes(highlightedText)) {
        return <>“{quote}”</>;
      }
      const parts = quote.split(highlightedText);
      return (
        <>
          “{parts[0]}
          <strong className="font-semibold text-white">{highlightedText}</strong>
          {parts.slice(1).join(highlightedText)}”
        </>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative isolate w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0c0c0c] px-8 py-12 shadow-[0_0_60px_-30px_rgba(212,184,122,0.25)] sm:px-12",
          className,
        )}
        {...props}
      >
        <QuoteGlyph
          aria-hidden="true"
          className="absolute left-6 top-6 h-7 w-7 text-white/85 sm:left-8 sm:top-8"
        />

        <p className="mt-2 text-balance text-2xl leading-snug text-white sm:text-[1.75rem] sm:leading-[1.25]">
          {renderQuote()}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-white/55">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              loading="lazy"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-medium uppercase tracking-[0.18em] text-white/55"
            >
              {authorName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
          )}

          <span className="text-white/75">
            {authorName}
            <span className="text-white/35">, {authorPosition}</span>
          </span>

          {tags.length > 0 ? <span className="text-white/25">·</span> : null}

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80"
              >
                {tag.icon}
                {tag.label}
              </span>
            ))}
          </div>
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
