"""
generate-aliases.py — use an LLM to enrich every term with aliases,
vague_triggers, and context_keywords.

Reads `src-tauri/packs/*.json`, prompts Claude for each term that is
missing these fields, and writes them back in place.

Set ANTHROPIC_API_KEY in the environment. Dry-run mode (default) prints
what it *would* change; pass `--apply` to write.

Usage:
    python scripts/generate-aliases.py                            # dry-run all packs
    python scripts/generate-aliases.py --pack ui-components --apply
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKS = ROOT / "src-tauri" / "packs"

SYSTEM_PROMPT = """You are a vocabulary expert for frontend UI components.
Given a canonical term name and description, return JSON with:
  aliases:         synonyms a frontend expert might use
  vague_triggers:  casual/non-expert phrases that SHOULD match this term
  context_keywords: words likely to appear nearby in a UI prompt

Output ONLY valid JSON. No prose."""


def needs_refresh(term: dict) -> bool:
    return not term.get("aliases") or not term.get("vague_triggers")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--pack", help="Restrict to a single pack id")
    p.add_argument("--apply", action="store_true")
    args = p.parse_args()

    try:
        import anthropic  # type: ignore
    except ImportError:
        print("!! anthropic SDK not installed; running in offline echo mode")
        anthropic = None

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    client = None
    if anthropic and api_key:
        client = anthropic.Anthropic(api_key=api_key)

    for pack_path in sorted(PACKS.glob("*.json")):
        data = json.loads(pack_path.read_text(encoding="utf-8"))
        if args.pack and data["id"] != args.pack:
            continue

        changed = 0
        for term in data["terms"]:
            if not needs_refresh(term):
                continue
            if not client:
                print(f"(dry) {term['id']:<32}  would generate aliases")
                continue

            msg = client.messages.create(
                model="claude-3-5-sonnet-latest",
                max_tokens=400,
                system=SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": json.dumps(
                            {
                                "canonical_name": term["canonical_name"],
                                "description": term["description"],
                            }
                        ),
                    }
                ],
            )
            body = msg.content[0].text if msg.content else "{}"
            try:
                parsed = json.loads(body)
            except json.JSONDecodeError:
                print(f"!! non-JSON response for {term['id']}, skipping")
                continue
            for key in ("aliases", "vague_triggers", "context_keywords"):
                if key in parsed and not term.get(key):
                    term[key] = parsed[key]
                    changed += 1
            print(f"   {term['id']:<32}  +{len(parsed.get('aliases', []))} aliases")

        if changed and args.apply:
            pack_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
            print(f"wrote {pack_path}  ({changed} fields added)")
        elif changed:
            print(f"(dry) {pack_path}  would add {changed} fields")


if __name__ == "__main__":
    main()
