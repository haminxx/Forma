import { DitheringShader } from "./ui/dithering-shader";

/**
 * Full-bleed gold wave via WebGL dithering shader (fine pxSize vs legacy canvas blocks).
 */
export function PixelWave() {
  return (
    <DitheringShader
      fullBleed
      shape="wave"
      type="8x8"
      colorBack="#00000000"
      colorFront="#d4b87a"
      pxSize={2}
      speed={0.6}
      className="pointer-events-none absolute inset-0 h-full w-full min-h-0"
    />
  );
}
