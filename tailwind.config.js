/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        lexis: {
          bg: "rgba(20, 20, 30, 0.72)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#e8e8ec",
          accent: "rgba(120, 180, 255, 0.85)",
          component: "#f5b042",
          pattern: "#42d4f5",
          style: "#a142f5",
          motion: "#42f58d",
        },
      },
      backdropBlur: {
        glass: "24px",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "lexis-pulse": "lexis-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "lexis-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.15)" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
