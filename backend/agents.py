import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM

load_dotenv()

AMD_ENDPOINT = os.getenv("AMD_ENDPOINT", "http://129.212.178.153:8000/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "meta-llama/Meta-Llama-3.1-8B-Instruct")

llm = LLM(
    model=f"hosted_vllm/{MODEL_NAME}",
    base_url=AMD_ENDPOINT,
    api_key="not-needed",
    temperature=0,
    max_tokens=400,
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

The professional term must be ONE of these canonical UI components:
Off-Canvas Drawer, Glassmorphic Popover, Masonry Grid, Sticky Navbar, 
Modal Overlay, Skeleton Loader, Tab Panel, Accordion, Toast Notification, 
Breadcrumb Navigation, Tooltip, Dropdown Menu, Progress Bar, Bottom Sheet, 
Confirmation Dialog, Search Bar, Toggle Switch, Loading Spinner, 
Floating Action Button, Hero Section, Card Grid, Pagination Control, 
Image Carousel, Hamburger Menu, Data Table, Banner, Sidebar Navigation, 
Footer Section, Step Progress Indicator, Notification Badge

Return ONLY a raw JSON array with NO other text. The array must contain 
ALL detected phrases. If nothing is vague, return an empty array [].

Example response format:
[
  {{
    "phrase": "menu that slides from the right",
    "start": 12,
    "end": 44,
    "term": "Off-Canvas Drawer",
    "definition": "A panel that slides in from the viewport edge when triggered.",
    "category": "Navigation",
    "alternatives": [
      {{"term": "Side Drawer", "description": "A sliding panel for secondary navigation."}},
      {{"term": "Slide-In Menu", "description": "A menu animating in from the screen edge."}},
      {{"term": "Hamburger Overlay", "description": "A menu revealed by a hamburger icon."}}
    ]
  }}
]

Important rules:
1. Only flag phrases that describe UI components vaguely
2. Skip technical terms users already know (e.g., "button", "form")
3. The phrase field must be an exact substring of the input text
4. start and end indices must be accurate
5. Return [] if no vague phrases found
6. Do NOT wrap in markdown. Do NOT add explanation text.

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
