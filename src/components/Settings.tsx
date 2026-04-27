import { useEffect, useState } from "react";
import {
  analyzeText,
  getProfile,
  listPacks,
  updateProfile,
} from "@/lib/ipc";
import type { PackSummary, Suggestion, UserProfile } from "@/lib/types";

export function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [tryText, setTryText] = useState(
    "add a blurry transparent box that shows options on hover",
  );
  const [tryResult, setTryResult] = useState<Suggestion[]>([]);

  useEffect(() => {
    getProfile().then(setProfile);
    listPacks().then(setPacks);
  }, []);

  async function save(p: UserProfile) {
    await updateProfile(p);
    setProfile(p);
  }

  async function runTry() {
    const r = await analyzeText(tryText);
    setTryResult(r);
  }

  if (!profile) {
    return <div className="p-8 text-white">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10 font-sans">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Lexis</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Prompt vocabulary assistant — settings &amp; dictionary packs.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">Try it</h2>
        <div className="flex gap-2">
          <input
            value={tryText}
            onChange={(e) => setTryText(e.target.value)}
            className="flex-1 bg-neutral-900 rounded-xl px-4 py-2 border border-neutral-800 outline-none focus:border-neutral-600"
          />
          <button
            onClick={runTry}
            className="rounded-xl px-4 py-2 bg-neutral-100 text-neutral-900 font-medium"
          >
            Analyze
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {tryResult.map((s) => (
            <li
              key={s.id}
              className="rounded-xl bg-neutral-900 border border-neutral-800 p-3"
            >
              <div className="text-xs uppercase tracking-wide text-neutral-400">
                {s.category} · {(s.confidence * 100).toFixed(0)}%
              </div>
              <div className="font-medium">{s.canonical}</div>
              <div className="text-sm text-neutral-400 mt-1">{s.definition}</div>
              <div className="text-xs text-neutral-500 mt-2">
                Replaces:{" "}
                <span className="font-mono line-through decoration-red-400/50">
                  {s.original_text}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                → <span className="font-mono">{s.replacement}</span>
              </div>
            </li>
          ))}
          {tryResult.length === 0 && (
            <li className="text-sm text-neutral-500">
              No suggestions yet. Try "blurry transparent box" or "menu that
              slides in from the right".
            </li>
          )}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">Installed packs</h2>
        <ul className="space-y-1 text-sm">
          {packs.map((p) => (
            <li
              key={p.id}
              className="flex justify-between border-b border-neutral-900 py-2"
            >
              <span>
                <span className="font-mono text-xs text-neutral-500 mr-2">
                  {p.id}
                </span>
                {p.name}
              </span>
              <span className="text-neutral-500">
                {p.term_count} terms · v{p.version}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field
            label="Frontend framework"
            value={profile.frameworks.frontend}
            onChange={(v) =>
              save({
                ...profile,
                frameworks: { ...profile.frameworks, frontend: v },
              })
            }
          />
          <Field
            label="Styling"
            value={profile.frameworks.styling}
            onChange={(v) =>
              save({
                ...profile,
                frameworks: { ...profile.frameworks, styling: v },
              })
            }
          />
          <Field
            label="Animation"
            value={profile.frameworks.animation}
            onChange={(v) =>
              save({
                ...profile,
                frameworks: { ...profile.frameworks, animation: v },
              })
            }
          />
          <Field
            label="Design system"
            value={profile.frameworks.design_system}
            onChange={(v) =>
              save({
                ...profile,
                frameworks: { ...profile.frameworks, design_system: v },
              })
            }
          />
          <label className="flex items-center gap-2 col-span-2 mt-2">
            <input
              type="checkbox"
              checked={profile.show_animations}
              onChange={(e) =>
                save({ ...profile, show_animations: e.target.checked })
              }
            />
            <span>Show micro-animations in the suggestion card</span>
          </label>
        </div>
      </section>

      <footer className="text-xs text-neutral-500">
        v0.1.0 · See <code className="font-mono">Idea.md</code> for the full
        product brief.
      </footer>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-800 outline-none focus:border-neutral-600"
      />
    </label>
  );
}
