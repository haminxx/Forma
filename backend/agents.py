import os
import json
import asyncio
import time
from typing import Dict, Any

import httpx
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM

load_dotenv()

AMD_ENDPOINT = os.getenv("AMD_ENDPOINT", "http://165.245.128.5:8000/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "meta-llama/Meta-Llama-3.1-8B-Instruct")

llm = LLM(
    model=f"hosted_vllm/{MODEL_NAME}",
    base_url=AMD_ENDPOINT,
    api_key="not-needed",
    temperature=0,
    max_tokens=1500,
)

translation_agent = Agent(
    role="UI Terminology Translator",
    goal="Translate vague UI component descriptions into precise professional frontend terminology and return structured JSON.",
    backstory=(
        "You are a senior frontend designer with 15 years of experience. "
        "You have built hundreds of production applications and know every "
        "UI component by its exact professional name. You always respond "
        "with valid JSON only — no preamble, no explanation, no markdown, "
        "no code fences. Just the raw JSON object with the exact fields "
        "requested. Your responses are precise and consistent."
    ),
    llm=llm,
    verbose=False,
    allow_delegation=False,
)


def translate_phrase(phrase):
    task_description = f"""Translate this vague UI description into professional terminology.

Vague phrase: "{phrase}"

Return ONLY a raw JSON object with NO other text before or after it.
The JSON must have exactly these fields:
- term: a string of 2 to 4 words being the professional component name in Title Case
- definition: exactly one sentence under 20 words explaining what the component is
- category: exactly one word, must be one of: Navigation, Layout, Overlay, Content, Action
- alternatives: array of exactly 3 objects, each with a "term" string and a "description" string

Example of correct response format:
{{"term": "Off-Canvas Drawer", "definition": "A panel that slides in from the viewport edge when triggered.", "category": "Navigation", "alternatives": [{{"term": "Side Drawer", "description": "A sliding panel for secondary navigation."}}, {{"term": "Slide-In Menu", "description": "A menu animating in from the screen edge."}}, {{"term": "Hamburger Overlay", "description": "A menu revealed by a hamburger icon."}}]}}

Return only valid JSON. No preamble. No explanation. No markdown."""

    task = Task(
        description=task_description,
        agent=translation_agent,
        expected_output="Valid JSON object with term, definition, category, and alternatives fields.",
    )

    crew = Crew(
        agents=[translation_agent],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    try:
        result = crew.kickoff()
        return str(result)
    except Exception as e:
        print(f"Error in translate_phrase: {e}")
        return "ERROR"


# ============================================================
# AI MODE — Sentence-Level Analysis Agent
# ============================================================

analysis_agent = Agent(
    role="UI Terminology Analyzer",
    goal="Scan full sentences to identify all vague UI component descriptions and translate each into precise professional terminology.",
    backstory=(
        "You are a senior frontend designer with 15 years of experience. "
        "You read user requirements and identify every vague UI component "
        "description in their text. You return a JSON array of all detected "
        "phrases with their exact positions and professional translations. "
        "You always respond with valid JSON only — no preamble, no explanation, "
        "no markdown, no code fences. Just the raw JSON array."
    ),
    llm=llm,
    verbose=False,
    allow_delegation=False,
)


def analyze_sentence(text):
    """Analyze a full sentence and return all vague UI phrases with translations."""
    
    task_description = f"""Analyze this user prompt and identify every vague UI component description.

User text: "{text}"

For each vague UI description you find, return:
- phrase: the exact substring from the text (must match exactly)
- start: character index where the phrase starts in the text
- end: character index where the phrase ends in the text
- term: professional component name in Title Case (2-4 words)
- definition: one sentence under 20 words
- category: one of [Navigation, Layout, Overlay, Content, Action]
- alternatives: array of exactly 3 objects, each with "term" and "description" strings

CRITICAL CONSTRAINT — CANONICAL TERMS ONLY:

You MUST select terms ONLY from this exact canonical list of 60
components. Both the "term" field AND every term in the "alternatives"
array MUST be one of these 60 terms. Use them EXACTLY as written
(case-sensitive, including hyphens).

THE 60 CANONICAL TERMS:
1. Off-Canvas Drawer
2. Glassmorphic Popover
3. Masonry Grid
4. Sticky Navbar
5. Modal Overlay
6. Skeleton Loader
7. Tab Panel
8. Accordion
9. Toast Notification
10. Breadcrumb Navigation
11. Tooltip
12. Dropdown Menu
13. Progress Bar
14. Bottom Sheet
15. Confirmation Dialog
16. Search Bar
17. Toggle Switch
18. Loading Spinner
19. Floating Action Button
20. Hero Section
21. Card Grid
22. Pagination Control
23. Image Carousel
24. Hamburger Menu
25. Data Table
26. Banner
27. Sidebar Navigation
28. Footer Section
29. Step Progress Indicator
30. Notification Badge
31. Date Picker
32. File Upload
33. Rating Stars
34. Color Picker
35. Range Slider
36. Form Input Field
37. Login Form
38. Avatar
39. Empty State
40. Chip Tag
41. Separator
42. Settings Panel
43. Cookie Banner
44. Comment Thread
45. Stats Counter
46. Testimonial Card
47. Pricing Card
48. Activity Feed
49. Mega Menu
50. Command Palette
51. Notification Center
52. Profile Dropdown
53. OTP Input
54. Tag Input
55. Phone Input
56. Search Suggestions
57. Floating Label Input
58. Switch Group
59. Onboarding Tour
60. Password Strength

ABSOLUTE RULES:
A. The "term" field MUST be EXACTLY one of the 60 canonical terms above. Case must match.
B. The "alternatives" array MUST contain exactly 3 objects, each with a "term" field that is a DIFFERENT canonical term from the list above (case must match).
C. NEVER invent new terms. NEVER leave alternative terms empty. NEVER use non-canonical text.
D. Forbidden terms include: "Calendar Control", "Image Upload Field", "Drag Target", "Date Selection Field", "Birthday Picker", "Photo Upload Input", "Rating System", "Product Reviews", "User Feedback", "Customer Reviews", "User Testimonials", "File Drop Area", "Dropdown List", "Empty Space".
E. NEVER use category labels as terms.
F. If a vague phrase does not clearly map to any of the 60 canonical terms, SKIP that phrase entirely.
G. Alternatives must always be 3 different canonical components from the main term. Pick semantically related ones from the canonical list.
H. Phrase descriptions like "where users can upload photos" or "for product reviews" are NOT components — skip these.

CANONICAL ALTERNATIVE MAPPINGS (use these as guidance for selecting 3 alternatives):

For "Date Picker" → alternatives: "Dropdown Menu", "Form Input Field", "Confirmation Dialog"
For "File Upload" → alternatives: "Form Input Field", "Image Carousel", "Search Bar"
For "Rating Stars" → alternatives: "Toggle Switch", "Progress Bar", "Form Input Field"
For "Color Picker" → alternatives: "Dropdown Menu", "Settings Panel", "Toggle Switch"
For "Range Slider" → alternatives: "Progress Bar", "Toggle Switch", "Form Input Field"
For "Form Input Field" → alternatives: "Search Bar", "Floating Label Input", "Phone Input"
For "Login Form" → alternatives: "Form Input Field", "OTP Input", "Modal Overlay"
For "Avatar" → alternatives: "Profile Dropdown", "Notification Badge", "Hero Section"
For "Empty State" → alternatives: "Skeleton Loader", "Loading Spinner", "Hero Section"
For "Chip Tag" → alternatives: "Tag Input", "Toggle Switch", "Notification Badge"
For "Separator" → alternatives: "Tab Panel", "Footer Section", "Banner"
For "Settings Panel" → alternatives: "Switch Group", "Profile Dropdown", "Toggle Switch"
For "Cookie Banner" → alternatives: "Banner", "Toast Notification", "Modal Overlay"
For "Comment Thread" → alternatives: "Activity Feed", "Card Grid", "Avatar"
For "Stats Counter" → alternatives: "Progress Bar", "Data Table", "Card Grid"
For "Testimonial Card" → alternatives: "Card Grid", "Hero Section", "Avatar"
For "Pricing Card" → alternatives: "Card Grid", "Confirmation Dialog", "Hero Section"
For "Activity Feed" → alternatives: "Comment Thread", "Notification Center", "Data Table"
For "Mega Menu" → alternatives: "Dropdown Menu", "Sticky Navbar", "Sidebar Navigation"
For "Command Palette" → alternatives: "Search Bar", "Dropdown Menu", "Modal Overlay"
For "Notification Center" → alternatives: "Toast Notification", "Notification Badge", "Activity Feed"
For "Profile Dropdown" → alternatives: "Dropdown Menu", "Avatar", "Settings Panel"
For "OTP Input" → alternatives: "Form Input Field", "Phone Input", "Login Form"
For "Tag Input" → alternatives: "Chip Tag", "Search Bar", "Form Input Field"
For "Phone Input" → alternatives: "Form Input Field", "OTP Input", "Floating Label Input"
For "Search Suggestions" → alternatives: "Search Bar", "Dropdown Menu", "Command Palette"
For "Floating Label Input" → alternatives: "Form Input Field", "Search Bar", "Phone Input"
For "Switch Group" → alternatives: "Toggle Switch", "Settings Panel", "Tab Panel"
For "Onboarding Tour" → alternatives: "Tooltip", "Step Progress Indicator", "Modal Overlay"
For "Password Strength" → alternatives: "Progress Bar", "Form Input Field", "Login Form"
For "Off-Canvas Drawer" → alternatives: "Sidebar Navigation", "Bottom Sheet", "Modal Overlay"
For "Glassmorphic Popover" → alternatives: "Modal Overlay", "Tooltip", "Confirmation Dialog"
For "Masonry Grid" → alternatives: "Card Grid", "Image Carousel", "Data Table"
For "Sticky Navbar" → alternatives: "Hero Section", "Sidebar Navigation", "Banner"
For "Modal Overlay" → alternatives: "Confirmation Dialog", "Bottom Sheet", "Glassmorphic Popover"
For "Skeleton Loader" → alternatives: "Loading Spinner", "Progress Bar", "Empty State"
For "Tab Panel" → alternatives: "Accordion", "Sidebar Navigation", "Switch Group"
For "Accordion" → alternatives: "Tab Panel", "Dropdown Menu", "Settings Panel"
For "Toast Notification" → alternatives: "Banner", "Notification Center", "Confirmation Dialog"
For "Breadcrumb Navigation" → alternatives: "Step Progress Indicator", "Pagination Control", "Tab Panel"
For "Tooltip" → alternatives: "Glassmorphic Popover", "Toast Notification", "Onboarding Tour"
For "Dropdown Menu" → alternatives: "Mega Menu", "Profile Dropdown", "Search Suggestions"
For "Progress Bar" → alternatives: "Step Progress Indicator", "Skeleton Loader", "Loading Spinner"
For "Bottom Sheet" → alternatives: "Off-Canvas Drawer", "Modal Overlay", "Confirmation Dialog"
For "Confirmation Dialog" → alternatives: "Modal Overlay", "Toast Notification", "Bottom Sheet"
For "Search Bar" → alternatives: "Search Suggestions", "Form Input Field", "Command Palette"
For "Toggle Switch" → alternatives: "Switch Group", "Settings Panel", "Toggle Switch"
For "Loading Spinner" → alternatives: "Skeleton Loader", "Progress Bar", "Empty State"
For "Floating Action Button" → alternatives: "Hamburger Menu", "Notification Badge", "Command Palette"
For "Hero Section" → alternatives: "Banner", "Sticky Navbar", "Card Grid"
For "Card Grid" → alternatives: "Masonry Grid", "Data Table", "Image Carousel"
For "Pagination Control" → alternatives: "Step Progress Indicator", "Breadcrumb Navigation", "Tab Panel"
For "Image Carousel" → alternatives: "Masonry Grid", "Card Grid", "Hero Section"
For "Hamburger Menu" → alternatives: "Off-Canvas Drawer", "Floating Action Button", "Sidebar Navigation"
For "Data Table" → alternatives: "Card Grid", "Activity Feed", "Stats Counter"
For "Banner" → alternatives: "Toast Notification", "Cookie Banner", "Hero Section"
For "Sidebar Navigation" → alternatives: "Off-Canvas Drawer", "Sticky Navbar", "Tab Panel"
For "Footer Section" → alternatives: "Sticky Navbar", "Banner", "Hero Section"
For "Step Progress Indicator" → alternatives: "Progress Bar", "Pagination Control", "Breadcrumb Navigation"
For "Notification Badge" → alternatives: "Toast Notification", "Notification Center", "Avatar"

Return ONLY a raw JSON array with NO other text. The array must contain 
ALL detected phrases. If nothing is vague, return an empty array [].

Example response format (note: ALL terms in this example are from the canonical list above):
[
  {{
    "phrase": "menu that slides from the right",
    "start": 12,
    "end": 44,
    "term": "Off-Canvas Drawer",
    "definition": "A panel that slides in from the viewport edge when triggered.",
    "category": "Navigation",
    "alternatives": [
      {{"term": "Sidebar Navigation", "description": "A vertical panel for secondary navigation."}},
      {{"term": "Bottom Sheet", "description": "A panel that slides up from the bottom of the screen."}},
      {{"term": "Modal Overlay", "description": "A blocking overlay that appears above content."}}
    ]
  }},
  {{
    "phrase": "password strength meter",
    "start": 5,
    "end": 28,
    "term": "Password Strength",
    "definition": "A visual indicator of password complexity and security.",
    "category": "Action",
    "alternatives": [
      {{"term": "Progress Bar", "description": "A linear bar showing completion progress."}},
      {{"term": "Form Input Field", "description": "A text input for entering data."}},
      {{"term": "Login Form", "description": "A form for user authentication."}}
    ]
  }}
]

Important rules:
1. Only flag phrases that EXPLICITLY describe a visual UI component or layout pattern
2. Do NOT flag general greetings, names, casual text, or non-UI content
3. Do NOT flag short phrases under 8 characters
4. Do NOT flag phrases that are just nouns without descriptive context
5. The user must be DESCRIBING a UI component, not just mentioning a word
6. If the input is "Hello world", "test", "hi", or general non-UI text → return []
7. If the input has no clear UI description → return []
8. Skip technical terms users already know (e.g., "button", "form")
9. The phrase field must be an EXACT substring of the input text
10. start and end indices must be accurate
11. Return [] if no vague phrases found
12. Do NOT wrap in markdown. Do NOT add explanation text.

Examples of inputs that should return []:
- "Hello world" → []
- "test" → []
- "I want to build something" → []
- "Make a website" → []

Examples of inputs that should detect phrases:
- "menu that slides out from the right" → detect "menu that slides out from the right"
- "I want a sticky top bar" → detect "sticky top bar"
- "floating blurry popup" → detect "floating blurry popup"

Return only the JSON array."""

    task = Task(
        description=task_description,
        agent=analysis_agent,
        expected_output="A JSON array of detected vague UI phrases with translations.",
    )

    crew = Crew(
        agents=[analysis_agent],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    try:
        result = crew.kickoff()
        return str(result)
    except Exception as e:
        print(f"Error in analyze_sentence: {e}")
        return "ERROR"


VLLM_BASE_URL = os.getenv("VLLM_URL", "http://165.245.128.5:8000/v1/chat/completions")
VLLM_URL = VLLM_BASE_URL
VLLM_FAST_URL = os.getenv("VLLM_FAST_URL", "http://165.245.128.5:30000/v1/chat/completions")
FAST_MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct"
VLLM_MODEL = os.getenv("VLLM_MODEL", "hugging-quants/Meta-Llama-3.1-70B-Instruct-AWQ-INT4")


async def _call_vllm(payload: Dict[str, Any], url: str = VLLM_BASE_URL, model: str = VLLM_MODEL) -> Dict[str, Any]:
    """
    Shared vLLM caller for both fast (8B) and deep (70B) tiers.
    Keeps async httpx client, 120s timeout, and JSON response_format support.
    """
    payload = dict(payload)
    payload["model"] = model
    if "response_format" not in payload:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)


async def run_critic_agent(prompt_text: str) -> Dict[str, Any]:
    """
    Critic Agent: Evaluates prompt quality for AI UI builders.
    Returns score 0-100 with weaknesses and suggestions.
    """
    system_message = """You are the Critic Agent in Forma, a system that helps users write better prompts for AI UI builders like v0 and Lovable.

Score the user's prompt on these dimensions:
- Component clarity (uses canonical UI vocabulary like "Toast", "Modal Dialog", "Sticky Navbar")
- Motion specifications (timing, easing, duration)
- Position anchoring (top-right, fixed, sticky)
- Library hints (Framer Motion, shadcn/ui, Radix)
- Accessibility considerations

Return ONLY valid JSON in this exact format:
{
  "score": <integer 0-100>,
  "tier": "<Vague|Decent|Precise>",
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}

Tier rules: 0-39 = Vague, 40-69 = Decent, 70-100 = Precise."""

    user_message = f"Score this prompt: {prompt_text}"

    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.3,
        "max_tokens": 300,
        "response_format": {"type": "json_object"}
    }

    result = await _call_vllm(payload, url=VLLM_BASE_URL, model=VLLM_MODEL)
    result["metadata"] = {"tier": "deep"}
    return result


async def run_fast_critic_agent(prompt: str) -> Dict[str, Any]:
    """
    Fast-tier Critic Agent on 8B model for realtime usage.
    Targets sub-1.5s end-to-end latency with terse instructions.
    """
    system_message = """You are Forma's fast critic. Score prompt quality for AI UI builders from 0-100 using clarity, concrete component vocabulary, motion/position specificity, and implementation hints; return only JSON with keys score, tier (Vague/Decent/Precise), weaknesses (array), suggestions (array)."""
    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"Score this prompt: {prompt}"}
        ],
        "temperature": 0.2,
        "max_tokens": 200,
        "response_format": {"type": "json_object"}
    }
    result = await _call_vllm(payload, url=VLLM_FAST_URL, model=FAST_MODEL)
    result["metadata"] = {"tier": "fast"}
    return result


