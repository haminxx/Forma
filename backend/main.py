import os
import time
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents import translate_phrase, analyze_sentence, run_critic_agent, run_reformulator_agent, run_style_agent, run_memory_agent, run_coach_agent, run_consensus_agent, run_all_agents_parallel, run_fast_critic_agent, run_detect_vague_agent
from patterns import contains_vague_phrase
from parser import parse_response, parse_analyze_response
from db import init_db, get_db
from events import (
    log_event,
    get_summary_stats,
    get_top_terms,
    get_recent_activity,
    get_site_breakdown,
    get_average_forma_score,
)

from pro_templates import get_pro_expansion, has_pro_template, VARIANT_ALIASES

app = FastAPI(title="Forma Backend", docs_url=None, redoc_url=None, openapi_url=None)

@app.on_event("startup")
def startup_event():
    init_db()
    print("[Forma] Database initialized")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PhraseRequest(BaseModel):
    phrase: str


class DetectionLogRequest(BaseModel):
    phrase: str
    term: str
    site: str
    latency_ms: int = None


class AcceptanceLogRequest(BaseModel):
    phrase: str
    term: str
    site: str
    alternative_term: str = None


class SkipLogRequest(BaseModel):
    phrase: str
    term: str
    site: str


class CriticRequest(BaseModel):
    text: str


class ReformulatorRequest(BaseModel):
    text: str


class StyleRequest(BaseModel):
    text: str


class MemoryRequest(BaseModel):
    text: str


class CoachRequest(BaseModel):
    text: str
    current_output: str = None


class ConsensusRequest(BaseModel):
    text: str
    detector_result: dict = None
    critic_result: dict = None
    reformulator_result: dict = None
    style_result: dict = None
    memory_result: dict = None
    coach_result: dict = None


class RunAllRequest(BaseModel):
    text: str


class FastCriticRequest(BaseModel):
    prompt: str


class DetectVagueRequest(BaseModel):
    text: str


@app.get("/")
def health_check():
    return {
        "status": "running",
        "service": "Forma Backend",
        "amd": "Llama 3.1 8B on MI300X active",
    }


@app.post("/translate")
def translate(request: PhraseRequest):
    phrase = request.phrase

    if not phrase or not phrase.strip():
        return {}

    if not contains_vague_phrase(phrase):
        return {}

    start_time = time.time()

    raw_response = translate_phrase(phrase)

    parsed = parse_response(raw_response)

    end_time = time.time()
    latency_ms = int((end_time - start_time) * 1000)

    parsed["latency"] = latency_ms

    return parsed


@app.post("/agents/critic")
async def critic_endpoint(request: CriticRequest):
    """Critic Agent: scores prompt quality 0-100."""
    try:
        result = await run_critic_agent(request.text)
        return {"agent": "critic", "result": result}
    except Exception as e:
        return {"agent": "critic", "error": str(e)}


@app.post("/agents/reformulator")
async def reformulator_endpoint(request: ReformulatorRequest):
    """Reformulator Agent: rewrites vague prompts into precise ones."""
    try:
        result = await run_reformulator_agent(request.text)
        return {"agent": "reformulator", "result": result}
    except Exception as e:
        return {"agent": "reformulator", "error": str(e)}


@app.post("/agents/style")
async def style_endpoint(request: StyleRequest):
    """Style Agent: matches prompt against user's design style preferences."""
    try:
        result = await run_style_agent(request.text)
        return {"agent": "style", "result": result}
    except Exception as e:
        return {"agent": "style", "error": str(e)}


@app.post("/agents/memory")
async def memory_endpoint(request: MemoryRequest):
    """Memory Agent: analyzes user's accumulated cross-builder design history."""
    try:
        result = await run_memory_agent(request.text)
        return {"agent": "memory", "result": result}
    except Exception as e:
        return {"agent": "memory", "error": str(e)}


@app.post("/agents/coach")
async def coach_endpoint(request: CoachRequest):
    """Iteration Coach Agent: suggests next-prompt fragments to refine output."""
    try:
        result = await run_coach_agent(request.text, request.current_output)
        return {"agent": "coach", "result": result}
    except Exception as e:
        return {"agent": "coach", "error": str(e)}


@app.post("/agents/consensus")
async def consensus_endpoint(request: ConsensusRequest):
    """Consensus Agent: synthesizes all 6 specialist agents into a unified recommendation."""
    try:
        result = await run_consensus_agent(
            request.text,
            request.detector_result,
            request.critic_result,
            request.reformulator_result,
            request.style_result,
            request.memory_result,
            request.coach_result
        )
        return {"agent": "consensus", "result": result}
    except Exception as e:
        return {"agent": "consensus", "error": str(e)}


