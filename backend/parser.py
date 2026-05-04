import json

DEFAULT_RESPONSE = {
    "term": "UI Component",
    "definition": "A reusable interface element for building user interfaces.",
    "category": "Layout",
    "alternatives": [
        {"term": "Generic Component", "description": "A flexible UI element."},
        {"term": "Custom Element", "description": "A bespoke interface piece."},
        {"term": "Module", "description": "A self-contained UI unit."},
    ],
}

VALID_CATEGORIES = ["Navigation", "Layout", "Overlay", "Content", "Action"]


def parse_response(raw_text):
    if not raw_text or raw_text == "ERROR":
        return DEFAULT_RESPONSE.copy()

    text = raw_text.strip()

    text = text.replace("```json", "").replace("```", "")

    first_brace = text.find("{")
    last_brace = text.rfind("}")

    if first_brace == -1 or last_brace == -1:
        return DEFAULT_RESPONSE.copy()

    json_text = text[first_brace : last_brace + 1]

    try:
        parsed = json.loads(json_text)
    except (json.JSONDecodeError, ValueError):
        return DEFAULT_RESPONSE.copy()

    result = {}

    result["term"] = (
        parsed.get("term", "").strip()
        if isinstance(parsed.get("term"), str)
        else "UI Component"
    )
    if not result["term"]:
        result["term"] = "UI Component"

    result["definition"] = (
        parsed.get("definition", "").strip()
        if isinstance(parsed.get("definition"), str)
        else "A reusable interface element."
    )
    if not result["definition"]:
        result["definition"] = "A reusable interface element."

    category = parsed.get("category", "Layout")
    if isinstance(category, str) and category in VALID_CATEGORIES:
        result["category"] = category
    else:
        result["category"] = "Layout"

    alternatives = parsed.get("alternatives", [])
    if not isinstance(alternatives, list):
        alternatives = []

    cleaned_alts = []
    for alt in alternatives[:3]:
        if isinstance(alt, dict):
            term = alt.get("term", "").strip() if isinstance(alt.get("term"), str) else ""
            desc = alt.get("description", "").strip() if isinstance(alt.get("description"), str) else ""
            if term and desc:
                cleaned_alts.append({"term": term, "description": desc})

    while len(cleaned_alts) < 3:
        cleaned_alts.append({
            "term": "Related Component",
            "description": "A similar UI element.",
        })

    result["alternatives"] = cleaned_alts[:3]

    return result