async def run_reformulator_agent(prompt_text: str) -> Dict[str, Any]:
    """
    Reformulator Agent: Rewrites vague prompts using canonical UI vocabulary,
    motion specs, position anchors, and library hints.
    """
    system_message = """You are the Reformulator Agent in Forma. Rewrite the user's vague design prompt into a precise, production-grade prompt for AI UI builders like v0 or Lovable.

Apply these transformations:
- Replace vague terms with canonical UI components (e.g., "popup" → "Toast Notification" or "Modal Dialog" or "Glassmorphic Popover")
- Add motion specifications (timing in ms, easing curves like ease-out, cubic-bezier)
- Add position anchors (top-right, fixed, sticky, etc.)
- Suggest libraries (Framer Motion AnimatePresence, shadcn/ui, Radix)
- Add accessibility considerations (aria labels, focus management)

Return ONLY valid JSON in this exact format:
{
  "original": "<original prompt>",
  "reformulated": "<the rewritten prompt>",
  "changes": ["<change 1>", "<change 2>", "<change 3>"],
  "canonical_terms_added": ["<term 1>", "<term 2>"]
}"""

    user_message = f"Reformulate this prompt: {prompt_text}"

    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.4,
        "max_tokens": 400,
        "response_format": {"type": "json_object"}
    }

    result = await _call_vllm(payload, url=VLLM_BASE_URL, model=VLLM_MODEL)
    result["metadata"] = {"tier": "deep"}
    return result


