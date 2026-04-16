# Lexis

## Part 1 — Identity

### Name

Lexis — from Greek *lexis* (word, speech, diction). The root of *lexicon*. A name about choosing the right word. Short, spoken in one breath, and immediately signals vocabulary intelligence.

### Tagline

*"You know what you want. Lexis knows what to call it."*

### What It Is

Lexis is an OS-level desktop assistant that lives in the system tray and silently watches when you type into AI development tools — Cursor, Claude, v0, ChatGPT, Copilot, Midjourney. When you write a vague UI description, Lexis fades in a minimal glassmorphic popup near your cursor showing the professional component term, a micro-animation preview of the component in action, and a one-key accept to swap your words with the precise terminology. The AI then generates exactly what you pictured — on the first try.

### What It Is Not

- Not a prompt template library (rigid, generic, one-size-fits-all)
- Not a grammar checker (Grammarly handles that; Lexis handles *vocabulary*)
- Not a black-box rewriter (you see exactly what changed and why)
- Not locked to one AI platform (works system-wide, any text field, any tool)

### Who It Is For

**Vibe coders.** Designers who code. Rapid prototypers. Indie hackers. Founders building MVPs. Students learning frontend. Anyone who knows exactly what they want their UI to *look like* but doesn't know the name for it. They have taste and vision — they lack the vocabulary to communicate it to a machine.

### Mission

Kill the iteration loop. One prompt, one perfect output — because the input was precise.

### Design Language

The tool itself must embody premium UI craft. If Lexis tells you what good UI vocabulary looks like, it must *look* like good UI.

- Glassmorphic floating panels (frosted blur, subtle borders, depth)
- Micro-animation previews (2-3 second looping clips showing the component behavior)
- Minimal footprint (a dot → a pill → a card → only as much UI as needed)
- Dark mode native, light mode supported
- Typography: Inter or Geist for interface, JetBrains Mono for code terms
- Motion: spring-based easing, 200ms transitions, nothing abrupt

---

## Part 2 — Problem

### The Core Tension

AI coding tools are fast. Vibe coders are fast. But between the user's visual imagination and the AI's code generation, there is a **vocabulary bottleneck**. The user can see the component in their head — a drawer that slides from the right, a card that flips on hover, a menu that blurs the background. But they don't know that these are called an "off-canvas drawer," a "flip card with CSS transform," or a "glassmorphic popover with backdrop-filter." So they type something vague, the AI guesses, and the result is generic or wrong.

### Layer 1: The Vocabulary Gap

Users describe UI in casual language. AI models were trained on MDN, Material Design docs, Tailwind documentation, Stack Overflow — professional vocabulary. There is a direct mismatch.

| User Types | Could Mean | Professional Term |
|---|---|---|
| "floating menu" | Popover? Dropdown? FAB? Drawer? | Depends — each is a different component |
| "cards that move" | Carousel? Marquee? Drag-and-drop? | Horizontal scroll carousel with snap points |
| "blurry background popup" | Modal with backdrop? Glassmorphism? | Glassmorphic popover with backdrop-filter: blur |
| "sticky thing at top" | Fixed header? Sticky nav? App bar? | Sticky navigation bar with scroll-triggered elevation |
| "sidebar that appears" | Drawer? Sidebar? Off-canvas? Sheet? | Off-canvas drawer with push/overlay animation |

When you use the exact professional term, the AI retrieves the exact pattern from its training data. When you use a vague phrase, the AI retrieves the closest guess — which might be wrong.

### Layer 2: The Knowledge Asymmetry

Users cannot use vocabulary they have never encountered. This is not a failure of intelligence — it is a failure of exposure. A designer who has spent years in Figma knows "auto layout" and "constraints" but may not know that the code equivalent involves "CSS Grid with repeat(auto-fill, minmax())." A backend developer building a frontend may not know that "accordion" is a named pattern, or that "skeleton screen" describes the gray placeholder shapes during loading.

**You can't search for a word you don't know exists.** This is the critical asymmetry. Google can't help because you don't know what to Google. Lexis solves this by matching what you *do* say to what you *should* say.

### Layer 3: The Iteration Tax

Because the first prompt is vague, the first output is generic. The user then tries to fix it:
- "no, make it more like glass" → still ambiguous
- "add blur to the background" → AI adds blur to the wrong element
- "like the Apple style popup" → AI doesn't know which Apple popup you mean
- 4-5 iterations later, the user either gets something close enough or gives up

Each iteration costs 15-60 seconds of AI generation time plus mental energy. A single precise prompt would have taken 10 seconds and returned the right result.

### Layer 4: No Visual Reference in Text

UI is inherently visual. But prompts are text. When a user writes "a card that expands," they can picture the animation — the card growing, content fading in, other elements shifting. The AI cannot see this mental image. It has to infer the visual from words alone.

This is why **Lexis shows micro-animation previews alongside terminology suggestions**. The user confirms not just that the word is right, but that the *behavior* is right. They see a 2-second loop of a drawer sliding in, and they either think "yes, exactly that" or "no, I meant more like a modal." The visual closes the gap that text alone cannot.

### The Compound Effect

A vibe coder who lacks vocabulary → writes vague prompts → gets generic output → iterates 5 times → still isn't satisfied → blames the AI → moves slower than they should. The bottleneck is not the AI. The bottleneck is the 3 seconds it would take to swap "floating menu" for "glassmorphic popover with backdrop blur." Lexis is those 3 seconds.

---

## Part 3 — Solution

### Mechanism Overview

