import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

/**
 * Full-bleed dithering shader background for the Home section.
 * Derived from the CTASection snippet: transparent back, orange front, warp shape,
 * and speed ramps while hovering.
 */
export function DitheringBackground() {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);
    window.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-screen">
      <Dithering
        colorBack="#00000000"
        colorFront="#EC4E02"
        shape="warp"
        type="4x4"
        speed={isHovered ? 0.6 : 0.2}
        className="size-full"
        minPixelRatio={1}
      />
    </div>
  );
}