# Mock user style profile (will be derived from real user history later)
MOCK_USER_STYLE = {
    "preferred_components": [
        "Glassmorphic Popover",
        "Sticky Navbar",
        "Hamburger Menu",
        "Toast Notification",
        "Skeleton Loader"
    ],
    "color_palette": ["warm amber #c8b89a", "charcoal #1a1917", "cream #f0ece4"],
    "motion_timing": "200-250ms ease-out",
    "typography": "DM Serif Display for headings, Outfit for body, JetBrains Mono for code",
    "spacing_grid": "8px base, 16px gaps, 24px section padding",
    "design_principles": ["minimal", "warm-neutral", "subtle motion", "high contrast"]
}


async def run_style_agent(prompt_text: str) -> Dict[str, Any]:
    """
    Style Agent: Matches the prompt against the user's accumulated design style.
    Returns matches, conflicts, and personalization suggestions.
    """
    style_context = json.dumps(MOCK_USER_STYLE, indent=2)

    system_message = f"""You are the Style Agent in Forma. You analyze the user's prompt against their accumulated design style preferences and suggest personalization.

The user's design style profile (extracted from their accumulated work):
{style_context}

Analyze the user's prompt and:
- Identify which preferred components match this prompt's intent
- Note any conflicts with the user's style
- Suggest personalizations that align with the user's accumulated taste
- Score how well this prompt aligns with the user's style (0-100)

Return ONLY valid JSON in this exact format:
{{
  "alignment_score": <integer 0-100>,
  "matching_preferences": ["<preference 1>", "<preference 2>"],
  "style_conflicts": ["<conflict if any>"],
  "personalization_suggestions": ["<suggestion 1>", "<suggestion 2>"]
}}"""

    user_message = f"Analyze this prompt against the user's style: {prompt_text}"

    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.4,
        "max_tokens": 350,
        "response_format": {"type": "json_object"}
    }

    result = await _call_vllm(payload, url=VLLM_BASE_URL, model=VLLM_MODEL)
    result["metadata"] = {"tier": "deep"}
    return result


