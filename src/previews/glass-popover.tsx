import { useState } from "react";

export default function GlassPopoverPreview() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex items-center justify-center h-full relative bg-[linear-gradient(135deg,#4a3ec2,#9a2f7a,#ff8a3b)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white text-sm border border-white/20"
      >
        Toggle glass popover
      </button>
      {open && (
        <div
          className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[60px] min-w-[200px] rounded-2xl p-4 text-white shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px) saturate(1.5)",
            WebkitBackdropFilter: "blur(24px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div className="font-medium mb-1">Glassmorphic Popover</div>
          <div className="text-xs opacity-80">
            backdrop-filter: blur(24px) saturate(1.5)
          </div>
        </div>
      )}
    </div>
  );
}