```
User types vague phrase in AI tool
         │
         ▼
Lexis detects it (OS accessibility API)
         │
         ▼
Matches against terminology database
         │
         ▼
Glassmorphic popup appears near cursor:
  ┌──────────────────────────────┐
  │  "Off-Canvas Drawer"         │
  │  ┌────────────────────┐      │
  │  │  [micro-animation   │      │
  │  │   of drawer sliding │      │
  │  │   in from right]    │      │
  │  └────────────────────┘      │
  │                              │
  │  Replaces: "menu that        │
  │  slides out from the right"  │
  │                              │
  │  [Tab to accept]  [Esc]      │
  └──────────────────────────────┘
         │
         ▼ (user presses Tab)
         │
Lexis simulates keystrokes:
  1. Select the vague phrase
  2. Replace with precise term
  3. User's cursor returns to flow
         │
         ▼
AI receives precise prompt → generates correct component on first try
```

### The Five Mechanisms

**1. Terminology Database + Intelligent Matching**
Solves: Vocabulary Gap

A curated database of thousands of UI component terms. Each entry includes the canonical name, casual aliases (how a non-expert would say it), vague trigger phrases, domain context, and a specificity score. Matching is multi-layered: exact → fuzzy → semantic embedding.

**2. Micro-Animation Visual Previews**
Solves: No Visual Reference in Text

Every component term in the database links to a 2-3 second looping animation showing the component's behavior. When Lexis suggests "off-canvas drawer," you don't just see the words — you see a drawer sliding in. This confirms the match is correct before you accept it.

**3. Inline Replacement via Keystroke Simulation**
Solves: Iteration Tax

One keypress (Tab) replaces the vague phrase with the precise term. No copy-paste, no switching apps, no breaking flow. Lexis caches the clipboard, simulates the deletion + insertion via OS-level input, and restores the clipboard. The user stays in their editor.

**4. Contextual Education**
Solves: Knowledge Asymmetry

Every suggestion card includes a brief definition and a "learn more" expansion. Users build vocabulary passively by using Lexis. Over weeks, they start typing the professional terms directly — Lexis has taught them.

**5. User Profile + Context Injection**
Solves: Repetition (future feature)

A stored profile (preferred framework, design system, constraints) that can optionally inject context into the replacement. "Off-canvas drawer" becomes "off-canvas drawer using Tailwind CSS with framer-motion slide animation."

### The User Journey (Step by Step)

1. **Install & Setup**: User installs Lexis. First-run wizard asks: What tools do you use? (Cursor, v0, Claude, etc.) What framework? (React, Vue, Svelte?) What design aesthetic do you prefer? (Material, Apple-esque, Glassmorphic, Minimal?)

2. **Passive Listening**: Lexis sits in the system tray. Zero CPU usage until a whitelisted app gets focus.

3. **Context Detection**: User opens Cursor (or v0 in Chrome, or Claude). Lexis detects the active process/URL and wakes up.

4. **Typing + Trigger**: User types: *"Build a menu that slides out from the right side of the screen when I click the gear icon."* Lexis identifies the vague fragment: *"menu that slides out from the right side."*

5. **The Dot**: A subtle glassmorphic indicator dot (8px, pulsing gently) appears below or beside the vague text. Non-intrusive. The user can ignore it entirely.

6. **The Expansion**: If the user pauses typing for 800ms or hovers near the dot, it expands into a sleek popup:
   - **Term**: "Off-Canvas Drawer"
   - **Animation**: A tiny looping preview showing a drawer sliding in from the right
   - **Definition**: "A panel that slides into view from the edge of the screen, overlaying or pushing the main content."
   - **Accept shortcut**: Tab or click

7. **The Swap**: User presses Tab. Lexis:
   - Caches the current clipboard
   - Selects the vague phrase in the text field (via accessibility API text ranges or keyboard simulation)
   - Types/pastes the replacement: *"off-canvas drawer anchored to the right side of the screen"*
   - Restores the original clipboard
   - The popup fades out (150ms)

8. **The Result**: The prompt now reads: *"Build an off-canvas drawer anchored to the right side of the screen, triggered by a gear icon button."* The AI generates a production-ready drawer component on the first try.

---

## Part 4 — Structure

### Product Layers

```
┌────────────────────────────────────────────────────────┐
│                    THE EYES                             │
│           OS-level detection and monitoring             │
│                                                        │
│  Accessibility APIs → Active app detection →            │
│  Text field focus → Keystroke/text monitoring →          │
│  Cursor position tracking (X/Y pixel coordinates)       │
└────────────────────────┬───────────────────────────────┘
                         │  raw text + cursor position + app context
                         ▼
┌────────────────────────────────────────────────────────┐
│                    THE BRAIN                            │
│           Local analysis and matching engine            │
│                                                        │
│  Text segmentation → Vague phrase detection →           │
│  Multi-layer term matching (exact/fuzzy/semantic) →     │
│  Context disambiguation → Confidence scoring →          │
│  Suggestion assembly with animation asset reference     │
└────────────────────────┬───────────────────────────────┘
                         │  suggestion{term, animation, position, confidence}
                         ▼
┌────────────────────────────────────────────────────────┐
│                    THE FACE                             │
│           Glassmorphic overlay UI                       │
│                                                        │
│  Indicator dot → Popup expansion → Animation preview →  │
│  Accept/dismiss interaction → Smooth transitions        │
└────────────────────────┬───────────────────────────────┘
                         │  user accepted term
                         ▼
┌────────────────────────────────────────────────────────┐
│                    THE HANDS                            │
│           OS-level text replacement                     │
│                                                        │
│  Clipboard cache → Text selection → Phrase deletion →   │
│  Term insertion (paste simulation) → Clipboard restore  │
└────────────────────────────────────────────────────────┘
```

### Suggestion Categories