# Mock user history (50 projects across multiple AI builders)
MOCK_USER_HISTORY = [
    {"builder": "v0", "date": "2026-04-15", "components_accepted": ["Glassmorphic Popover", "Sticky Navbar"], "components_rejected": ["Modal Dialog"]},
    {"builder": "v0", "date": "2026-04-18", "components_accepted": ["Sticky Navbar", "Hamburger Menu"], "components_rejected": []},
    {"builder": "Lovable", "date": "2026-04-20", "components_accepted": ["Glassmorphic Popover", "Toast Notification"], "components_rejected": ["Banner Alert"]},
    {"builder": "Cursor", "date": "2026-04-22", "components_accepted": ["Skeleton Loader", "Sticky Navbar"], "components_rejected": []},
    {"builder": "v0", "date": "2026-04-25", "components_accepted": ["Hamburger Menu", "Glassmorphic Popover"], "components_rejected": ["Modal Dialog", "Drawer"]},
    {"builder": "Bolt", "date": "2026-04-28", "components_accepted": ["Toast Notification", "Skeleton Loader"], "components_rejected": []},
    {"builder": "v0", "date": "2026-05-01", "components_accepted": ["Sticky Navbar", "Hamburger Menu", "Glassmorphic Popover"], "components_rejected": []},
    {"builder": "Lovable", "date": "2026-05-03", "components_accepted": ["Glassmorphic Popover"], "components_rejected": ["Modal Dialog"]},
]


