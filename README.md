# Forma

*Grammarly for AI builder prompts. Built on AMD MI300X.*

[![AMD AI Hackathon · Track 1: AI Agents](https://img.shields.io/badge/AMD%20AI%20Hackathon-Track%201%3A%20AI%20Agents-ed1c24?style=for-the-badge)](https://www.amd.com/en/developer/resources/ai-developer-challenge.html)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-forma--production--c800.up.railway.app-c8b89a?style=for-the-badge)](https://forma-production-c800.up.railway.app/)
[![Tech Deep-Dive](https://img.shields.io/badge/Tech%20Deep--Dive-/amd-1f2937?style=for-the-badge)](https://forma-production-c800.up.railway.app/amd)

Forma is a Chrome extension that improves AI builder output by upgrading prompt vocabulary at the point of typing. It watches textarea input on builder surfaces, flags vague UI language inline, and rewrites prompts into canonical component terms with concrete motion and accessibility specs. Under the hood, Forma runs a dual-model architecture on one AMD MI300X: real-time 8B inference for free-tier typing and 70B AWQ multi-agent analysis for paid-tier depth.

[🚀 Try the live demo](https://forma-production-c800.up.railway.app/) · [🏗 See the AMD architecture deep-dive](https://forma-production-c800.up.railway.app/amd) · [🎬 Watch the demo video](https://devpost.com/software/forma)

## The 30-Second Pitch

### The Problem

AI builders got dramatically better at generation, but the bottleneck moved upstream to specification quality. Users still type broad phrases like "popup that slides in," and generic language produces generic components.

The major builder ecosystems (v0, Cursor, Lovable, Bolt, base44) all compete on output quality, but they still consume the same low-quality prompt inputs. The leverage point is now input quality, not raw generation capacity.

### The Solution

Forma is a Chrome extension that sits inside the prompt workflow users already have. It watches the textarea inline and marks vague UI vocabulary with Grammarly-style underlines.

Hovering an underline surfaces canonical UI terminology (for example, "Off-Canvas Drawer") plus three alternatives with descriptions. One click accepts the rewrite, injecting specific motion specs, accessibility attributes, and component vocabulary; the visible prompt quality score can jump from 60 to 95.

1. User types: "Build a popup that slides in from the side"
2. Forma score badge: 30/100 Vague (red)
3. Wavy underline appears under "popup that slides in from the side"
4. Hover -> tooltip shows "Off-Canvas Drawer" with description and 3 alternatives
5. Click "Accept" -> prompt rewrites to "Build an Off-Canvas Drawer (slides from right edge, 320px width, 250ms ease-in-out, semi-transparent backdrop)" -> score jumps to 95/100 Precise (green)

### The AMD Claim

Forma's product experience depends on two very different inference tiers being live at the same time: a fast 8B model for per-keystroke feedback and a heavier 70B AWQ model for a 7-agent deep analysis path. Those tiers are not optional add-ons; they define the free and paid product experience.

Both models fit concurrently in 89 GiB of MI300X's 192 GiB HBM3, leaving 102 GiB for headroom and parallel user load. An H100 80GB cannot host both tiers with usable concurrency, which means the freemium business model and the dual-model architecture are the same decision.

-> See the full VRAM analysis and architecture diagram on [/amd](https://forma-production-c800.up.railway.app/amd)

## Why Forma Needs MI300X

This is the core technical and business claim of Forma. The product is structurally an MI300X product, not an Nvidia product, because freemium unit economics require both inference tiers to run on one GPU. If those tiers split across devices, latency and cost both move in the wrong direction.

### VRAM Allocation

| Component | Memory | Notes |
|---|---|---|
| 70B AWQ-INT4 model weights | 37.3 GiB | Quantized to INT4 for memory efficiency |
| 70B KV cache | 26.3 GiB | 4096-token max model length, 21x concurrent |
| 8B Instruct model weights | 15.1 GiB | bfloat16 |
| 8B KV cache | 11.2 GiB | 2048-token max, 44x concurrent |
| Total used | 89.9 GiB | |
| MI300X HBM3 capacity | 192 GiB | |
| Headroom | 102.1 GiB | Available for parallel users / longer context |

### Why H100 80GB Fails

The 70B model alone consumes 37.3 GiB. Add the 8B model (15.1 GiB), the 70B KV cache (26.3 GiB), and the 8B KV cache (11.2 GiB), and the total is 89.9 GiB. That's 9.9 GiB over an H100 80GB. There is no configuration where both models with usable concurrency fit on a single H100 80GB.

That forces a two-GPU topology, typically one model per GPU, which increases cost and removes unified memory behavior. Forma's flow requires both tiers to be immediately reachable by the same backend path; cross-device hops add coordination overhead to a pipeline that already carries 70B inference latency.

> **The hardware choice and the business model are the same decision.** 8B is cheap enough for free-tier scale. 70B is the expensive moat for paying users. Running both on a single MI300X makes a freemium SaaS economical. Running both on H100 doesn't.

### The Dual-Tier Architecture

| Tier | Model | Use |
|---|---|---|
| Free | Llama 3.1 8B Instruct (port 30000) | Real-time score on every keystroke. Inline underline detection. Hover tooltip with canonical vocabulary. |
| Pro | Llama 3.1 70B AWQ-INT4 (port 8000) | 7-agent Run Full Analysis. Memory Engine personalization. Production-grade prompt rewriting with motion + a11y specs. |

### Runtime Stack

| Layer | Tech |
|---|---|
| Inference | vLLM 0.17.1 (OpenAI-compatible chat completions) |
| Compute platform | ROCm 7.0 |
| GPU | AMD MI300X (192 GiB HBM3, 5.3 TB/s bandwidth) |
| 70B quantization | AWQ-INT4 (4-bit weight quantization) |
| Hardware host | DigitalOcean GPU droplet ($1.99/hr) |
| Backend | FastAPI on Railway |
| Extension | Chrome Manifest V3, vanilla JS content scripts |

-> Interactive VRAM bars and SVG architecture diagram on [/amd](https://forma-production-c800.up.railway.app/amd)

## What's Real Today

Forma is a working product, not a research demo. Honest delineation between what's shipped, what's mocked, and what's roadmap matters more than overclaiming. Here's what a judge will actually see when they probe the code.

| Built (Real) | Mocked | Roadmap |
|---|---|---|
| Chrome extension on v0.app with React-compatible textarea event injection | Cross-builder activity pipeline (real history capture across v0/Cursor/Lovable/Bolt/base44) | Multi-site extension support beyond v0 |
| 8B Llama 3.1 Instruct inference on AMD MI300X (port 30000) | Memory agent input data (the 7-agent pipeline runs real 70B inference, but the user history feeding the Memory agent is hardcoded for the demo) | Real-time data pipeline that captures every prompt, every accept, every iteration across builders |
| 70B Llama 3.1 AWQ-INT4 inference on AMD MI300X (port 8000) | Memory Engine personalization output on /memory page (UI is real, animation is real, the 70B inference path is real, but the input "47 prompts analyzed" is illustrative) | Long-context Memory Engine with 32K-token user history (currently capped at 4096 tokens by vLLM max_model_len configuration) |
| 7-agent multi-agent consensus pipeline (Detector, Critic, Reformulator, Style, Memory, Coach, Consensus) | Animation previews for alternative pills (only the primary canonical term has animation today; alternative pills show static descriptions) | Animation library for all 60 canonical UI components × 3 alternatives each |
| /detect-vague endpoint with offset alignment, canonical-60 validation, self-match filtering | | Cmd+Z undo support after Forma's programmatic textarea updates |
| Inline wavy underline + hover tooltip + 3 alternative pills with descriptions + click-to-accept | | contenteditable site support (ChatGPT, Claude, Lovable use contenteditable, not textarea) |
| Forma score badge with panel-ownership during 70B Critic analysis (no UI contradiction between 8B and 70B scores) | | SSE streaming for real-time agent progress (currently a simulated parallel timeline gated on real Consensus completion) |
| All 60 canonical UI vocabulary terms with descriptions populated | | Mobile extension (current build is desktop Chrome only) |
| /amd technical deep-dive page, /memory Pro tier showcase page | | |
| Dual-model concurrent inference on single MI300X (89 GiB used of 192 GiB) | | |

*Forma's AMD bet is real today. The dual-model architecture, the 7-agent pipeline, both inference paths, the Chrome extension on v0 — all working code running on production hardware right now. What's mocked is primarily the data layer feeding the Memory Engine. The reason we built the inference path before the data pipeline is sequencing: running 70B + 8B concurrently on a single GPU is the harder novel problem; cross-builder data extraction is well-understood engineering. The hackathon validates the harder problem. The data layer is post-hackathon priority.*

## Architecture

Forma is three components: a Chrome extension content script that watches AI builder textareas, a FastAPI backend on Railway that orchestrates inference, and a vLLM serving layer on AMD MI300X running both Llama models concurrently. The novel architectural decision is the dual-model concurrency on a single GPU. Everything else is conventional engineering applied carefully.

### Component Overview

```
[ User typing in v0.app textarea ]
              |
              v
[ Chrome extension content.js ]
   |  - Debounced keystroke capture
   |  - Inline overlay rendering (wavy underline + tooltip)
   |  - React-compatible event dispatch for prompt injection
              |
              v
[ FastAPI backend on Railway ]
   |  - /analyze -> 8B real-time score
   |  - /detect-vague -> 8B inline phrase detection
   |  - /agents/run-all -> 70B 7-agent consensus
   |  - /agents/memory-deep -> 70B personalization (Pro tier)
              |
              v
[ vLLM 0.17.1 on AMD MI300X (DigitalOcean) ]
   |  - Llama 3.1 8B Instruct (port 30000) - 15.1 GiB
   |  - Llama 3.1 70B AWQ-INT4 (port 8000) - 37.3 GiB + 26.3 GiB KV cache
   |  - ROCm 7.0 + Triton attention backend
   |  - 102 GiB headroom on 192 GiB HBM3
```

### Tech Stack

| Layer | Tech | Purpose |
|---|---|---|
| Chrome extension | Manifest V3, vanilla JS, no framework | Content script lifecycle on v0.app, overlay DOM, event injection |
| Backend orchestration | FastAPI 0.115+, Python 3.12 | Endpoint routing, prompt construction, agent fan-out, response shaping |
| Hosting (backend) | Railway | Public HTTPS endpoint, automatic deploys on git push |
| Hosting (inference) | DigitalOcean GPU droplet ($1.99/hr) | MI300X access, Docker-based vLLM container |
| Inference engine | vLLM 0.17.1 | OpenAI-compatible chat completions, KV cache management |
| Compute platform | ROCm 7.0 | AMD GPU compute, Triton attention kernels |
| Models | Llama 3.1 8B Instruct, Llama 3.1 70B AWQ-INT4 | Free tier scoring + Pro tier multi-agent analysis |
| Database | SQLite (lightweight, embedded) | Stats tracking for /admin page |

### Repository Layout

```
forma/
├── backend/
│   ├── main.py              FastAPI app, route definitions
│   ├── agents.py            7-agent pipeline + /detect-vague logic
│   ├── pro_templates.py     Canonical-60 vocabulary + PRO expansions
│   ├── amd.html             Technical deep-dive page (/amd)
│   └── memory.html          Pro tier Memory Engine showcase (/memory)
├── extension/
│   ├── manifest.json        Chrome MV3 manifest
│   ├── content.js           Main content script (overlay, tooltip, /analyze flow)
│   ├── styles.css           Overlay + tooltip + score badge styling
│   └── icons/               Extension icons
├── scripts/                 Utility scripts (vocabulary population, testing)
└── README.md                This file
```

-> Live API explorer and endpoint reference on [/amd](https://forma-production-c800.up.railway.app/amd)

## The Vision

Forma today is Grammarly for AI builder prompts on v0.app. The product works end-to-end, the AMD architecture is real, and the 7-agent pipeline runs real inference. But the bigger thesis is that prompt vocabulary is just the entry wedge into a larger product surface: a design memory layer that lives one level above any specific AI builder.

As users type prompts across v0, Cursor, Lovable, Bolt, and base44, Forma builds a persistent profile of their style: aesthetic preferences, spacing scale, motion timing, top components, and brand patterns. After 100 prompts, Forma knows you reach for Off-Canvas Drawer over Modal Overlay. After a quarter, your team's effective design system lives in Forma. That profile follows you to whichever builder you use next, recommendations adapt to it, switching costs grow with usage, and the leverage compounds.

*The hackathon submission validates the inference architecture. The platform thesis is what comes next.*

## Roadmap

### v1.1 — Next Month

- Animation library for all 60 canonical UI components × 3 alternatives each
- Multi-site extension support: Cursor, Lovable, Bolt, base44 (currently v0.app only)
- contenteditable site support (ChatGPT, Claude, builders that don't use textarea)
- Detection prompt tuning to reduce false positives on common nouns
- Cmd+Z undo restoration after Forma's programmatic textarea updates
- Real SSE streaming for live 7-agent progress (currently a simulated parallel timeline gated on real Consensus completion)

### v2 — Next Quarter

- Real cross-builder activity pipeline: capture every prompt, every accept, every iteration across builders into a unified user history
- Memory Engine on real personal data (replacing the current illustrative mock data)
- Long-context Memory Engine with 32K-token user history (requires vLLM max_model_len reconfiguration)
- Mobile extension (Safari iOS, Chrome Android)
- Team accounts with shared design system memory
- Pro tier billing infrastructure and Stripe integration

### v3 — The Platform

- Forma Memory API: external builders can read user style profiles to ship better defaults out of the gate
- Workspace integrations (Notion, Linear, Figma) so design intent transfers across the entire product workflow
- Marketplace for canonical UI vocabulary packs by industry (fintech, healthcare, gaming, b2b SaaS)
- Self-hosted enterprise deployment with custom canonical libraries

*v1.1 ships features. v2 makes Forma personal. v3 makes Forma a platform.*

## Hackathon Submission

### Submission Details

- **Track:** Track 1 — AI Agents
- **Hackathon:** AMD AI Hackathon 2026
- **Live demo:** [forma-production-c800.up.railway.app](https://forma-production-c800.up.railway.app)
- **Technical deep-dive:** [/amd page](https://forma-production-c800.up.railway.app/amd)
- **Memory Engine showcase:** [/memory page](https://forma-production-c800.up.railway.app/memory)
- **Demo video:** [TBD — Devpost link to be added Saturday May 9]
- **Devpost submission:** [TBD]

### Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone https://github.com/haminxx/Forma.git
cd Forma

# 2. Run the FastAPI backend locally
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# 3. Load the Chrome extension
# - Open chrome://extensions
# - Enable Developer mode
# - Click "Load unpacked"
# - Select the extension/ folder

# 4. Visit v0.app and start typing
# Forma will inject the score badge and inline detection automatically.
```

*Note: the local backend points at our hosted vLLM endpoints on AMD MI300X by default. To run inference locally you would need an MI300X-class GPU and would need to update the backend's VLLM_URL / VLLM_FAST_URL constants. The hosted setup is what powers the live demo and is what judges should test against.*

### Team

- **Built by** Ryan Zhang and Christian (TBD last name)
- **Hackathon submission window:** May 7–9, 2026