| Category | Color | What It Catches | Example |
|---|---|---|---|
| **Component** | Amber | Vague descriptions of UI elements that have precise names | *"floating box"* → *"Popover"* |
| **Pattern** | Cyan | Vague descriptions of layout or interaction patterns | *"cards in rows"* → *"Masonry Grid Layout"* |
| **Style** | Violet | Vague aesthetic descriptions that have named design approaches | *"blurry glass look"* → *"Glassmorphism with backdrop-filter"* |
| **Motion** | Green | Vague animation descriptions that have named transitions | *"slides in"* → *"Slide-in transition with ease-out curve"* |

### UI Component Hierarchy

```
Level 0: Nothing visible
  └─ Lexis is monitoring but no vague phrase detected

Level 1: The Dot
  └─ 8px glassmorphic circle near the vague phrase
  └─ Appears after phrase detection + 300ms delay
  └─ Pulses gently (opacity 0.6 → 0.8 → 0.6, 2s cycle)

Level 2: The Pill
  └─ Dot expands to pill shape showing the term name
  └─ Triggered by: typing pause (800ms) or cursor proximity
  └─ Shows: "[Icon] Off-Canvas Drawer  [Tab ↵]"

Level 3: The Card
  └─ Pill expands to full suggestion card
  └─ Triggered by: hover on pill or click
  └─ Shows: term name + animation preview + definition + accept/dismiss

Level 4: The Panel (future)
  └─ Full sidebar showing all suggestions for the current prompt
  └─ Triggered by: keyboard shortcut (Ctrl+Shift+L) or widget click
  └─ Shows: all suggestions + clarity score + structure gaps
```

---

## Part 5 — Gap and Filling

### What Exists Today

| Product | What It Does | Where It Falls Short |
|---|---|---|
| **Grammarly** | System-wide writing assistant for grammar, tone, clarity | Zero awareness of AI prompts or technical vocabulary. Optimizes for human readers, not AI interpreters. No visual previews. |
| **PromptPerfect** | Web tool that rewrites prompts for various AI models | Web-only. Black-box rewrite — user doesn't see what changed or learn vocabulary. No desktop presence. No component knowledge. |
| **Cursor** | AI code editor with prompt input | Powerful but expects the user to already know terminology. No inline suggestions for vague phrases. No visual previews of what components look like. |
| **v0 by Vercel** | AI UI generator from text prompts | Generates UI but provides no feedback about prompt quality. If the prompt is vague, the output is generic. No vocabulary assistance. |
| **ChatGPT / Claude** | General AI assistants | They'll generate whatever you ask, but they respond to vague input with vague output. No system to help you write a better prompt before you submit it. |
| **Snippet managers** (Raycast, TextExpander) | Store and expand text shortcuts | No intelligence. You must manually create every snippet. No contextual matching, no visual previews, no learning. |
| **Prompt engineering courses** | Teach prompt writing best practices | Static. Not in your workflow. Users forget or can't apply knowledge at speed. |

### The Six Gaps

**Gap 1: No system-wide prompt vocabulary assistant.**
Grammarly is system-wide for grammar. Nothing is system-wide for *prompt vocabulary*. Every tool that helps with prompts is locked inside a single browser tab or app.

**Gap 2: No product maps casual UI descriptions to professional terminology.**
The idea of a curated database that connects "blurry background popup" → "glassmorphic popover with backdrop-filter: blur" — with aliases, vague triggers, contextual disambiguation, and confidence scoring — does not exist.

**Gap 3: No product shows what a component *looks like* alongside the term.**
UI is visual. Text alone cannot confirm that "off-canvas drawer" matches what the user pictured in their head. No tool shows a 2-second animation preview at the moment of suggestion. This is the differentiator.

**Gap 4: No product teaches UI vocabulary in context.**
Grammarly teaches grammar rules at the moment of error. Nothing teaches *frontend component vocabulary* at the moment of vague prompting. Users learn by accident or by reading docs — never at the point of need.

**Gap 5: No product provides pre-submit prompt quality feedback.**
Users have no signal that their prompt is vague *before* they send it. They discover the problem after 30 seconds of generation time and a wrong result. There is no "clarity score" or "ambiguity indicator" for prompts.

**Gap 6: No product learns your personal vocabulary over time.**
Your framework preferences, your design system, your naming conventions — no tool adapts its suggestions to your specific workflow.

### How Lexis Fills Each Gap

| Gap | Lexis Filling |
|---|---|
| No system-wide assistant | OS-level app using Accessibility APIs, monitors any whitelisted text field |
| No terminology mapping | Curated DB with canonical names, aliases, vague triggers, embeddings — multi-layer matching |
| No visual preview | Micro-animation assets for every term — 2-3 second loops showing component behavior |
| No contextual education | Every suggestion card includes definition + "learn more" + the animation confirms understanding |
| No pre-submit feedback | Indicator dot appears on vague phrases *before* the user submits — catches ambiguity early |
| No personal learning | Accept/reject logging, user profile adaptation, preference memory across sessions |

---

## Part 6 — Technical Architecture

### 6.1 Application Shell

**Framework:** Tauri v2 (Rust backend + WebView2 frontend)

| Reason | Detail |
|---|---|
| Binary size | ~5-8 MB vs Electron's ~150 MB |
| Memory usage | ~30 MB idle vs Electron's ~100 MB+ |
| OS integration | Rust has first-class Windows API bindings (windows-rs crate) |
| Security | Sandboxed WebView, no full Node.js runtime exposed |
| Performance | Rust backend handles OS hooks and NLP pipeline at native speed |
| Auto-update | Built-in Tauri updater with differential downloads |

**Runtime model:**
- System startup → Tauri app launches → minimizes to system tray
- Idle: ~30 MB RAM, <0.5% CPU
- Active (monitoring a text field): ~80-150 MB RAM (NLP models loaded), ~2-5% CPU during analysis
- Models loaded on-demand: only when a prompt-eligible text field is focused
- Models unloaded after 60s of inactivity

### 6.2 The Eyes — OS-Level Detection

