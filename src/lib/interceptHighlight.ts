/**
 * Multi-term sandbox vocabulary + segment builder for /detector.
 *
 * Highlights are rendered in a mirror layer stacked above a real <textarea>
 * (transparent text / visible caret); idle spans use pointer-events so hover
 * and tooltip work without blocking typing in gaps.
 */
export type Resolution = "idle" | "skipped" | "accepted";

export type TermDefinition = {
  id: string;
  needle: string;
  replacement: string;
  professionalTerm: string;
  category: string;
  definition: string;
  alternatives: readonly [string, string, string];
};

export const VAGUE_TERM_DEFS: TermDefinition[] = [
  {
    id: "popover",
    needle: "popover",
    replacement: "Glassmorphic Modal",
    professionalTerm: "Glassmorphic Modal",
    category: "UI Component",
    definition: "A floating window with a blurred background.",
    alternatives: ["Drawer", "Dialog", "Toast"],
  },
  {
    id: "dropdown",
    needle: "dropdown",
    replacement: "Select Menu",
    professionalTerm: "Select Menu",
    category: "Input Control",
    definition: "A list revealed on tap or click for picking one option.",
    alternatives: ["Combobox", "Picker", "Popover menu"],
  },
  {
    id: "modal",
    needle: "modal",
    replacement: "Sheet Panel",
    professionalTerm: "Sheet Panel",
    category: "Overlay",
    definition: "A layer that captures focus until dismissed.",
    alternatives: ["Drawer", "Dialog", "Lightbox"],
  },
];

export const INITIAL_PROMPT =
  "I want to build a popover menu with a dropdown and a modal overlay.";

export function initialTermStates(): Record<string, Resolution> {
  return Object.fromEntries(VAGUE_TERM_DEFS.map((d) => [d.id, "idle" as Resolution]));
}

export type Segment =
  | { kind: "text"; value: string }
  | {
      kind: "term";
      termId: string;
      value: string;
      underline: boolean;
      /** Inclusive byte offsets in `text` for textarea selection + hit targets */
      start: number;
      end: number;
    };

function findNextMatch(
  text: string,
  from: number,
  termStates: Record<string, Resolution>,
): { index: number; def: TermDefinition } | null {
  let best: { index: number; def: TermDefinition } | null = null;

  for (const def of VAGUE_TERM_DEFS) {
    if (termStates[def.id] === "accepted") continue;
    const idx = text.indexOf(def.needle, from);
    if (idx === -1) continue;

    if (
      !best ||
      idx < best.index ||
      (idx === best.index && def.needle.length > best.def.needle.length)
    ) {
      best = { index: idx, def };
    }
  }

  return best;
}

export function buildSegments(
  text: string,
  termStates: Record<string, Resolution>,
): Segment[] {
  const segments: Segment[] = [];
  let offset = 0;

  while (offset < text.length) {
    const match = findNextMatch(text, offset, termStates);
    if (!match) {
      segments.push({ kind: "text", value: text.slice(offset) });
      break;
    }

    if (match.index > offset) {
      segments.push({ kind: "text", value: text.slice(offset, match.index) });
    }

    const { def, index } = match;
    const end = index + def.needle.length;
    const underline = termStates[def.id] === "idle";

    segments.push({
      kind: "term",
      termId: def.id,
      value: text.slice(index, end),
      underline,
      start: index,
      end,
    });

    offset = end;
  }

  return segments.length > 0 ? segments : [{ kind: "text", value: "" }];
}

export function replaceAllOccurrences(text: string, needle: string, replacement: string): string {
  if (!needle) return text;
  return text.split(needle).join(replacement);
}

export function termDefinition(id: string): TermDefinition | undefined {
  return VAGUE_TERM_DEFS.find((d) => d.id === id);
}
