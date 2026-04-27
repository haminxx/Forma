import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface Props {
  asset: string | null;
}

/**
 * Loads a Lottie JSON from the bundled `assets/lottie/` tree, or falls
 * back to a WebM `<video>` if the asset name ends in `.webm`.
 *
 * When no asset is bundled (packs ship faster than we can hand-craft
 * animations), we render a soft animated gradient so the card still
 * feels alive.
 */
export function AnimationPreview({ asset }: Props) {
  const [lottie, setLottie] = useState<object | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLottie(null);
    setError(false);
    if (!asset) return;
    if (asset.endsWith(".webm")) return;

    const url = `/lottie/${asset}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`http ${r.status}`);
        return r.json();
      })
      .then((j) => setLottie(j))
      .catch(() => setError(true));
  }, [asset]);

  if (asset?.endsWith(".webm")) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        style={previewBoxStyle}
        src={`/webm/${asset}`}
      />
    );
  }

  if (lottie) {
    return (
      <div style={previewBoxStyle}>
        <Lottie animationData={lottie} loop style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }

  // Placeholder — animates a subtle diagonal sweep.
  return (
    <div style={{ ...previewBoxStyle, ...placeholderStyle }}>
      <span
        style={{
          fontSize: 11,
          opacity: 0.45,
          letterSpacing: 0.2,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {error ? "preview unavailable" : "preview"}
      </span>
    </div>
  );
}

const previewBoxStyle: React.CSSProperties = {
  width: "100%",
  height: 150,
  borderRadius: 10,
  overflow: "hidden",
  background: "rgba(0, 0, 0, 0.3)",
  margin: "10px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const placeholderStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(120,180,255,0.08) 0%, rgba(120,180,255,0.18) 50%, rgba(120,180,255,0.08) 100%)",
  backgroundSize: "200% 200%",
  animation: "lexis-pulse 3s ease-in-out infinite",
};