#### Windows: UI Automation API

```
Technology: windows-rs crate → IUIAutomation COM interface

Initialization:
  1. CoInitializeEx(COINIT_MULTITHREADED)
  2. CoCreateInstance → IUIAutomation
  3. AddFocusChangedEventHandler → callback

Focus Change Callback:
  1. Receive IUIAutomationElement for newly focused element
  2. Check element.CurrentControlType:
     - UIA_EditControlTypeId (text input)
     - UIA_DocumentControlTypeId (rich text / code editor)
     - If neither → ignore, return early
  3. Get element.CurrentProcessId → process name via OpenProcess
  4. Check process against whitelist:
     - "Cursor.exe", "Code.exe" (VS Code), "chrome.exe", "msedge.exe",
       "firefox.exe", "Arc.exe", etc.
     - For browsers: additionally check window title or use UI Automation
       tree to find URL bar content → match against URL patterns
       (chat.openai.com, claude.ai, v0.dev, etc.)
  5. If whitelisted → begin monitoring this element

Text Monitoring (active element):
  1. Query IUIAutomationTextPattern or IUIAutomationValuePattern
  2. Start debounce timer (500ms after last text change)
  3. On debounce fire:
     a. Read current text via GetText(-1) or CurrentValue
     b. Compute diff against last captured text
     c. If diff contains new/changed content → send to The Brain
  4. Track caret position:
     a. IUIAutomationTextPattern → GetSelection → GetBoundingRectangles
     b. Returns pixel coordinates for overlay positioning

Text Replacement (on suggestion accept):
  1. Cache user's clipboard (GetClipboardData)
  2. Calculate text range of the vague phrase
  3. Strategy A (preferred): IUIAutomationTextPattern
     → Select(vague_phrase_range) → simulate Ctrl+V with replacement text
  4. Strategy B (fallback): Keyboard simulation
     → Navigate cursor to phrase start
     → Shift+End or Shift+Arrow to select
     → Send replacement text via SendInput
  5. Restore original clipboard (SetClipboardData)
```

#### macOS: Accessibility API

```
Technology: objc2 crate → AXUIElement API

Initialization:
  1. Check AXIsProcessTrusted() → if false, prompt user for accessibility permission
  2. Create AXObserver for kAXFocusedUIElementChangedNotification
  3. Add observer to CFRunLoop

Focus Change:
  1. AXUIElementCopyAttributeValue(focused, kAXRoleAttribute) → check for AXTextField / AXTextArea
  2. Get PID → NSRunningApplication → bundleIdentifier
  3. Match against whitelist (com.cursor.*, com.google.Chrome, etc.)
  4. For browsers: read URL from accessibility tree

Text Monitoring:
  1. AXUIElementCopyAttributeValue(element, kAXValueAttribute) → current text
  2. Debounce + diff + send to Brain

Text Replacement:
  1. Cache pasteboard
  2. AXUIElementSetAttributeValue(element, kAXSelectedTextRangeAttribute, range)
  3. Set pasteboard to replacement text
  4. CGEventPost(Cmd+V)
  5. Restore pasteboard
```

#### Prompt Detection Heuristic

Not every text field is a prompt. A Google search bar, a Slack message, an email subject line — these are not prompts.

```
Scoring:

+50  Active process/URL is a known AI tool
     (Cursor, v0.dev, chat.openai.com, claude.ai, etc.)

+20  Text field is the primary input area
     (large textarea, not a search bar or filename field)
     Detected by: element size, role, label, position in UI tree

+15  Text contains imperative verbs
     ("build", "create", "make", "design", "generate", "add")

+10  Text length > 30 characters

+5   Text contains UI-related nouns
     ("button", "page", "menu", "sidebar", "header", etc.)

Threshold:
  70+  → Active mode: full analysis and suggestions
  50-69 → Passive mode: show dot only on high-confidence matches
  <50  → Silent: do not activate
```

### 6.3 The Brain — Analysis and Matching Pipeline

