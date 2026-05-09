import { useState } from "react";
import { Dithering } from "@paper-design/shaders-react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Forma home hero — full-bleed paper-shader Dithering canvas.
 *
 * Per latest direction:
 *   - Left text panel removed; the hero is now the shader on its own.
 *   - Theme toggle floats top-right of the section so users can still
 *     switch between dark (violet) and light (sky) tones.
 *   - Shape stays `dots` (the only valid `Dithering` value matching
 *     the user's "moving around dots" reference) but the speed is
 *     bumped to 0.5 so the dots visibly drift around instead of
 *     looking nearly static. Higher pxSize + smaller scale gives a
 *     denser, more particle-like feel.
 *   - The shader is mounted with `position: absolute inset-0` so it
 *     fills the home section without min-h-screen accounting for the
 *     navbar — Home.tsx pulls the section up under the navbar to
 *     close the prior top gap.
 */
export function PaperShaderHero() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colorBack = isDarkMode ? "hsl(0, 0%, 0%)" : "hsl(0, 0%, 95%)";
  const colorFront = isDarkMode
    ? "hsl(265, 90%, 70%)"
    : "hsl(220, 100%, 65%)";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Dithering
        style={{ height: "100%", width: "100%" }}
        colorBack={colorBack}
        colorFront={colorFront}
        shape="dots"
        type="random"
        pxSize={3}
        offsetX={0}
        offsetY={0}
        scale={0.9}
        rotation={0}
        speed={0.5}
      />

      {/* Theme toggle — pinned top-right inside the safe area below the
          fixed navbar (~88px) so it never collides with the PillNav. */}
      <button
        type="button"
        onClick={() => setIsDarkMode((v) => !v)}
        className={cn(
          "absolute right-6 top-24 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors md:right-10",
          isDarkMode
            ? "bg-white/10 text-white hover:bg-white/15"
            : "bg-black/10 text-black hover:bg-black/20",
        )}
        aria-label={
          isDarkMode ? "Switch to light theme" : "Switch to dark theme"
        }
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Soft bottom fade so the home → demo seam isn't a hard cut. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(25,26,31,0.85) 70%, rgba(25,26,31,1) 100%)",
        }}
      />
    </div>
  );
}
