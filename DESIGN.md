# Forma — DESIGN.md

`DESIGN.md` for Forma's marketing surface. Follows the 9-section structure popularised by [VoltAgent / awesome-claude-design](https://github.com/VoltAgent/awesome-claude-design) so design agents (Claude Design, Stitch, Cursor) can scaffold new screens that stay on-system.

Pair this file with `src/index.css` (`@theme` tokens) — the `@theme` block is the executable source of truth; this doc carries the *why*.

## External references (principles, not copied assets)

- **[VoltAgent / awesome-claude-design](https://github.com/VoltAgent/awesome-claude-design)** — 9-section `DESIGN.md` template + tone for keeping token, rule, and rationale in one file.
- **[andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)** — *Simplicity first*, *surgical changes*. State what "done" looks like (alignment, max-widths, contrast), then verify with a build + quick visual pass.
- **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** — Treat UI as semantic roles: **canvas**, **surface**, **border**, **accent**, **muted copy**.

---

## 1. Visual Theme & Atmosphere

Cinematic, near-black, editorial. One primary accent (Forma gold) with a steel-teal pop for the cool tail. Sections read as a single continuous gradient when scrolled, not a stack of independently-themed blocks. Motion is restrained: per-word blur-in for headings, fade-up reveals for grids, scroll-linked colour bleed at section seams (harmonic.ai pattern).

## 2. Color Palette & Roles

60 / 30 / 10 split.

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Canvas (60%) | `--color-forma-bg` | `#191a1f` | Page background, section bodies |
| Primary text | `--color-forma-fg` | `#ffffff` | All headings + body copy on dark |
| Muted copy | – | `text-white/55`–`70` | Secondary lines, subtitles |
| Accent — gold (30%) | `--color-forma-gold` | `#d4b87a` | Precise states, CTAs, key labels, Solution backdrop, install-step progress bars |
| Accent — gold soft | `--color-forma-gold-soft` | `#e5c98f` | Hero/sandbox crowns, gradient tops |
| Accent — teal (10%) | `--color-forma-accent` | `#5eb1bf` | About/Docs cool tail, EdgeGlow accent |
| Accent — teal deep | `--color-forma-accent-deep` | `#2e7e8c` | Hover states for the cool half |
| Border (default) | – | `white/8`–`12%` | Hairline section borders, card edges |
| Border (gold) | – | `rgba(212,184,122,0.35–0.55)` | Gold-section dividers and pills |

`*-rgb` triplets (e.g. `--color-forma-gold-rgb`) are exposed for `rgba(var(--token-rgb), <a>)` use in inline styles + radial gradients.

## 3. Typography Rules

- **Family** — Google Sans first, then `ui-sans-serif, system-ui, -apple-system, Inter`. `body` is set in `index.css`; never override globally.
- **Eyebrow** — `text-[11px] font-medium uppercase tracking-[0.22–0.32em] text-white/45–55`.
- **H1 (hero)** — `text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.05]`. Forma gold (`#d4b87a`) for the brand H1.
- **H2 (section)** — `text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight`, white, gold underline drawn after the per-word blur-in lands.
- **H3 (sub-block)** — `text-xl sm:text-2xl font-semibold tracking-tight`.
- **Body** — `text-base sm:text-lg leading-relaxed text-white/65`.
- **Mono / numeric** — Tabular nums for any counter (`text-[10px] font-mono tabular-nums`). Used in checklists and brief line numbers.

## 4. Component Stylings

- **Cards (shadcn)** — `rounded-lg border border-border bg-card text-card-foreground shadow-sm`. Tokens resolve to dark surfaces on dark sections; on the Solution gold backdrop they keep their dark colour for contrast (no override needed).
- **Buttons** — Primary = gold pill `bg-[#d4b87a] text-black hover:bg-[#e2c890]`. Secondary = `border border-white/10 bg-white/[0.04] text-white/80`.
- **Pills / segmented toggles** — Sliding indicator on `border border-white/10 bg-white/[0.03] p-1 backdrop-blur-sm`; spring transition `stiffness 320, damping 32`.
- **Glass surfaces** — Used for the sandbox prompt and step-card surfaces only: `bg-white/[0.025–0.05] backdrop-blur-2xl backdrop-saturate-150` over a thin hairline border. Avoid solid fills on the gold sandbox bloom — `LogoCloud` cells use frosted glass so the bloom is *visible through* each cell.
- **Bento grid** — `BentoGridShowcase` (3 col × 3 row, slot 1 spans 3 rows, slot 6 spans 2 cols). Spring stagger on `whileInView`, gated by `useReducedMotion`.
- **Browser frame (demo)** — Three-light traffic dots, back/forward, eye/code, URL pill (mono, `Lock + Globe + path`), `ExternalLink`, `RefreshCw`, `Terminal`, `MoreHorizontal`. Border switches to gold on Forma mode; same chrome height across modes.

## 5. Layout Principles

- **Section width rails**
  - Hero / Demo / Sandbox / About: `max-w-[min(98vw,92rem)]`.
  - Solution / Docs: `max-w-[min(calc(100vw-3rem),72rem)]`.
  - InstallSteps + GlassTextarea (sandbox) share `max-w-[min(calc(100vw-3rem),96rem)]` so the prompt aligns edge-to-edge with the four numbered step rails directly above it.
- **Home hero (invisible positioning grid)** — `md:grid-cols-12`. No drawn lines; the structure exists only to align the title block (~cols 1–7) and the motion panel (~cols 8–12) to the same max width.
- **Spacing scale** — Tailwind defaults. Section vertical padding is `clamp(2rem, 5–8vh, 4–6rem)` so density scales with viewport.
- **Touch targets** — Icon buttons in prompts/sandbox aim for ≥ 36–40 px hit area.

## 6. Depth & Elevation

Flat by default. Elevation comes from **light** (radial blooms + EdgeGlow, `mix-blend-mode: screen`), not from heavy drop-shadows. Two helpers in `ui/section-fade.tsx`:

- `SectionFade` — vertical page-bg gradient with optional `backdrop-filter: blur(...)` masked into the section interior. Bleeds distinctive backgrounds (Sandbox gold, Solution gold) into the page bg over a `clamp(4rem..8rem)` strip.
- `EdgeGlow` — radial bloom at the section edge with `tone` presets (`gold`, `warm-gold`, `accent`, `deep-accent`). When two adjacent sections both place an `EdgeGlow` at the boundary, the blooms overlap and the warmth/coolness reads as *flowing across* the seam.

Card shadow tokens are used sparingly; the gold Solution panel uses a single low-alpha gold shadow (`shadow-[0_30px_80px_-40px_rgba(212,184,122,0.45)]`) to lift it from the radial.

## 7. Do's and Don'ts

**Do**
- Use one accent at a time per section. Gold for warm half (Hero → Solution); teal for cool tail (About + Docs).
- Verify every section against the build + a visual pass. Width rails are easy to break; check on `1280px` and `1920px`.
- Reach for `EdgeGlow` + `SectionFade` before inventing a new gradient strip.

**Do not**
- Introduce extra accent hues in marketing sections (rainbow gradients compete with Forma gold).
- Ship unrelated refactors with visual polish (Karpathy-style "surgical changes").
- Use solid card backgrounds on the Sandbox gold bloom — frost the glass instead.

## 8. Responsive Behavior

- **Breakpoints** — Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`).
- **Hero grid** — Stacks below `md`; 12-col grid above.
- **Demo split** — Stacks below `lg`; side-by-side IDE layout above.
- **Bento (Solution)** — Single column below `md`; 3 × 3 above.
- **LogoCloud** — 2 cols mobile, 4 cols `md+`. Plus-icon decorations only on the inter-row centre line.
- **Sandbox prompt** — `min-h 52 px`, `max-h ~72 px`. Grows in width with viewport via `clamp`-padded textarea.

## 9. Agent Prompt Guide

Embed in `SKILL.md` if you scaffold this design system into a new project. Reusable prompts that stay on-brand:

- *"Add a marketing section between Demo and Sandbox titled 'X'. Use the eyebrow + per-word blur-in H2 + muted-copy subtitle pattern from `pages/Home.tsx`. Wrap the body in `Reveal`. Section width: hero rail."*
- *"Render a comparison card pair using `Card` from `@/components/ui/card`. Vibe = white/8 border, default surface; Forma = gold border `border-[rgba(212,184,122,0.35)]`, dark surface."*
- *"Add an EdgeGlow at the section seam. Tone = `gold` if the previous section is in the warm half, `accent` if in the cool half. Default intensity 0.06–0.12."*
- *"For any new bento or grid block, use `BentoGridShowcase`-style slot props instead of raw `<div>`s so the slot semantics are explicit and animation hooks already exist."*

When in doubt, mirror an existing section before inventing a new pattern.