```
Input: {text_diff, full_text, cursor_position, app_context}

  ┌──────────────────────────────────────────────┐
  │  STAGE 1: SEGMENTATION                       │
  │                                              │
  │  Split text into segments:                    │
  │  • Sentence boundaries                        │
  │  • Clause boundaries (comma, "and", "with")   │
  │  • Each segment is analyzed independently     │
  │                                              │
  │  "Build a menu that slides out from the       │
  │   right side when I click the gear icon"      │
  │       ↓                                      │
  │  Segment 1: "Build a menu that slides out     │
  │              from the right side"             │
  │  Segment 2: "when I click the gear icon"      │
  └─────────────────────┬────────────────────────┘
                        │
  ┌─────────────────────▼────────────────────────┐
  │  STAGE 2: PHRASE EXTRACTION                   │
  │                                              │
  │  Extract noun phrases and descriptive phrases │
  │  using lightweight POS tagging:               │
  │                                              │
  │  • "a menu that slides out from the right     │
  │     side" → candidate phrase                  │
  │  • "the gear icon" → candidate phrase         │
  │                                              │
  │  Classification per phrase:                   │
  │  • KNOWN: matches a term exactly → skip       │
  │  • VAGUE: no exact match, contains generic    │
  │    words ("thing", "stuff", "menu") → analyze │
  │  • DESCRIPTIVE: multi-word description that   │
  │    could map to a named component → analyze   │
  └─────────────────────┬────────────────────────┘
                        │
  ┌─────────────────────▼────────────────────────┐
  │  STAGE 3: MULTI-LAYER TERM MATCHING           │
  │                                              │
  │  For each VAGUE or DESCRIPTIVE phrase:        │
  │                                              │
  │  Layer A — Exact + Alias Lookup               │
  │  Query: SELECT * FROM terms                   │
  │         WHERE canonical_name = phrase          │
  │         OR aliases LIKE '%phrase%'             │
  │  Speed: <1ms (indexed)                        │
  │  Confidence: 1.0 if matched                   │
  │                                              │
  │  Layer B — Full-Text Search                   │
  │  Query: SELECT * FROM terms_fts               │
  │         WHERE terms_fts MATCH phrase           │
  │  Speed: <5ms                                  │
  │  Confidence: 0.6-0.9 based on FTS rank        │
  │                                              │
  │  Layer C — Vague Pattern Lookup               │
  │  Query: SELECT * FROM vague_patterns           │
  │         WHERE phrase LIKE pattern              │
  │         (+ fuzzy matching via trigrams)        │
  │  Speed: <10ms                                 │
  │  Confidence: from the pattern's stored scores  │
  │                                              │
  │  Layer D — Semantic Embedding Search           │
  │  Process:                                      │
  │    1. Embed the phrase with local model        │
  │    2. Vector similarity search via sqlite-vss  │
  │    3. Top-5 results above cosine threshold 0.7 │
  │  Speed: ~50ms (embedding) + <5ms (search)     │
  │  Confidence: cosine similarity score           │
  │                                              │
  │  Merge results from all layers:                │
  │  • Deduplicate by term_id                      │
  │  • Final score = max(layer_scores)             │
  │    × term.specificity × term.adoption          │
  │  • Rank by final score descending              │
  └─────────────────────┬────────────────────────┘
                        │
  ┌─────────────────────▼────────────────────────┐
  │  STAGE 4: CONTEXT DISAMBIGUATION              │
  │                                              │
  │  If top candidate confidence > 0.85:          │
  │    → use directly (high certainty)            │
  │                                              │
  │  If 2+ candidates between 0.5 and 0.85:      │
  │    Apply context signals to re-rank:          │
  │                                              │
  │    Signal 1: App context                      │
  │    Cursor/VS Code → code-oriented terms       │
  │    Figma → design-oriented terms              │
  │    Midjourney → visual/art terms              │
  │                                              │
  │    Signal 2: Surrounding text                 │
  │    Other words in the prompt narrow domain    │
  │    "...with React" → React ecosystem terms    │
  │    "...landing page" → marketing UI terms     │
  │                                              │
  │    Signal 3: User profile                     │
  │    Framework preference, design system,        │
  │    historical accept/reject data              │
  │                                              │
  │    Signal 4: Co-occurring terms               │
  │    If another suggestion in this prompt was    │
  │    from domain X, prefer domain X here too    │
  │                                              │
  │  If still ambiguous (no candidate > 0.7       │
  │  after context):                              │
  │    → show top 2-3 candidates as options       │
  │      in the suggestion card                   │
  └─────────────────────┬────────────────────────┘
                        │
  ┌─────────────────────▼────────────────────────┐
  │  STAGE 5: SUGGESTION ASSEMBLY                 │
  │                                              │
  │  For each resolved match:                     │
  │  {                                            │
  │    original_span: [start_char, end_char],     │
  │    original_text: "menu that slides out       │
  │                    from the right side",      │
  │    replacement: "off-canvas drawer anchored   │
  │                  to the right side",          │
  │    term: {                                    │
  │      canonical: "Off-Canvas Drawer",          │
  │      definition: "A panel that slides into    │
  │        view from the edge of the viewport,    │
  │        overlaying or pushing main content.",  │
  │      animation_asset: "drawer-slide-right.   │
  │        webm",                                 │
  │    },                                         │
  │    category: "component",                     │
  │    confidence: 0.91,                          │
  │    cursor_position: {x: 482, y: 310}          │
  │  }                                            │
  │                                              │
  │  → Send to The Face for rendering             │
  └──────────────────────────────────────────────┘
```

### 6.4 Terminology Database

#### Storage Engine

**SQLite** with two extensions:
- **FTS5** — full-text search for fuzzy text matching
- **sqlite-vss** — vector similarity search for semantic embedding matching

**Location:** `{app_data}/lexis/terminology.db` — fully local, no cloud dependency for core functionality.

#### Schema

```sql
CREATE TABLE terms (
    id              TEXT PRIMARY KEY,
    canonical_name  TEXT NOT NULL UNIQUE,
    domain          TEXT NOT NULL,
    subdomain       TEXT,
    description     TEXT NOT NULL,
    aliases         TEXT NOT NULL,           -- JSON array
    vague_triggers  TEXT NOT NULL,           -- JSON array
    context_keywords TEXT NOT NULL,          -- JSON array
    related_terms   TEXT NOT NULL,           -- JSON array of term IDs
    specificity     REAL NOT NULL DEFAULT 0.5,
    adoption        REAL NOT NULL DEFAULT 0.5,
    example_prompt  TEXT,                    -- example usage in a prompt
    animation_asset TEXT,                    -- filename: "drawer-slide-right.webm"
    source_url      TEXT,                    -- link to official docs
    pack_id         TEXT NOT NULL REFERENCES packs(id),
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE vague_patterns (
    id              TEXT PRIMARY KEY,
    pattern         TEXT NOT NULL,
    candidates      TEXT NOT NULL,           -- JSON: [{term_id, confidence, context_hint}]
    disambig_prompt TEXT,                    -- question to show if ambiguous
    domain_hint     TEXT
);

CREATE TABLE term_embeddings (
    term_id         TEXT PRIMARY KEY REFERENCES terms(id),
    embedding       BLOB NOT NULL            -- float32 vector
);

CREATE TABLE user_prefs (
    term_id         TEXT REFERENCES terms(id),
    action          TEXT NOT NULL,           -- "always_use" | "never_suggest" | "custom_alias"
    custom_value    TEXT,
    context         TEXT,
    created_at      TEXT NOT NULL,
    PRIMARY KEY (term_id, action)
);

CREATE TABLE interactions (
    id              TEXT PRIMARY KEY,
    term_id         TEXT REFERENCES terms(id),
    category        TEXT NOT NULL,
    action          TEXT NOT NULL,           -- "accepted" | "rejected" | "modified"
    original_text   TEXT NOT NULL,
    replacement     TEXT,
    app_context     TEXT,
    timestamp       TEXT NOT NULL
);

CREATE TABLE packs (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    version         TEXT NOT NULL,
    term_count      INTEGER NOT NULL,
    installed_at    TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_terms_domain ON terms(domain);
CREATE INDEX idx_terms_pack ON terms(pack_id);
CREATE INDEX idx_interactions_term ON interactions(term_id);

-- Full-text search
CREATE VIRTUAL TABLE terms_fts USING fts5(
    canonical_name, aliases, vague_triggers, description,
    content='terms', content_rowid='rowid'
);
```

