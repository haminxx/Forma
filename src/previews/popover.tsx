import { useState } from "react";

export default function PopoverPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-center h-full relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-100 text-sm"
      >
        {open ? "Hide popover" : "Show popover"}
      </button>
      {open && (
        <div
          className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[40px] min-w-[180px] rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-xl text-sm"
          role="dialog"
        >
          <div className="text-neutral-100 font-medium mb-1">Popover</div>
          <div className="text-neutral-400 text-xs">
            A floating contextual surface anchored to a trigger.
          </div>
        </div>
      )}
    </div>
  );
}