@app.post("/agents/run-all")
async def run_all_endpoint(request: RunAllRequest):
    """
    Orchestrator: runs all 7 agents on Llama 3.1 70B AWQ on AMD MI300X.
    Returns parallel inference results with latency metrics.
    """
    try:
        result = await run_all_agents_parallel(request.text)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/detect-vague")
async def detect_vague_endpoint(request: DetectVagueRequest):
    """Free-tier 8B vague-phrase detection for inline underline."""
    try:
        return await run_detect_vague_agent(request.text)
    except Exception as e:
        return {"phrases": [], "metadata": {"tier": "fast", "error": str(e), "phrase_count": 0}}


@app.post("/agents/fast-critic")
async def fast_critic_endpoint(request: FastCriticRequest):
    """Fast critic endpoint (8B tier) for realtime quality scoring."""
    start = time.time()
    try:
        result = await run_fast_critic_agent(request.prompt)
        latency_ms = int((time.time() - start) * 1000)
        metadata = result.get("metadata", {})
        metadata["latency_ms"] = latency_ms
        result["metadata"] = metadata
        return {"agent": "fast-critic", "result": result}
    except Exception as e:
        latency_ms = int((time.time() - start) * 1000)
        return {"agent": "fast-critic", "error": str(e), "metadata": {"latency_ms": latency_ms}}


# ============================================================
# AI MODE — Sentence-Level Analysis Endpoint
# ============================================================

class TranslateProRequest(BaseModel):
    canonical_term: str


class DetectPhrasesRequest(BaseModel):
    text: str


class DetectedPhrase(BaseModel):
    phrase: str
    start_index: int
    end_index: int
    canonical: str


class DetectPhrasesResponse(BaseModel):
    phrases: list[DetectedPhrase]
    detection_count: int


@app.post("/detect-phrases", response_model=DetectPhrasesResponse)
async def detect_phrases(req: DetectPhrasesRequest):
    """
    Fast phrase detection. Takes user text, returns detected vague phrases
    with their start/end indices and canonical replacements.
    Pure string matching - no LLM, no AMD call. Sub-50ms response.
    """
    text = req.text or ""
    if not text or len(text) > 8000:
        return {"phrases": [], "detection_count": 0}

    text_lower = text.lower()
    detected: list[DetectedPhrase] = []

    # No response caching needed here; deterministic string scanning is already fast.
    variants = sorted(
        ((variant.lower(), canonical) for variant, canonical in VARIANT_ALIASES.items() if variant and canonical),
        key=lambda item: len(item[0]),
        reverse=True,
    )

    def overlaps_existing(start_idx: int, end_idx: int) -> bool:
        for existing in detected:
            if start_idx < existing.end_index and end_idx > existing.start_index:
                return True
        return False

    def is_word_boundary_match(start_idx: int, end_idx: int) -> bool:
        left_ok = start_idx == 0 or not text_lower[start_idx - 1].isalnum()
        right_ok = end_idx == len(text_lower) or not text_lower[end_idx].isalnum()
        return left_ok and right_ok

    for variant, canonical in variants:
        search_from = 0
        while True:
            start_idx = text_lower.find(variant, search_from)
            if start_idx == -1:
                break
            end_idx = start_idx + len(variant)

            if not overlaps_existing(start_idx, end_idx) and is_word_boundary_match(start_idx, end_idx):
                detected.append(
                    DetectedPhrase(
                        phrase=text[start_idx:end_idx],
                        start_index=start_idx,
                        end_index=end_idx,
                        canonical=canonical,
                    )
                )
            search_from = start_idx + 1

    detected.sort(key=lambda item: item.start_index)
    return {
        "phrases": detected,
        "detection_count": len(detected),
    }


@app.post("/translate-pro")
def translate_pro(request: TranslateProRequest):
    """Forma Pro Mode — return engineered prompt fragment for a canonical term.
    
    Pre-written templates with motion specs, position anchors, and library hints.
    Deterministic, sub-millisecond response. No LLM call.
    """
    expansion = get_pro_expansion(request.canonical_term)
    has_template = has_pro_template(request.canonical_term)
    return {
        "canonical_term": request.canonical_term,
        "pro_expansion": expansion,
        "has_pro_template": has_template
    }


class AnalyzeRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """Realtime fast-tier analysis endpoint using 8B critic."""
    start_time = time.time()
    text = request.text.strip()

    if not text:
        return {"agent": "fast-critic", "result": {"score": 0, "tier": "Vague", "weaknesses": [], "suggestions": [], "metadata": {"tier": "fast", "latency_ms": 0}}}

    try:
        result = await run_fast_critic_agent(text)
        latency = int((time.time() - start_time) * 1000)
        metadata = result.get("metadata", {})
        metadata["latency_ms"] = latency
        result["metadata"] = metadata
        return {"agent": "fast-critic", "result": result}
    except Exception as e:
        latency = int((time.time() - start_time) * 1000)
        return {"agent": "fast-critic", "error": str(e), "metadata": {"latency_ms": latency}}