#### Domain Packs

| Pack | Count (target) | Example Terms | Sources |
|---|---|---|---|
| `ui-components` | 500+ | Modal, Drawer, Toast, Popover, Accordion, Carousel, Skeleton | MDN, Material Design, Radix, shadcn/ui |
| `layout-patterns` | 200+ | Masonry Grid, Holy Grail, Sidebar Layout, Split View, Sticky Footer | CSS spec, Tailwind docs, Every Layout |
| `design-styles` | 150+ | Glassmorphism, Neumorphism, Brutalism, Bento Grid, Claymorphism | Design trend documentation, Dribbble patterns |
| `interaction-patterns` | 200+ | Infinite Scroll, Pull-to-Refresh, Drag-and-Drop, Swipe-to-Dismiss | NNGroup, UX pattern libraries |
| `animation-terms` | 150+ | Spring Animation, Stagger, Parallax Scroll, Morph Transition, Ease-Out | Framer Motion docs, GSAP docs, animation literature |
| `design-tokens` | 200+ | Color Palette, Type Scale, Spacing System, Elevation Shadow, Border Radius | Design Systems documentation |
| `architecture` | 200+ | REST API, Server Component, Middleware, Route Guard, State Machine | Framework docs, architecture guides |
| `image-gen` | 300+ | Depth of Field, Rim Lighting, Isometric View, Low Poly, Cel Shading | Midjourney/SD documentation, photography terms |

#### Animation Assets

Each term with a visual component gets a **micro-animation asset**:

```
Format: WebM (VP9) or Lottie JSON
Duration: 2-3 seconds, looping
Resolution: 200x150 px (2x for HiDPI)
Size budget: <100 KB per asset (WebM), <20 KB (Lottie)
Storage: {app_data}/lexis/animations/{pack_id}/{term_id}.webm

Example:
  animations/ui-components/off-canvas-drawer.webm    → drawer slides in from right
  animations/ui-components/modal-dialog.webm         → modal fades in with backdrop
  animations/ui-components/toast-notification.webm   → toast slides up from bottom
  animations/design-styles/glassmorphism.webm        → glass panel with blur effect
  animations/interaction/drag-and-drop.webm          → card being dragged between columns
```

Generation strategy:
- Phase 1: Hand-craft 100 core animations (most common components) in Lottie
- Phase 2: Generate remaining via programmatic CSS/canvas recordings
- Phase 3: Community contributions for niche terms

### 6.5 The Face — Overlay UI

#### Window Architecture

```
Tauri creates a secondary frameless window:
  - decorations: false
  - transparent: true
  - always_on_top: true
  - skip_taskbar: true
  - focused: false (never steals focus from the user's editor)

The window covers the area near the active text field.
All non-UI areas are click-through (pointer-events: none on the body,
pointer-events: auto only on UI elements).
```

#### Frontend Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | SolidJS | Smallest bundle (~7 KB), fastest reactivity, no virtual DOM overhead |
| Styling | Vanilla CSS + CSS variables | Full control over glassmorphic effects, no framework overhead |
| Animation | CSS transitions + Web Animations API | Native browser animation, no library needed for simple transitions |
| Animation playback | `<video>` for WebM, lottie-web for Lottie | Standard playback, hardware accelerated |
| State | SolidJS signals + Tauri event system | Reactive state from Rust → UI via Tauri events |

#### The Glassmorphic Popup (CSS)

```css
.lexis-card {
  background: rgba(20, 20, 30, 0.72);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  color: #e8e8ec;
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 16px;
  max-width: 320px;
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.lexis-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(120, 180, 255, 0.7);
  backdrop-filter: blur(8px);
  animation: lexis-pulse 2s ease-in-out infinite;
}

@keyframes lexis-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.15); }
}

.lexis-animation-preview {
  width: 200px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  margin: 10px 0;
}
```

### 6.6 The Hands — Text Replacement

```
Input: {original_span, replacement_text, element_ref}

Step 1: Cache clipboard
  Windows: OpenClipboard → GetClipboardData(CF_UNICODETEXT) → store
  macOS: NSPasteboard.general.string(forType: .string) → store

Step 2: Select the original phrase
  Strategy A (UI Automation text range):
    Get IUIAutomationTextRange for the original span
    → TextRange.Select()
    This highlights the exact phrase in the text field

  Strategy B (keyboard simulation fallback):
    Navigate to span start position
    → Send Shift+Right Arrow × (span length) via SendInput
    This selects character by character

Step 3: Replace
  Set clipboard to replacement_text
  → Send Ctrl+V (Windows) / Cmd+V (macOS) via SendInput / CGEvent
  The paste replaces the selected text

Step 4: Restore clipboard
  Set clipboard back to cached content
  Delay 100ms to ensure paste completes before restore

Step 5: Confirm
  Re-read the text field to verify the replacement was applied
  If mismatch → log error, do not retry (avoid infinite loops)
```

