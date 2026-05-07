import time
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from agents import translate_phrase, analyze_sentence
from patterns import contains_vague_phrase
from parser import parse_response, parse_analyze_response
from db import init_db, get_db
from events import (
    log_event,
    get_summary_stats,
    get_top_terms,
    get_recent_activity,
    get_site_breakdown,
)

app = FastAPI(title="Forma Backend")

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


# ============================================================
# AI MODE — Sentence-Level Analysis Endpoint
# ============================================================

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

