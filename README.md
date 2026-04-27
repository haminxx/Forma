# Lexis

> *"You know what you want. Lexis knows what to call it."*

An OS-level desktop assistant that watches your AI prompts and silently suggests the precise UI terminology in a glassmorphic popover — Grammarly for prompt vocabulary, with 21st.dev-style live component previews.

See [`Idea.md`](./Idea.md) for the full product brief and [`.cursor/plans/`](./.cursor/plans/) for the architecture plan.

## Stack

| Layer | Tech |
|---|---|
| App shell | Tauri v2 |
| Backend | Rust (`windows-rs`, `objc2`, `atspi`, `tokenizers`, `ort`, `rusqlite`) |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| Storage | SQLite (FTS5 + `sqlite-vss`) |
| Live preview | Sandpack |
| Micro-animations | Lottie + WebM |

## Layout

```
src-tauri/   Rust backend (Eyes, Brain, Face, Hands, DB)
src/         React overlay frontend
assets/      Lottie / WebM / live-preview components
scripts/     Pack scraping, alias generation, embedding compute
tests/       Golden prompts and matcher accuracy
packs/       Default terminology JSON packs
```

## Development

Requires:

- Rust stable (`rustup toolchain install stable`)
- Node 20+ and `pnpm` (or `npm`)
- Platform toolchain (WebView2 on Windows, Xcode CLT on macOS, `webkit2gtk-4.1` on Linux)

```powershell
# Install frontend deps
pnpm install

# Dev (hot-reload overlay + auto-rebuild Rust)
pnpm tauri dev

# Production bundle
pnpm tauri build

# Brain CLI harness (test matcher without UI)
cargo run --manifest-path src-tauri/Cargo.toml --bin lexis_cli -- match "a blurry floating menu"
```

## Phases

See `.cursor/plans/` for the full phase breakdown. Current status: scaffolding through Phase 5.

## Web demo (Vercel)

The Vite frontend can be deployed to Vercel as a **visual demo** of the
overlay UI. The demo is *not* a working app — screen reading, prompt
extraction, the SQLite vocabulary, and text injection all live in the
Rust backend and only run inside the native Tauri build.

When the bundle detects it is running in a regular browser
(`window.__TAURI_INTERNALS__` is absent), it:

- routes all `invoke()`/`listen()` calls in `src/lib/ipc.ts` through
  mock implementations in `src/lib/demo.ts`;
- seeds a sample suggestion into the Zustand store so the overlay is
  visible;
- renders a `DemoBackdrop` (mock AI chat composer) so visitors see the
  overlay in context.

### Deploying

1. Push this repo to GitHub (`git push origin main`).
2. In Vercel, **Add New… → Project** and import the repo.
3. Accept the auto-detected settings (or confirm manually):
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Click **Deploy**. The Rust side (`src-tauri/`) is excluded by
   `.vercelignore` and never reaches the Vercel build container.

`vercel.json` pins the framework, output dir, and adds an SPA rewrite
so unknown paths fall back to `index.html`.

## License

TBD