async def run_memory_agent(prompt_text: str) -> Dict[str, Any]:
    """
    Memory Agent: Analyzes user's accumulated cross-builder design history
    to surface patterns relevant to the current prompt.
    """
    history_context = json.dumps(MOCK_USER_HISTORY, indent=2)

    system_message = f"""You are the Memory Agent in Forma. You analyze the user's cross-builder design history to identify patterns relevant to their current prompt.

The user's accumulated design history across multiple AI builders (v0, Lovable, Cursor, Bolt):
{history_context}

For the user's current prompt:
- Identify the most-accepted components relevant to this prompt
- Note rejected components (so we don't suggest them again)
- Identify cross-builder patterns (does the user behave consistently across tools?)
- Surface insights about the user's accumulated taste

Return ONLY valid JSON in this exact format:
{{
  "most_used_components": ["<component 1>", "<component 2>"],
  "rejected_components": ["<component 1>"],
  "cross_builder_consistency": "<high|medium|low>",
  "key_insight": "<insight about user's taste>",
  "relevant_past_acceptances": <integer count>
}}"""

    user_message = f"Analyze the user's history relevant to this prompt: {prompt_text}"

    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.4,
        "max_tokens": 350,
        "response_format": {"type": "json_object"}
    }

    result = await _call_vllm(payload, url=VLLM_BASE_URL, model=VLLM_MODEL)
    result["metadata"] = {"tier": "deep"}
    return result


