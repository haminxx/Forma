"""
build-packs.py — terminology pack scraper.

Targets (Phase 8 goal: 3000+ terms across 8 packs):

  * ui-components       → MDN, Material Design, Radix, shadcn/ui
  * layout-patterns     → CSS spec, Tailwind docs, Every Layout
  * design-styles       → Design-trend articles (Glassmorphism, Brutalism…)
  * interaction-patterns→ NNGroup, UX-pattern libraries
  * animation-terms     → Framer Motion docs, GSAP docs
  * design-tokens       → Design-Systems docs
  * architecture        → Framework docs
  * image-gen           → Midjourney/SD docs, photography terms

The pipeline has three stages:

  1. scrape  — fetch canonical term lists per source → raw JSONL
  2. refine  — LLM pass adds aliases, vague_triggers, context_keywords
  3. emit    — merge into a single pack JSON in src-tauri/packs/

Each stage is idempotent; run them individually during curation.

Usage:
    python scripts/build-packs.py scrape ui-components
    python scripts/build-packs.py refine ui-components
    python scripts/build-packs.py emit   ui-components
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "src-tauri" / "packs"
RAW_DIR = ROOT / "build" / "packs-raw"


SOURCES: dict[str, list[str]] = {
    "ui-components": [
        "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
        "https://m3.material.io/components",
        "https://www.radix-ui.com/primitives/docs/overview/introduction",
        "https://ui.shadcn.com/docs/components",
    ],
    "layout-patterns": [
        "https://every-layout.dev/layouts/",
        "https://tailwindcss.com/docs/flex",
    ],
    "design-styles": [
        "https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9",
    ],
    # ... extend as needed
}


def cmd_scrape(pack_id: str):
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    # TODO: use playwright + readability to extract terminology lists.
    # For now, we just bootstrap a file so the stage is wired.
    out = RAW_DIR / f"{pack_id}.jsonl"
    out.write_text("", encoding="utf-8")
    print(f"wrote {out}")


def cmd_refine(pack_id: str):
    # TODO: LLM pass (Claude API) to add aliases, vague_triggers,
    # context_keywords, specificity/adoption heuristics.
    raw = RAW_DIR / f"{pack_id}.jsonl"
    if not raw.exists():
        raise SystemExit(f"run scrape first ({raw} missing)")
    # ...


def cmd_emit(pack_id: str):
    raw = RAW_DIR / f"{pack_id}.jsonl"
    if not raw.exists():
        raise SystemExit(f"run scrape+refine first ({raw} missing)")
    # Skeleton emit: merge JSONL rows into a pack file.
    terms: list[dict] = []
    for line in raw.read_text(encoding="utf-8").splitlines():
        if line.strip():
            terms.append(json.loads(line))
    out = PACK_DIR / f"{pack_id}.json"
    existing = json.loads(out.read_text(encoding="utf-8")) if out.exists() else {
        "id": pack_id,
        "name": pack_id.replace("-", " ").title(),
        "version": "0.1.0",
        "terms": [],
        "vague_patterns": [],
    }
    by_id = {t["id"]: t for t in existing["terms"]}
    for t in terms:
        by_id[t["id"]] = t
    existing["terms"] = list(by_id.values())
    out.write_text(json.dumps(existing, indent=2), encoding="utf-8")
    print(f"wrote {out} ({len(existing['terms'])} terms)")


def main(argv: Iterable[str] | None = None):
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="stage", required=True)
    for stage in ("scrape", "refine", "emit"):
        s = sub.add_parser(stage)
        s.add_argument("pack_id")
    args = p.parse_args(argv)
    {"scrape": cmd_scrape, "refine": cmd_refine, "emit": cmd_emit}[args.stage](
        args.pack_id
    )


if __name__ == "__main__":
    main()
