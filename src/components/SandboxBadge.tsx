export function SandboxBadge() {
  return (
    <div
      className="relative rounded-full px-5 py-2"
      style={{
        height: "36px",
        background: `
          linear-gradient(135deg,
            #fcfcfd 0%,
            #f8f8fa 15%,
            #f3f4f6 30%,
            #eeeff2 45%,
            #e9eaed 60%,
            #e4e5e8 75%,
            #dee0e3 90%,
            #e2e3e6 100%
          )
        `,
        boxShadow: `
          0 2px 4px rgba(0, 0, 0, 0.10),
          0 10px 22px rgba(0, 0, 0, 0.12),
          0 22px 44px rgba(0, 0, 0, 0.10),
          inset 0 2px 1px rgba(255, 255, 255, 0.8),
          inset 0 -2px 6px rgba(0, 0, 0, 0.10),
          inset 2px 2px 8px rgba(0, 0, 0, 0.06),
          inset -2px 2px 8px rgba(0, 0, 0, 0.05)
        `,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* top ridge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 rounded-t-full"
        style={{
          height: "2px",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 10%, rgba(255,255,255,1) 25%, rgba(255,255,255,1) 75%, rgba(255,255,255,0.95) 90%, rgba(255,255,255,0) 100%)",
          filter: "blur(0.3px)",
        }}
      />
      {/* hemisphere highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 rounded-full"
        style={{
          height: "55%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.20) 35%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* bottom curvature */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-full"
        style={{
          height: "50%",
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.06) 35%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        className="relative z-10 flex h-full items-center justify-center"
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: "13.5px",
            fontWeight: 680,
            color: "#1a1a1a",
            letterSpacing: "0.45px",
            textShadow: `
              0 1px 0 rgba(0, 0, 0, 0.30),
              0 -1px 0 rgba(255, 255, 255, 0.8)
            `,
            whiteSpace: "nowrap",
          }}
        >
          Live · Sandbox
        </span>
      </div>
    </div>
  );
}