### 6.7 User Profile

```
Location: {app_data}/lexis/profile.json

{
  "role": "frontend_developer",
  "experience": "intermediate",
  "frameworks": {
    "frontend": "react",
    "styling": "tailwind",
    "animation": "framer-motion",
    "design_system": "shadcn"
  },
  "aesthetic_preference": "minimal_modern",
  "active_packs": ["ui-components", "layout-patterns", "design-styles", "animation-terms"],
  "whitelisted_apps": [
    {"name": "Cursor", "process": "Cursor.exe"},
    {"name": "VS Code", "process": "Code.exe"},
    {"name": "ChatGPT", "process": "chrome.exe", "url": "chat.openai.com"},
    {"name": "Claude", "process": "chrome.exe", "url": "claude.ai"},
    {"name": "v0", "process": "chrome.exe", "url": "v0.dev"}
  ],
  "suggestion_threshold": 0.65,
  "auto_accept_threshold": null,
  "show_animations": true,
  "expand_delay_ms": 800,
  "theme": "dark"
}
```

### 6.8 Learning Loop

```
Every interaction is logged to the interactions table.

On Accept:
  1. Record (term_id, "accepted", original_text, app_context, timestamp)
  2. Boost term confidence: for this specific vague phrase pattern,
     increase the stored confidence by 0.02 (capped at 1.0)
  3. If user checked "always apply" → add to user_prefs as "always_use"

On Reject:
  1. Record (term_id, "rejected", original_text, app_context, timestamp)
  2. Decrease confidence for this pattern by 0.05 (floored at 0.0)
  3. If rejected 3+ times for same phrase → auto-suppress for this user

On Modify (user edits suggestion text):
  1. Record (term_id, "modified", original_text, user_modified_text)
  2. The user's modified text becomes a candidate new alias
  3. If 3+ users modify the same term the same way → add alias to the pack

Weekly Re-ranking:
  1. Recompute per-user confidence adjustments from interaction history
  2. Flag terms with >50% rejection rate for review
  3. Identify uncovered phrases (vague text where no suggestion was made)
     → queue as candidates for new vague_patterns entries
```

### 6.9 Local NLP Models

| Model | Purpose | Size | Runtime |
|---|---|---|---|
| Tokenizer | Word tokenization and sentence splitting | ~2 MB | Rust (tokenizers crate) |
| POS Tagger | Part-of-speech tagging for noun phrase extraction | ~5 MB | ONNX Runtime (ort crate) |
| Embedding | Semantic similarity (all-MiniLM-L6-v2) | ~80 MB | ONNX Runtime |
| Intent | Is this a prompt? What domain? (fine-tuned DistilBERT) | ~20 MB | ONNX Runtime |

Total on-disk: ~107 MB
RAM when active: ~150 MB (all models loaded)
RAM when idle: ~30 MB (models unloaded)
Load time: ~1.5s (cold load on first prompt detection)

### 6.10 Technology Map

| Component | Technology | Justification |
|---|---|---|
| App shell | Tauri v2 | Tiny binary, native Rust, secure sandboxing |
| Backend | Rust | Performance for OS hooks + NLP, memory safety, no GC pauses |
| Frontend | SolidJS + TypeScript | Tiny bundle, fast rendering, reactive signals |
| Overlay | WebView2 (Win) / WebKit (Mac) | No bundled Chromium, native webview |
| Database | SQLite + FTS5 + sqlite-vss | Local-first, full-text + vector search, zero config |
| NLP | tokenizers + ort (ONNX Runtime) | Run ML models locally in Rust, optional GPU |
| Fuzzy match | strsim + tantivy | Levenshtein + trigram + full-text in Rust |
| OS hooks (Win) | windows-rs | Official Microsoft Rust bindings for UI Automation |
| OS hooks (Mac) | objc2 + accessibility | Rust bindings for macOS Accessibility API |
| LLM (Level 3) | Claude API | Best quality for optional full prompt rewrite |
| Animations | Lottie + WebM | Lightweight, loopable, hardware-accelerated |
| Build | GitHub Actions + Tauri bundler | Cross-platform CI, code signing, auto-update |

### 6.11 Project Structure

