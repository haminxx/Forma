import os
import time
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents import translate_phrase, analyze_sentence, run_critic_agent, run_reformulator_agent
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

from pro_templates import get_pro_expansion, has_pro_template

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


# ============================================================
# AI MODE — Sentence-Level Analysis Endpoint
# ============================================================

class TranslateProRequest(BaseModel):
    canonical_term: str


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
    """Analyze full text and return all detected vague UI phrases with translations."""
    import time
    start_time = time.time()
    
    text = request.text.strip()
    
    if not text or len(text) < 3:
        return {"phrases": [], "latency": 0}
    
    # Limit text length to prevent abuse
    if len(text) > 2000:
        text = text[:2000]
    
    try:
        raw_response = analyze_sentence(text)
        print(f"[DEBUG /analyze] Input text: {text}")
        print(f"[DEBUG /analyze] Raw AMD response: {raw_response}")
        phrases = parse_analyze_response(raw_response, text)
        print(f"[DEBUG /analyze] Parsed phrases count: {len(phrases)}")
        
        latency = int((time.time() - start_time) * 1000)
        
        return {
            "phrases": phrases,
            "latency": latency
        }
    except Exception as e:
        print(f"Error in /analyze: {e}")
        return {"phrases": [], "latency": 0, "error": str(e)}


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

