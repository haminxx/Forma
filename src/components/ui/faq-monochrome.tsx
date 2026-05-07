import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * FAQ panel adapted from the user-pasted "faq-monochrome" snippet, ported
 * to TS, with Forma-specific Q&A and a theme toggle that is scoped to
 * THIS section only (we don't mutate `document.documentElement` because
 * the rest of Forma is intentionally dark-only).
 */

const INTRO_STYLE_ID = "faq1-animations";

type FaqItem = {
  question: string;
  answer: string;
  meta: string;
};

const FAQS: FaqItem[] = [
  {
    question: "What is Forma exactly?",
    answer:
      "Forma is a real-time translation layer between human intent and the AI tools that build UI. It watches your prompts and silently suggests the precise vocabulary the model is actually waiting for — so a 'card' lands as the same card, every time.",
    meta: "Identity",
  },
  {
    question: "Who is Forma for?",
    answer:
      "Designers, engineers, and PMs shipping with vibe-coding platforms — v0, Lovable, Bolt, Cursor, Tempo, Magic Patterns, Builder.io, and friends — who feel that 'modal' or 'card' never lands the same way twice between prompt and prompt.",
    meta: "Audience",
  },
  {
    question: "How does Forma actually work?",
    answer:
      "A Chrome extension watches the prompt textbox of every supported AI design / IDE platform, detects vague UI vocabulary as you type, and inline-suggests the precise tokens drawn from the Forma vocabulary pack. One click expands the term into a generation-ready spec.",
    meta: "Mechanics",
  },
  {
    question: "What makes 'precise vocabulary' different from synonyms?",
    answer:
      "Each Forma token is mapped to a specific component shape, its expected props, and the design intent behind it. The model doesn't pick between five plausible 'cards' — it converges on the one you actually meant.",
    meta: "Method",
  },
  {
    question: "Who builds Forma?",
    answer:
      "A two-person team: Christian Lee (design) and Ryan Zhang (engineering). Forma is design-language research that ships — open, opinionated, and pointed at the precision frontier of generative UI.",
    meta: "Team",
  },
];

type ThemeKey = "dark" | "light";

type Palette = {
  surface: string;
  panel: string;
  border: string;
  heading: string;
  muted: string;
  iconRing: string;
  iconSurface: string;
  icon: string;
  toggle: string;
  toggleSurface: string;
  glow: string;
  aurora: string;
  shadow: string;
  overlay: string;
  introBackground: string;
  introBorder: string;
  introColor: string;
  introBlend: "screen" | "multiply";
};

const PALETTES: Record<ThemeKey, Palette> = {
  dark: {
    surface: "bg-neutral-950 text-neutral-100",
    panel: "bg-neutral-900/50",
    border: "border-white/10",
    heading: "text-white",
    muted: "text-neutral-400",
    iconRing: "border-white/20",
    iconSurface: "bg-white/5",
    icon: "text-white",
    toggle: "border-white/20 text-white",
    toggleSurface: "bg-white/10",
    glow: "rgba(255, 255, 255, 0.08)",
    aurora:
      "radial-gradient(ellipse 50% 100% at 10% 0%, rgba(226, 232, 240, 0.15), transparent 65%), #050507",
    shadow: "shadow-[0_36px_140px_-60px_rgba(10,10,10,0.95)]",
    overlay: "linear-gradient(130deg, rgba(255,255,255,0.04) 0%, transparent 65%)",
    introBackground: "rgba(12, 12, 12, 0.42)",
    introBorder: "rgba(255, 255, 255, 0.12)",
    introColor: "rgba(248, 250, 252, 0.92)",
    introBlend: "screen",
  },
  light: {
    surface: "bg-slate-100 text-neutral-900",
    panel: "bg-white/70",
    border: "border-neutral-200",
    heading: "text-neutral-900",
    muted: "text-neutral-600",
    iconRing: "border-neutral-300",
    iconSurface: "bg-neutral-900/5",
    icon: "text-neutral-900",
    toggle: "border-neutral-200 text-neutral-900",
    toggleSurface: "bg-white",
    glow: "rgba(15, 15, 15, 0.08)",
    aurora:
      "radial-gradient(ellipse 50% 100% at 10% 0%, rgba(15, 23, 42, 0.08), rgba(255, 255, 255, 0.95) 70%)",
    shadow: "shadow-[0_36px_120px_-70px_rgba(15,15,15,0.18)]",
    overlay: "linear-gradient(130deg, rgba(15,23,42,0.08) 0%, transparent 70%)",
    introBackground: "rgba(248, 250, 252, 0.88)",
    introBorder: "rgba(17, 17, 17, 0.12)",
    introColor: "rgba(15, 23, 42, 0.78)",
    introBlend: "multiply",
  },
};

