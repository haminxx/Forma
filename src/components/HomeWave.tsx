/**
 * Decorative SVG wave that occupies the bottom ~50% of the home section.
 * Sits behind the foreground content and above the dot canvas (the canvas
 * uses mix-blend-mode: difference so a soft wave wash beneath it produces
 * a subtle colour shift in that band — visual anchor without being noisy).
 */
export function HomeWave() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full"
      viewBox="0 0 1440 480"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="forma-wave-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212, 184, 122, 0.04)" />
          <stop offset="100%" stopColor="rgba(212, 184, 122, 0.16)" />
        </linearGradient>
        <linearGradient id="forma-wave-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(212, 184, 122, 0)" />
          <stop offset="50%" stopColor="rgba(212, 184, 122, 0.55)" />
          <stop offset="100%" stopColor="rgba(212, 184, 122, 0)" />
        </linearGradient>
      </defs>

      {/* Filled wave region. */}
      <path
        d="M0,180 C280,260 560,80 800,140 C1040,200 1240,300 1440,180 L1440,480 L0,480 Z"
        fill="url(#forma-wave-fill)"
      />

      {/* Wave crest line, slightly above the fill for definition. */}
      <path
        d="M0,180 C280,260 560,80 800,140 C1040,200 1240,300 1440,180"
        fill="none"
        stroke="url(#forma-wave-stroke)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