```
lexis/
├── src-tauri/                          # Rust backend
│   ├── src/
│   │   ├── main.rs                     # Entry point, Tauri setup, system tray
│   │   ├── eye/                        # The Eyes — OS detection
│   │   │   ├── mod.rs
│   │   │   ├── windows.rs              # Windows UI Automation
│   │   │   ├── macos.rs                # macOS Accessibility API
│   │   │   ├── detector.rs             # Prompt detection heuristic
│   │   │   └── differ.rs              # Text diff engine
│   │   ├── brain/                      # The Brain — analysis pipeline
│   │   │   ├── mod.rs
│   │   │   ├── segmenter.rs            # Text segmentation
│   │   │   ├── extractor.rs            # Phrase extraction + POS tagging
│   │   │   ├── matcher.rs              # Multi-layer term matching
│   │   │   ├── context.rs              # Context disambiguation
│   │   │   ├── embeddings.rs           # ONNX embedding model interface
│   │   │   └── scorer.rs              # Confidence scoring
│   │   ├── face/                       # The Face — UI coordination
│   │   │   ├── mod.rs
│   │   │   ├── overlay.rs              # Overlay window lifecycle
│   │   │   └── positioning.rs          # Smart screen positioning
│   │   ├── hands/                      # The Hands — text replacement
│   │   │   ├── mod.rs
│   │   │   ├── clipboard.rs            # Clipboard cache/restore
│   │   │   ├── selection.rs            # Text range selection
│   │   │   └── injection.rs            # Keystroke simulation
│   │   ├── db/                         # Database layer
│   │   │   ├── mod.rs
│   │   │   ├── schema.rs               # Migrations
│   │   │   ├── terms.rs                # Term queries
│   │   │   ├── patterns.rs             # Vague pattern queries
│   │   │   ├── vectors.rs              # Vector search
│   │   │   ├── profile.rs              # User profile
│   │   │   └── learning.rs             # Interaction log + re-rank
│   │   └── commands.rs                 # Tauri IPC: Rust ↔ Frontend
│   ├── models/                         # ONNX model files
│   ├── packs/                          # Default terminology packs (JSON)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                                # Frontend (SolidJS)
│   ├── App.tsx
│   ├── components/
│   │   ├── Dot.tsx                     # Level 0: indicator dot
│   │   ├── Pill.tsx                    # Level 1: term name pill
│   │   ├── Card.tsx                    # Level 2: full suggestion card
│   │   ├── AnimationPreview.tsx        # Micro-animation player
│   │   ├── Panel.tsx                   # Level 3: all-suggestions panel
│   │   ├── Settings.tsx                # Settings view
│   │   └── Onboarding.tsx              # First-run wizard
│   ├── styles/
│   │   ├── glass.css                   # Glassmorphic design tokens
│   │   └── overlay.css                 # Overlay positioning
│   └── lib/
│       ├── ipc.ts                      # Tauri IPC bindings
│       ├── types.ts                    # TypeScript types
│       └── store.ts                    # SolidJS reactive state
├── animations/                         # Micro-animation source files
│   ├── lottie/                         # Lottie JSON source files
│   └── webm/                           # Rendered WebM files
├── scripts/
│   ├── build-packs.py                  # Scrape docs → term packs
│   ├── generate-aliases.py             # LLM-generate aliases + triggers
│   ├── compute-embeddings.py           # Compute term embeddings
│   └── record-animations.py            # Programmatic animation recording
├── tests/
│   ├── prompts/                        # Vague prompt test suite
│   ├── matching/                       # Term matching accuracy
│   └── integration/                    # End-to-end pipeline tests
├── package.json
└── tsconfig.json
```

---

## Build Phases

| Phase | Name | Deliverable |
|---|---|---|
| **0** | Skeleton | Tauri app shell, system tray icon, SQLite database with schema, 50 hand-curated terms with aliases and vague triggers |
| **1** | The Brain (CLI) | Text segmentation, phrase extraction, multi-layer matching (exact + fuzzy + FTS), confidence scoring — testable via CLI, no UI yet |
| **2** | The Eyes (Windows) | UI Automation integration, text field detection, prompt heuristic scoring, debounced text capture, caret position tracking |
| **3** | The Face (MVP) | Glassmorphic dot → pill → card UI, positioned at cursor, displaying term + definition + accept/dismiss |
| **4** | The Hands | Clipboard-safe text replacement via keystroke simulation, end-to-end flow: detect → suggest → accept → replace |
| **5** | Animations | Micro-animation asset pipeline, 100 core component animations (Lottie), animation preview in suggestion cards |
| **6** | Intelligence | ONNX embedding model integration, semantic search (Layer D), context disambiguation, intent classifier |
| **7** | Scale | Full pack pipeline (scrape → generate aliases → embed → curate), 3000+ terms across 8 domain packs |
| **8** | Learning | Interaction logging, confidence re-ranking, user preference adaptation, "always apply" feature |
| **9** | Polish | Onboarding wizard, settings UI, multi-monitor support, DPI scaling, performance optimization, auto-updater |
| **10** | macOS | Port Eyes and Hands layers to macOS Accessibility API, test cross-platform |

---

## Examples

### Example 1: Component Vocabulary

```
User types (in Cursor):
  "add a blurry transparent box that shows options when you hover"

Lexis detects:
  "blurry transparent box that shows options when you hover"
    ↓
  Match: "Glassmorphic Popover" (confidence: 0.88)
    - "blurry transparent" → glassmorphism
    - "box that shows" → popover
    - "when you hover" → hover trigger

Suggestion card shows:
  Term: "Glassmorphic Popover"
  Animation: frosted glass panel appearing with options inside
  Definition: "A popover menu with glassmorphic styling — translucent
              background with backdrop blur, visible on hover/click."

User presses Tab. Text becomes:
  "add a glassmorphic popover that displays options on hover, using
   backdrop-filter: blur and a semi-transparent background"
```

### Example 2: Layout Pattern

```
User types (in v0):
  "make a page with different sized boxes in a grid that fills gaps"

Lexis detects:
  "different sized boxes in a grid that fills gaps"
    ↓
  Match: "Masonry Grid Layout" (confidence: 0.92)

Suggestion card shows:
  Term: "Masonry Grid Layout"
  Animation: boxes of varying heights arranging into a
             Pinterest-style stacked grid
  Definition: "A grid layout where items of varying heights are
              packed tightly without equal row heights, like a
              brick wall. Common in image galleries and card feeds."

User presses Tab. Text becomes:
  "create a masonry grid layout with variable-height cards
   that fill vertical gaps, similar to Pinterest"
```

### Example 3: Interaction Pattern

```
User types (in Claude):
  "I want the list to keep loading more items as you scroll down"

Lexis detects:
  "keep loading more items as you scroll down"
    ↓
  Match: "Infinite Scroll with Lazy Loading" (confidence: 0.95)

Suggestion card shows:
  Term: "Infinite Scroll"
  Animation: a list with items appearing at the bottom as
             the viewport scrolls, with a loading spinner
  Definition: "A pagination pattern where new content loads
              automatically as the user scrolls near the bottom,
              eliminating the need for explicit 'Next Page' buttons."

User presses Tab. Text becomes:
  "implement infinite scroll with lazy loading — fetch the next
   page of items when the user scrolls within 200px of the
   list bottom, showing a loading skeleton during fetch"
```