const ANIMATION_CSS = `
  @keyframes faq1-fade-up {
    0% { transform: translate3d(0, 20px, 0); opacity: 0; filter: blur(6px); }
    60% { filter: blur(0); }
    100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
  }
  @keyframes faq1-beam-spin {
    0% { transform: rotate(0deg) scale(1); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes faq1-pulse {
    0% { transform: scale(0.7); opacity: 0.55; }
    60% { opacity: 0.1; }
    100% { transform: scale(1.25); opacity: 0; }
  }
  @keyframes faq1-meter {
    0%, 20% { transform: scaleX(0); transform-origin: left; }
    45%, 60% { transform: scaleX(1); transform-origin: left; }
    80%, 100% { transform: scaleX(0); transform-origin: right; }
  }
  @keyframes faq1-tick {
    0%, 30% { transform: translateX(-6px); opacity: 0.4; }
    50% { transform: translateX(2px); opacity: 1; }
    100% { transform: translateX(20px); opacity: 0; }
  }
  .faq1-intro {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.85rem 1.4rem;
    border-radius: 9999px;
    overflow: hidden;
    border: 1px solid var(--faq1-intro-border, rgba(255, 255, 255, 0.12));
    background: var(--faq1-intro-bg, rgba(12, 12, 12, 0.42));
    color: var(--faq1-intro-color, rgba(248, 250, 252, 0.92));
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.65rem;
    width: 100%;
    max-width: 24rem;
    margin: 0 auto;
    mix-blend-mode: var(--faq1-intro-blend, screen);
    opacity: 0;
    transform: translate3d(0, 12px, 0);
    filter: blur(8px);
    transition: opacity 720ms ease, transform 720ms ease, filter 720ms ease;
    isolation: isolate;
  }
  .faq1-intro--active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    filter: blur(0);
  }
  .faq1-intro__beam,
  .faq1-intro__pulse {
    position: absolute;
    inset: -110%;
    pointer-events: none;
    border-radius: 50%;
  }
  .faq1-intro__beam {
    background: conic-gradient(from 160deg, rgba(226, 232, 240, 0.25), transparent 32%, rgba(148, 163, 184, 0.22) 58%, transparent 78%, rgba(148, 163, 184, 0.18));
    animation: faq1-beam-spin 18s linear infinite;
    opacity: 0.55;
  }
  .faq1-intro--light .faq1-intro__beam {
    background: conic-gradient(from 180deg, rgba(15, 23, 42, 0.18), transparent 30%, rgba(71, 85, 105, 0.18) 58%, transparent 80%, rgba(15, 23, 42, 0.14));
  }
  .faq1-intro__pulse {
    border: 1px solid currentColor;
    opacity: 0.25;
    animation: faq1-pulse 3.4s ease-out infinite;
  }
  .faq1-intro__label {
    position: relative;
    z-index: 1;
    font-weight: 600;
    letter-spacing: 0.4em;
  }
  .faq1-intro__meter {
    position: relative;
    z-index: 1;
    flex: 1 1 auto;
    height: 1px;
    background: linear-gradient(90deg, transparent, currentColor 35%, transparent 85%);
    transform: scaleX(0);
    transform-origin: left;
    animation: faq1-meter 5.8s ease-in-out infinite;
    opacity: 0.7;
  }
  .faq1-intro__tick {
    position: relative;
    z-index: 1;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 9999px;
    background: currentColor;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
    animation: faq1-tick 3.2s ease-in-out infinite;
  }
  .faq1-intro--light .faq1-intro__tick {
    box-shadow: 0 0 0 4px rgba(15, 15, 15, 0.08);
  }
  .faq1-fade {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
    filter: blur(12px);
    transition: opacity 700ms ease, transform 700ms ease, filter 700ms ease;
  }
  .faq1-fade--ready {
    animation: faq1-fade-up 860ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
  }
`;

