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
