# Forma — marketing UI notes

Lightweight design guidance for the Vite/React landing shell in this folder. Pair with `src/index.css` (`@theme` tokens) as the source of truth for Tailwind.

## External references (principles, not copied assets)

- **[andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)** — Prefer *simplicity first* and *surgical changes*: no drive-by refactors, no speculative APIs, match existing patterns before inventing new ones. *Goal-driven execution*: when polishing UI, state what “done” looks like (alignment, max widths, contrast), then verify with build + quick visual pass.
- **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** — Treat UI as semantic roles: **canvas**, **surface**, **border**, **accent**, **muted copy**. Keep hierarchy obvious with one primary accent (Forma gold) on a near-black canvas.

## Core tokens

| Role | Implementation |
|------|----------------|
| Canvas | `#191a1f` (`--color-stitch-bg` / `--color-forma-bg`) |
| Primary text | `#ffffff` |
| Muted / secondary | `text-white/55`–`65%`, borders `white/8`–`12%` |
| Accent | `#d4b87a` (brand gold) — precise states, CTAs, key labels |
| Frosted surfaces | `bg-white/[0.02–0.05]` + hairline border; optional blur on promo cards only |

## Layout habits used here

- **Wide comparison rails** — Demo and Sandbox use `max-w-[min(98vw,88–92rem)]` so dual-column prompts and output screenshots read as **full horizontal bands** on large displays without swimming in empty margins.
- **Touch targets** — Icon buttons in prompts/sandbox aim for ≥ 36–40px hit area.
- **Motion** — Springs for carousel/hero affordances; global `prefers-reduced-motion` in `index.css` disables smooth scroll; components should avoid gratuitous motion when reviewing.

## Do not

- Introduce extra accent hues in marketing sections (rainbow gradients compete with Forma gold).
- Ship unrelated refactors in the same change as visual polish (per Karpathy-style “surgical changes”).
