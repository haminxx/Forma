# Lexis animation assets

Each UI term in the dictionary gets a 2–3 second looping micro-animation
shown in the Level-3 suggestion card.

Preferred format is **Lottie JSON** (hand-crafted in After Effects or
programmatically generated) because it is:

- tiny (under 20 KB per asset is typical),
- vector (resolution-independent; sharp at any DPI),
- theme-able at runtime (colour swap via `lottie-web`).

**WebM (VP9)** is the fallback for anything Lottie cannot express
(e.g. real device chrome, complex shading).

## Directory layout

```
assets/
├── lottie/
│   ├── ui-components/
│   │   ├── popover.json
│   │   ├── glass-popover.json
│   │   └── drawer-right.json
│   ├── layout-patterns/
│   │   └── masonry.json
│   └── design-styles/
│       └── glassmorphism.json
├── webm/
│   └── ui-components/
│       └── complex-demo.webm
└── live/         components shipped to the React preview registry
```

The filename in `terms.animation_asset` is resolved against `assets/lottie/`
first, then `assets/webm/`. When neither file exists, the card renders a
soft animated placeholder (see `AnimationPreview.tsx`).

## Generating assets

See `scripts/record-animations.py` for the programmatic pipeline.

## Bundling

Vite serves everything under `assets/` at `/lottie/…` and `/webm/…` at dev
time. For production, the `tauri.conf.json` resources list includes the
Lottie/WebM trees via `../assets/**`.