async def run_coach_agent(prompt_text: str, current_output_description: str = None) -> Dict[str, Any]:
    """
    Iteration Coach Agent: Reads AI builder output and suggests specific
    next-prompt fragments to refine it.
    """
    output_context = current_output_description or "User has not yet generated output. Suggest pre-emptive iteration fragments based on common AI builder failure modes."

    system_message = """You are the Iteration Coach Agent in Forma. You help users iterate on AI builder outputs by suggesting specific, copy-paste-ready prompt fragments to fix common issues.

Common AI builder output issues to check for:
- Missing CTA hierarchy (no clear primary action)
- No mobile breakpoints
- Body font too small (under 16px)
- Missing hover states
- No keyboard navigation
- Inconsistent spacing (not on grid)
- Missing loading states
- No error states
- Generic colors instead of brand tokens
- Missing accessibility features (aria, focus management)

For the user's prompt, predict likely issues and provide specific iteration fragments they can submit as their next prompt.

Return ONLY valid JSON in this exact format:
{
  "predicted_issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "iteration_fragments": [
    {
      "issue": "<issue addressed>",
      "fragment": "<copy-paste-ready next-prompt addition>"
    }
  ],
  "priority": "<high|medium|low>"
}"""

    user_message = f"Original prompt: {prompt_text}\n\nCurrent output context: {output_context}"

    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.4,
        "max_tokens": 400,
        "response_format": {"type": "json_object"}
    }

    result = await _call_vllm(payload, url=VLLM_BASE_URL, model=VLLM_MODEL)
    result["metadata"] = {"tier": "deep"}
    return result


