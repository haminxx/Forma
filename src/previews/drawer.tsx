import { useState } from "react";

export default function DrawerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative h-full bg-neutral-900 overflow-hidden">
      <div className="p-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-100 text-sm"
        >
          {open ? "Close drawer" : "Open drawer"}
        </button>
        <p className="mt-4 text-neutral-400 text-xs max-w-xs">
          Off-canvas drawers slide in from an edge of the viewport, overlaying
          the main content.
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 220,
          background: "rgba(30,30,40,0.92)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 240ms cubic-bezier(0.16, 1, 0.3, 1)",
          padding: 16,
        }}
      >
        <h4 className="text-neutral-100 font-medium">Menu</h4>
        <ul className="mt-3 space-y-2 text-sm text-neutral-300">
          <li>Home</li>
          <li>Profile</li>
          <li>Settings</li>
          <li>Sign out</li>
        </ul>
      </div>
    </div>
  );
}
