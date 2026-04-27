/**
 * Runtime detection for the Tauri webview.
 *
 * In the desktop app, Tauri injects `__TAURI_INTERNALS__` onto `window`
 * before our scripts run. In a regular browser (e.g. the Vercel demo
 * deployment) it is absent, so any `invoke()` call would throw.
 *
 * Code paths that talk to the Rust backend should branch on this flag
 * and fall back to demo data when running on the web.
 */
export const isTauri: boolean =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** True when we are in the Vercel/web demo (the inverse of `isTauri`). */
export const isWebDemo: boolean = !isTauri;