# ============================================================
# DESIGN INTELLIGENCE LAYER — Logging Endpoints
# ============================================================

@app.post("/log/detection")
def log_detection(
    request: DetectionLogRequest,
    db: Session = Depends(get_db),
):
    """Log when Forma detects a vague phrase."""
    try:
        log_event(
            db=db,
            event_type="detection",
            phrase=request.phrase,
            term=request.term,
            site=request.site,
            latency_ms=request.latency_ms,
        )
        return {"status": "logged"}
    except Exception as e:
        print(f"[Forma] Detection log error: {e}")
        return {"status": "error", "message": str(e)}


@app.post("/log/acceptance")
def log_acceptance(
    request: AcceptanceLogRequest,
    db: Session = Depends(get_db),
):
    """Log when user accepts a Forma suggestion."""
    try:
        log_event(
            db=db,
            event_type="acceptance",
            phrase=request.phrase,
            term=request.term,
            alternative_term=request.alternative_term,
            site=request.site,
        )
        return {"status": "logged"}
    except Exception as e:
        print(f"[Forma] Acceptance log error: {e}")
        return {"status": "error", "message": str(e)}


@app.post("/log/skip")
def log_skip(
    request: SkipLogRequest,
    db: Session = Depends(get_db),
):
    """Log when user skips a Forma suggestion."""
    try:
        log_event(
            db=db,
            event_type="skip",
            phrase=request.phrase,
            term=request.term,
            site=request.site,
        )
        return {"status": "logged"}
    except Exception as e:
        print(f"[Forma] Skip log error: {e}")
        return {"status": "error", "message": str(e)}


# ============================================================
# DESIGN INTELLIGENCE LAYER — Stats Endpoints
# ============================================================

@app.get("/stats/summary")
def stats_summary(db: Session = Depends(get_db)):
    """Hero section stats for admin dashboard."""
    return get_summary_stats(db)


@app.get("/stats/top-terms")
def stats_top_terms(limit: int = 10, db: Session = Depends(get_db)):
    """Top accepted terms with acceptance rates."""
    return {"terms": get_top_terms(db, limit=limit)}


@app.get("/stats/recent")
def stats_recent(limit: int = 20, db: Session = Depends(get_db)):
    """Recent activity for live feed."""
    return {"events": get_recent_activity(db, limit=limit)}


@app.get("/stats/sites")
def stats_sites(db: Session = Depends(get_db)):
    """Site breakdown for dashboard."""
    return {"sites": get_site_breakdown(db)}


@app.get("/stats/forma-score")
def stats_forma_score(db: Session = Depends(get_db)):
    """Average Forma Score across all detections."""
    return get_average_forma_score(db)


# ============================================================
# DESIGN INTELLIGENCE LAYER — Admin Dashboard
# ============================================================

@app.get("/admin")
def admin_dashboard():
    """Serve the Design Intelligence Dashboard."""
    dashboard_path = os.path.join(os.path.dirname(__file__), "dashboard.html")
    return FileResponse(dashboard_path, media_type="text/html")


@app.post("/admin/seed")
def admin_seed():
    """Trigger seed data generation. Used to populate dashboard for demo."""
    try:
        from seed_data import clear_and_seed
        count = clear_and_seed(800)
        return {"status": "seeded", "events_created": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============================================================
# API DOCUMENTATION — Public-facing API docs page
# ============================================================

@app.get("/docs")
def api_documentation():
    """Serve the public API documentation page."""
    docs_path = os.path.join(os.path.dirname(__file__), "api_docs.html")
    return FileResponse(docs_path, media_type="text/html")


# ============================================================
# INVESTOR PITCH DECK — Public-facing pitch deck page
# ============================================================

@app.get("/pitch")
def pitch_deck():
    """Serve the investor pitch deck page."""
    pitch_path = os.path.join(os.path.dirname(__file__), "pitch.html")
    return FileResponse(pitch_path, media_type="text/html")


# ============================================================
# AMD TECHNICAL DEEP DIVE — Public-facing architecture page
# ============================================================

@app.get("/amd")
def amd_deep_dive():
    """Serve the AMD MI300X technical architecture page."""
    amd_path = os.path.join(os.path.dirname(__file__), "amd.html")
    return FileResponse(amd_path, media_type="text/html")


@app.get("/memory")
def memory_engine():
    """Static showcase page for Forma Pro tier Memory Engine (long-context personalization)."""
    memory_path = os.path.join(os.path.dirname(__file__), "memory.html")
    return FileResponse(memory_path, media_type="text/html")

