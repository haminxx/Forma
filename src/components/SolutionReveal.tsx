import { useEffect, useMemo, useRef, useState } from "react";

const SENTENCE =
  "Forma turns vague UI words into precise, generation-ready vocabulary.";

export function SolutionReveal() {
  const [active, setActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const words = useMemo(() => SENTENCE.split(" "), []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setActive(true);
      setUnderlineActive(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const lastDelayMs = (words.length - 1) * 60;
    const t = window.setTimeout(() => setUnderlineActive(true), lastDelayMs + 250);
    return () => window.clearTimeout(t);
  }, [active, words.length]);

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-4xl text-center">
      <p className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className={active ? "word-reveal inline-block" : "inline-block opacity-20"}
            style={
              active
                ? {
                    animationDelay: `${i * 60}ms`,
                  }
                : undefined
            }
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </p>

      <div className="mt-6 flex justify-center">
        <span className={underlineActive ? "forma-underline is-active" : "forma-underline"}>
          {" "}
        </span>
      </div>
    </div>
  );
}

