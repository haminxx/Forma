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


# ============================================================
# AI MODE — Parse analyze response (array of detected phrases)
# ============================================================

def parse_analyze_response(raw_response, original_text):
    """Parse the AI mode analyze response. Returns array of validated phrases."""
    import json
    import re
    
    if not raw_response or raw_response == "ERROR":
        return []
    
    # Try to find JSON array in the response
    response_str = str(raw_response).strip()
    
    # Strip markdown code fences if present
    response_str = re.sub(r'^```(?:json)?\s*', '', response_str)
    response_str = re.sub(r'\s*```$', '', response_str)
    response_str = response_str.strip()
    
    # Find the first [ and last ] to extract array
    start_idx = response_str.find('[')
    end_idx = response_str.rfind(']')
    
    if start_idx == -1 or end_idx == -1 or end_idx < start_idx:
        print(f"[parse_analyze] No JSON array found in response")
        return []
    
    json_str = response_str[start_idx:end_idx + 1]
    
    try:
        parsed = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"[parse_analyze] JSON parse error: {e}")
        return []
    
    if not isinstance(parsed, list):
        print(f"[parse_analyze] Response is not an array")
        return []
    
    # Validate and filter each phrase
    validated = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        
        # Required fields
        phrase = item.get('phrase', '').strip()
        term = item.get('term', '').strip()
        definition = item.get('definition', '').strip()
        category = item.get('category', '').strip()
        alternatives = item.get('alternatives', [])
        
        if not phrase or not term:
            continue
        
        # CRITICAL: verify phrase actually exists in original text
        # This filters out AMD hallucinations
        text_lower = original_text.lower()
        phrase_lower = phrase.lower()
        actual_index = text_lower.find(phrase_lower)
        
        if actual_index == -1:
            print(f"[parse_analyze] Phrase not in text, skipping: {phrase}")
            continue
        
        # Use ACTUAL position in text, not what AMD claimed
        actual_start = actual_index
        actual_end = actual_index + len(phrase)
        
        # Get the exact phrase from original text (preserves case)
        actual_phrase = original_text[actual_start:actual_end]
        
        # Validate category
        valid_categories = ["Navigation", "Layout", "Overlay", "Content", "Action"]
        if category not in valid_categories:
            category = "Content"
        
        # Validate alternatives
        valid_alts = []
        if isinstance(alternatives, list):
            for alt in alternatives[:3]:  # Max 3
                if isinstance(alt, dict):
                    alt_term = alt.get('term', '').strip()
                    alt_desc = alt.get('description', '').strip()
                    if alt_term:
                        valid_alts.append({
                            "term": alt_term,
                            "description": alt_desc
                        })
        
        # Pad with empty alternatives if fewer than 3
        while len(valid_alts) < 3:
            valid_alts.append({"term": "", "description": ""})
        
        validated.append({
            "phrase": actual_phrase,
            "start": actual_start,
            "end": actual_end,
            "term": term,
            "definition": definition,
            "category": category,
            "alternatives": valid_alts
        })
    
    # Sort by start position
    validated.sort(key=lambda x: x['start'])
    
    # Remove overlapping phrases (keep the first/longer one)
    non_overlapping = []
    used_ranges = []
    for v in validated:
        overlaps = any(
            (v['start'] < r['end'] and v['end'] > r['start'])
            for r in used_ranges
        )
        if not overlaps:
            non_overlapping.append(v)
            used_ranges.append({'start': v['start'], 'end': v['end']})
    
    return non_overlapping

