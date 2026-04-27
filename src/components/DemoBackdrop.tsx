import { useLexisStore } from "@/lib/store";
import { demoSuggestions } from "@/lib/demo";

/**
 * The web demo backdrop. Renders a fake "AI chat" composer underneath
 * the live overlay so visitors can see what Lexis looks like in
 * context. Only used when running outside of Tauri.
 */
export function DemoBackdrop({ children }: { children: React.ReactNode }) {
  const replay = () => {
    useLexisStore.getState().clear();
    setTimeout(() => {
      useLexisStore.getState().receiveSuggestions(demoSuggestions());
    }, 250);
  };

  return (
    <div className="lexis-demo-backdrop">
      <div className="lexis-demo-content">
        <header className="lexis-demo-header">
          <div className="lexis-demo-brand">
            <span className="lexis-demo-logo" aria-hidden />
            <span>Lexis</span>
          </div>
          <nav className="lexis-demo-nav">
            <button onClick={replay} className="lexis-demo-nav-btn">
              Replay demo
            </button>
            <a
              href="#/settings"
              className="lexis-demo-nav-btn"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "#/settings";
              }}
            >
              Settings
            </a>
            <a
              href="https://github.com/haminxx/Lexis"
              target="_blank"
              rel="noreferrer"
              className="lexis-demo-nav-btn lexis-demo-nav-btn--ghost"
            >
              GitHub
            </a>
          </nav>
        </header>

        <section className="lexis-demo-hero">
          <p className="lexis-demo-eyebrow">Web preview</p>
          <h1 className="lexis-demo-title">
            You know what you want.
            <br />
            <span className="lexis-demo-title-accent">
              Lexis knows what to call it.
            </span>
          </h1>
          <p className="lexis-demo-lede">
            Lexis is an OS-level desktop assistant that watches your AI prompts
            and silently suggests the precise UI terminology — Grammarly for
            prompt vocabulary, with live component previews. This page is a
            visual demo of the overlay; the real screen-watching, suggestion,
            and injection features run in the native Tauri build.
          </p>
        </section>

        <section className="lexis-demo-stage" aria-label="Demo composer">
          <div className="lexis-demo-stage-frame">
            <div className="lexis-demo-stage-titlebar">
              <span className="lexis-demo-stage-dot" data-color="red" />
              <span className="lexis-demo-stage-dot" data-color="amber" />
              <span className="lexis-demo-stage-dot" data-color="green" />
              <span className="lexis-demo-stage-tab">chat.openai.com</span>
            </div>

            <div className="lexis-demo-stage-body">
              <div className="lexis-demo-bubble">
                Build me a settings page where each section has a{" "}
                <mark>blurry transparent box that shows options on hover</mark>.
                Make it feel modern and minimal.
              </div>

              <div className="lexis-demo-composer" id="lexis-demo-composer">
                <span className="lexis-demo-composer-text">
                  blurry transparent box that shows options on hover
                </span>
                <span className="lexis-demo-caret" aria-hidden />
              </div>
              <p className="lexis-demo-hint">
                Lexis spotted "blurry transparent box" → it has a name.
              </p>
            </div>
          </div>
        </section>

        <section className="lexis-demo-info">
          <div className="lexis-demo-info-card">
            <h3>What you're seeing</h3>
            <p>
              The colored dot, pill, card, and live-preview panel above are the
              real overlay components from the desktop app, rendered against
              mock data. Hover or wait — it auto-advances dot → pill → card.
              Press <kbd>Ctrl</kbd>+<kbd>Space</kbd> on the card to open the
              live sandbox.
            </p>
          </div>
          <div className="lexis-demo-info-card">
            <h3>What's missing on the web</h3>
            <p>
              Screen reading, prompt extraction, the SQLite vocabulary, and
              text injection all live in the Rust backend and only run inside
              the native build. Clone the repo and run{" "}
              <code>pnpm tauri dev</code> for the real thing.
            </p>
          </div>
        </section>

        <footer className="lexis-demo-footer">
          v0.1.0 · Tauri + Rust + React · Web demo only
        </footer>
      </div>

      {children}
    </div>
  );
}
