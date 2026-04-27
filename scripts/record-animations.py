"""
record-animations.py — generate Lottie/WebM micro-animations for every term.

This script reads `src-tauri/packs/*.json`, finds every term with an
`animation_asset` field, and dispatches to a per-category recorder:

  * Lottie: programmatic generation via `lottie` (Python).
  * WebM:   headless Chromium + Playwright, capture canvas, encode VP9.

Phase 5 deliverable. The initial pass is hand-authored in After Effects;
this script covers the long tail of simple demos (drawers, toasts,
progress bars) that can be expressed in a dozen CSS keyframes.

Usage:
    python scripts/record-animations.py --pack ui-components --only drawer-right
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKS = ROOT / "src-tauri" / "packs"
OUT = ROOT / "assets" / "lottie"


def iter_terms(pack_filter: str | None):
    for pack in sorted(PACKS.glob("*.json")):
        data = json.loads(pack.read_text(encoding="utf-8"))
        if pack_filter and data["id"] != pack_filter:
            continue
        for term in data["terms"]:
            asset = term.get("animation_asset")
            if not asset:
                continue
            yield data["id"], term, asset


def ensure(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)


def render_placeholder_lottie(title: str, out: Path):
    """Write a tiny placeholder Lottie so the card has something to show
    even before the real artwork lands. Replace per-term via AE or a
    category-specific generator."""
    ensure(out)
    lottie = {
        "v": "5.9.6",
        "fr": 30,
        "ip": 0,
        "op": 90,
        "w": 200,
        "h": 150,
        "nm": title,
        "assets": [],
        "layers": [
            {
                "ddd": 0,
                "ind": 1,
                "ty": 4,
                "nm": "pulse",
                "sr": 1,
                "ks": {
                    "o": {"a": 1, "k": [
                        {"t": 0, "s": [40]},
                        {"t": 45, "s": [80]},
                        {"t": 90, "s": [40]},
                    ]},
                    "r": {"a": 0, "k": 0},
                    "p": {"a": 0, "k": [100, 75, 0]},
                    "a": {"a": 0, "k": [0, 0, 0]},
                    "s": {"a": 1, "k": [
                        {"t": 0, "s": [80, 80, 100]},
                        {"t": 45, "s": [110, 110, 100]},
                        {"t": 90, "s": [80, 80, 100]},
                    ]},
                },
                "ao": 0,
                "shapes": [
                    {
                        "ty": "el",
                        "s": {"a": 0, "k": [80, 80]},
                        "p": {"a": 0, "k": [0, 0]},
                    },
                    {
                        "ty": "fl",
                        "c": {"a": 0, "k": [0.47, 0.7, 1.0, 1]},
                        "o": {"a": 0, "k": 100},
                    },
                ],
                "ip": 0,
                "op": 90,
                "st": 0,
                "bm": 0,
            }
        ],
    }
    out.write_text(json.dumps(lottie), encoding="utf-8")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--pack", help="Restrict to a single pack id")
    p.add_argument("--only", help="Restrict to a single term id")
    p.add_argument("--placeholder", action="store_true",
                   help="Emit placeholder Lottie instead of calling real generators")
    args = p.parse_args()

    for pack_id, term, asset in iter_terms(args.pack):
        if args.only and term["id"] != args.only:
            continue
        out = OUT / asset
        if out.exists():
            continue
        print(f"  · {pack_id}/{term['id']:<30}  → {out.relative_to(ROOT)}")
        if args.placeholder:
            render_placeholder_lottie(term["canonical_name"], out)
        else:
            # TODO: dispatch to per-category real generator.
            render_placeholder_lottie(term["canonical_name"], out)


if __name__ == "__main__":
    main()
