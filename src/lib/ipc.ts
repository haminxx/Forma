import type { UnlistenFn } from "@tauri-apps/api/event";
import type { PackSummary, Rect, Suggestion, UserProfile } from "./types";
import { installRectReporter, useLexisStore } from "./store";
import { isTauri } from "./env";
import {
  demoAnalyze,
  demoPacks,
  demoProfile,
  demoSuggestions,
} from "./demo";

/**
 * In Tauri, dynamic imports below pull in the real `@tauri-apps/api`
 * surface. In the browser/web demo we never reach those imports — every
 * exported function short-circuits to mock data so the static build
 * works without the Rust backend.
 */

async function tauriInvoke<T>(cmd: string, args?: unknown): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args as Record<string, unknown> | undefined);
}

async function tauriListen<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<UnlistenFn> {
  const { listen } = await import("@tauri-apps/api/event");
  return listen<T>(event, (e) => handler(e.payload));
}

/** Subscribe to the Rust events that drive the overlay state. */
export function bindIpc(): () => void {
  if (!isTauri) {
    return bindDemo();
  }

  installRectReporter(reportUiRects);
  const unlistens: Promise<UnlistenFn>[] = [];

  unlistens.push(
    tauriListen<Suggestion[]>("lexis://suggestions", (payload) => {
      useLexisStore.getState().receiveSuggestions(payload ?? []);
    }),
  );
  unlistens.push(
    tauriListen<void>("lexis://suggestions-cleared", () => {
      useLexisStore.getState().clear();
    }),
  );

  return () => {
    unlistens.forEach((p) => p.then((off) => off()).catch(() => {}));
  };
}

/**
 * Web/Vercel fallback: drop a sample suggestion into the store after a
 * short delay so the overlay actually appears. We swallow the rect
 * reporter (no Rust to inform).
 */
function bindDemo(): () => void {
  installRectReporter(() => {});
  const handle = window.setTimeout(() => {
    useLexisStore.getState().receiveSuggestions(demoSuggestions());
  }, 600);
  return () => window.clearTimeout(handle);
}

// ---- Wrapped commands ------------------------------------------------------

export async function acceptSuggestion(s: Suggestion): Promise<void> {
  if (!isTauri) {
    console.info("[demo] acceptSuggestion", s.canonical);
    return;
  }
  await tauriInvoke<void>("accept_suggestion", { req: { suggestion: s } });
}

export async function dismissSuggestion(
  termId: string,
  originalText: string,
  reason?: string,
): Promise<void> {
  if (!isTauri) {
    console.info("[demo] dismissSuggestion", termId, reason);
    return;
  }
  await tauriInvoke<void>("dismiss_suggestion", {
    req: { term_id: termId, original_text: originalText, reason: reason ?? null },
  });
}

export async function analyzeText(text: string): Promise<Suggestion[]> {
  if (!isTauri) {
    return demoAnalyze(text);
  }
  return tauriInvoke<Suggestion[]>("analyze_text", { req: { text } });
}

export async function setClickThrough(enable: boolean): Promise<void> {
  if (!isTauri) return;
  await tauriInvoke<void>("set_click_through", { req: { enable } });
}

export async function reportUiRects(rects: Rect[]): Promise<void> {
  if (!isTauri) return;
  await tauriInvoke<void>("report_ui_rects", { req: { rects } });
}

export async function getProfile(): Promise<UserProfile> {
  if (!isTauri) return demoProfile;
  return tauriInvoke<UserProfile>("get_profile");
}

export async function updateProfile(profile: UserProfile): Promise<void> {
  if (!isTauri) {
    console.info("[demo] updateProfile (no-op)");
    return;
  }
  await tauriInvoke<void>("update_profile", { profile });
}

export async function listPacks(): Promise<PackSummary[]> {
  if (!isTauri) return demoPacks;
  return tauriInvoke<PackSummary[]>("list_packs");
}