function FAQ1() {
  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [introReady, setIntroReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hasEntered, setHasEntered] = useState(false);

  // Inject the keyframes/CSS once.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(INTRO_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INTRO_STYLE_ID;
    style.innerHTML = ANIMATION_CSS;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) style.remove();
    };
  }, []);

  // Animate the eyebrow into view next frame.
  useEffect(() => {
    if (typeof window === "undefined") {
      setIntroReady(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => setIntroReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Trigger the section-level fade-up on first paint after load.
  useEffect(() => {
    if (typeof window === "undefined") {
      setHasEntered(true);
      return;
    }
    let timeout: number | undefined;
    const onLoad = () => {
      timeout = window.setTimeout(() => setHasEntered(true), 120);
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
    return () => {
      window.removeEventListener("load", onLoad);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, []);

  const palette = useMemo(() => PALETTES[theme], [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleQuestion = (index: number) =>
    setActiveIndex((prev) => (prev === index ? -1 : index));

  const setCardGlow = (event: ReactMouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--faq-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--faq-y", `${event.clientY - rect.top}px`);
  };

  const clearCardGlow = (event: ReactMouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    target.style.removeProperty("--faq-x");
    target.style.removeProperty("--faq-y");
  };

  const introVars: CSSProperties = {
    ["--faq1-intro-border" as string]: palette.introBorder,
    ["--faq1-intro-bg" as string]: palette.introBackground,
    ["--faq1-intro-color" as string]: palette.introColor,
    ["--faq1-intro-blend" as string]: palette.introBlend,
  };

  return (
    <div
      className={`relative w-full overflow-hidden transition-colors duration-700 ${palette.surface}`}
    >
      <div className="absolute inset-0 z-0" style={{ background: palette.aurora }} />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        style={{
          background: palette.overlay,
          mixBlendMode: theme === "dark" ? "screen" : "multiply",
        }}
      />

      <section
        className={`relative z-10 mx-auto flex max-w-4xl flex-col gap-12 px-6 py-24 lg:max-w-5xl lg:px-12 ${
          hasEntered ? "faq1-fade--ready" : "faq1-fade"
        }`}
      >
        <div
          className={`faq1-intro ${introReady ? "faq1-intro--active" : ""} ${
            theme === "light" ? "faq1-intro--light" : "faq1-intro--dark"
          }`}
          style={introVars}
        >
          <span className="faq1-intro__beam" aria-hidden="true" />
          <span className="faq1-intro__pulse" aria-hidden="true" />
          <span className="faq1-intro__label">About · Forma</span>
          <span className="faq1-intro__meter" aria-hidden="true" />
          <span className="faq1-intro__tick" aria-hidden="true" />
        </div>

        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className={`text-xs uppercase tracking-[0.35em] ${palette.muted}`}>
              Questions
            </p>
            <h2
              className={`text-4xl font-semibold leading-tight md:text-5xl ${palette.heading}`}
            >
              Design language research, shipped as a tool.
            </h2>
            <p className={`max-w-xl text-base ${palette.muted}`}>
              Forma is a translation layer between human intent and the AI
              tools that build UI. Below: the questions teams ask us most.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`relative inline-flex h-11 items-center gap-3 rounded-full border px-5 text-sm font-medium transition-colors duration-500 ${palette.toggleSurface} ${palette.toggle}`}
            aria-pressed={theme === "dark"}
          >
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span
                className={`pointer-events-none absolute inset-0 rounded-full border opacity-40 ${
                  theme === "dark"
                    ? "animate-pulse border-white/30"
                    : "border-neutral-400/50"
                }`}
              />
              <span
                className={`h-3 w-3 rounded-full transition-all duration-500 ${
                  theme === "dark" ? "bg-white" : "bg-neutral-900"
                }`}
              />
            </span>
            {theme === "dark" ? "Night" : "Day"} mode
          </button>
        </header>

        <ul className="space-y-4">
          {FAQS.map((item, index) => {
            const open = activeIndex === index;
            const panelId = `forma-faq-panel-${index}`;
            const buttonId = `forma-faq-trigger-${index}`;

            return (
              <li
                key={item.question}
                className={`group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 focus-within:-translate-y-0.5 ${palette.border} ${palette.panel} ${palette.shadow}`}
                onMouseMove={setCardGlow}
                onMouseLeave={clearCardGlow}
              >
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                    open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: `radial-gradient(240px circle at var(--faq-x, 50%) var(--faq-y, 50%), ${palette.glow}, transparent 70%)`,
                  }}
                />

                <button
                  type="button"
                  id={buttonId}
                  aria-controls={panelId}
                  aria-expanded={open}
                  onClick={() => toggleQuestion(index)}
                  style={{
                    ["--faq-outline" as string]:
                      theme === "dark"
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(17,17,17,0.25)",
                  } as CSSProperties}
                  className="relative flex w-full items-start gap-6 px-8 py-7 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--faq-outline)]"
                >
                  <span
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-105 ${palette.iconRing} ${palette.iconSurface}`}
                  >
                    <span
                      className={`pointer-events-none absolute inset-0 rounded-full border opacity-30 ${palette.iconRing} ${
                        open ? "animate-ping" : ""
                      }`}
                    />
                    <svg
                      className={`relative h-5 w-5 transition-transform duration-500 ${palette.icon} ${
                        open ? "rotate-45" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5v14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5 12h14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <h3
                        className={`text-lg font-medium leading-tight sm:text-xl ${palette.heading}`}
                      >
                        {item.question}
                      </h3>
                      <span
                        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.35em] transition-opacity duration-300 sm:ml-auto ${palette.border} ${palette.muted}`}
                      >
                        {item.meta}
                      </span>
                    </div>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`overflow-hidden text-sm leading-relaxed transition-[max-height] duration-500 ease-out ${
                        open ? "max-h-64" : "max-h-0"
                      } ${palette.muted}`}
                    >
                      <p className="pr-2">{item.answer}</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default FAQ1;
export { FAQ1 };