async def run_consensus_agent(
    prompt_text: str,
    detector_result: Dict[str, Any] = None,
    critic_result: Dict[str, Any] = None,
    reformulator_result: Dict[str, Any] = None,
    style_result: Dict[str, Any] = None,
    memory_result: Dict[str, Any] = None,
    coach_result: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Consensus Agent: Synthesizes outputs from all 6 specialist agents into
    a final unified recommendation. The arbitrator of the multi-agent system.
    """
    agent_outputs = {
        "detector": detector_result,
        "critic": critic_result,
        "reformulator": reformulator_result,
        "style": style_result,
        "memory": memory_result,
        "coach": coach_result
    }
    
    # Filter out None results
    available_outputs = {k: v for k, v in agent_outputs.items() if v is not None}
    
    outputs_context = json.dumps(available_outputs, indent=2)

    system_message = """You are the Consensus Agent in Forma. You are the final arbitrator in a 7-agent system. Your job is to synthesize outputs from 6 specialist agents into a single unified recommendation for the user.

Specialist agents you arbitrate:
- Detector: finds vague phrases
- Critic: scores prompt quality 0-100
- Reformulator: rewrites with canonical vocabulary
- Style: matches user's design preferences
- Memory: analyzes cross-builder history
- Coach: suggests iteration fragments

Your job:
1. Identify points of agreement across agents
2. Resolve disagreements (e.g., if Style says "use Glassmorphic Popover" but Memory says user usually rejects modals)
3. Produce a single recommended action for the user
4. Explain the reasoning briefly

Return ONLY valid JSON in this exact format:
{
  "agents_aligned": <integer count of agreeing agents>,
  "agents_conflicted": <integer count of conflicting agents>,
  "primary_recommendation": "<single clear action user should take>",
  "supporting_evidence": ["<evidence 1>", "<evidence 2>"],
  "confidence_score": <integer 0-100>,
  "reasoning": "<brief explanation of how consensus was reached>"
}"""

    user_message = f"Original prompt: {prompt_text}\n\nAgent outputs to synthesize:\n{outputs_context}"

    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.3,
        "max_tokens": 450,
        "response_format": {"type": "json_object"}
    }

    result = await _call_vllm(payload, url=VLLM_BASE_URL, model=VLLM_MODEL)
    result["metadata"] = {"tier": "deep"}
    return result

try:
    # existing detector
    from parser import detect_vague_phrases
except ImportError:
    # Fallback so the orchestrator endpoint still works even if detector is unavailable.
    def detect_vague_phrases(text: str):
        return []


async def run_detector_agent_async(prompt_text: str) -> Dict[str, Any]:
    """Async wrapper for the existing detector."""
    try:
        # Use the existing detector logic
        phrases = detect_vague_phrases(prompt_text)
        return {
            "phrases_found": [p.get("phrase", "") for p in phrases] if phrases else [],
            "count": len(phrases) if phrases else 0,
            "detections": phrases or [],
            "metadata": {"tier": "deep"}
        }
    except Exception as e:
        return {"error": str(e), "phrases_found": [], "count": 0, "metadata": {"tier": "deep"}}


async def run_all_agents_parallel(prompt_text: str) -> Dict[str, Any]:
    """
    Orchestrator: Runs all 7 agents in parallel on Llama 3.1 70B AWQ on AMD MI300X.
    
    Specialist agents (run in parallel):
    - Detector: finds vague phrases
    - Critic: scores prompt quality
    - Reformulator: rewrites with canonical vocabulary
    - Style: matches user's design preferences
    - Memory: analyzes cross-builder history
    - Coach: suggests iteration fragments
    
    Then Consensus Agent synthesizes all 6 outputs.
    """
    start_time = time.time()
    
    # Run 6 specialist agents in parallel
    detector_task = run_detector_agent_async(prompt_text)
    critic_task = run_critic_agent(prompt_text)
    reformulator_task = run_reformulator_agent(prompt_text)
    style_task = run_style_agent(prompt_text)
    memory_task = run_memory_agent(prompt_text)
    coach_task = run_coach_agent(prompt_text)
    
    # Use asyncio.gather with return_exceptions to prevent one failure from killing all
    results = await asyncio.gather(
        detector_task,
        critic_task,
        reformulator_task,
        style_task,
        memory_task,
        coach_task,
        return_exceptions=True
    )
    
    # Extract results, replacing exceptions with error dicts
    def safe_result(r):
        if isinstance(r, Exception):
            return {"error": str(r)}
        return r
    
    detector_result = safe_result(results[0])
    critic_result = safe_result(results[1])
    reformulator_result = safe_result(results[2])
    style_result = safe_result(results[3])
    memory_result = safe_result(results[4])
    coach_result = safe_result(results[5])
    
    parallel_latency_ms = int((time.time() - start_time) * 1000)
    
    # Run Consensus Agent with all results
    consensus_start = time.time()
    try:
        consensus_result = await run_consensus_agent(
            prompt_text,
            detector_result=detector_result,
            critic_result=critic_result,
            reformulator_result=reformulator_result,
            style_result=style_result,
            memory_result=memory_result,
            coach_result=coach_result
        )
    except Exception as e:
        consensus_result = {"error": str(e)}
    
    consensus_latency_ms = int((time.time() - consensus_start) * 1000)
    total_latency_ms = int((time.time() - start_time) * 1000)
    
    return {
        "agents": {
            "detector": detector_result,
            "critic": critic_result,
            "reformulator": reformulator_result,
            "style": style_result,
            "memory": memory_result,
            "coach": coach_result,
            "consensus": consensus_result
        },
        "metadata": {
            "parallel_specialists_count": 6,
            "parallel_latency_ms": parallel_latency_ms,
            "consensus_latency_ms": consensus_latency_ms,
            "total_latency_ms": total_latency_ms,
            "model": "Llama 3.1 70B Instruct AWQ-INT4",
            "hardware": "AMD MI300X (192GB HBM3)",
            "runtime": "vLLM 0.17.1 + ROCm 7.0"
        }
    }
