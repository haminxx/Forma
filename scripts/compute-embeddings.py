"""
compute-embeddings.py — offline embedding computation for every term.

Reads `src-tauri/packs/*.json`, computes an all-MiniLM-L6-v2 embedding
(384-dim, float32) for each term's canonical_name + description +
aliases, and writes it into the SQLite DB at
`src-tauri/.lexis-cli.db` under `term_embeddings`.

Runtime picks these up via sqlite-vss (Phase 7).

Requires:
    pip install sentence-transformers sqlite-utils
"""

from __future__ import annotations

import json
import sqlite3
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / ".lexis-cli.db"
PACKS = ROOT / "src-tauri" / "packs"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def main():
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        raise SystemExit(
            "pip install sentence-transformers (and sqlite-utils) first"
        )

    if not DB.exists():
        raise SystemExit(
            f"{DB} not found — run `cargo run --bin lexis_cli -- init` first"
        )

    model = SentenceTransformer(MODEL_NAME)

    conn = sqlite3.connect(DB)
    conn.execute("PRAGMA journal_mode=WAL")

    for pack in sorted(PACKS.glob("*.json")):
        data = json.loads(pack.read_text(encoding="utf-8"))
        for term in data["terms"]:
            text = " ".join(
                filter(
                    None,
                    [
                        term["canonical_name"],
                        term.get("description", ""),
                        " ".join(term.get("aliases", [])),
                        " ".join(term.get("vague_triggers", [])),
                    ],
                )
            )
            vec = model.encode(text, normalize_embeddings=True).astype("float32")
            blob = struct.pack(f"<{len(vec)}f", *vec)
            conn.execute(
                """
                INSERT INTO term_embeddings(term_id, embedding, model, dim)
                VALUES(?, ?, ?, ?)
                ON CONFLICT(term_id) DO UPDATE SET
                    embedding = excluded.embedding,
                    model     = excluded.model,
                    dim       = excluded.dim
                """,
                (term["id"], blob, MODEL_NAME, len(vec)),
            )
            print(f"  · {term['id']:<30} ({len(vec)}d)")
    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()
