from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from db import Event


def log_event(
    db: Session,
    event_type: str,
    phrase: str,
    term: str,
    site: str,
    alternative_term: str = None,
    latency_ms: int = None
):
    """Log an event to the database."""
    event = Event(
        event_type=event_type,
        phrase=phrase,
        term=term,
        alternative_term=alternative_term,
        site=site,
        latency_ms=latency_ms,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_summary_stats(db: Session):
    """Return high-level stats for dashboard hero section."""
    total_events = db.query(Event).count()
    total_detections = db.query(Event).filter(Event.event_type == "detection").count()
    total_acceptances = db.query(Event).filter(Event.event_type == "acceptance").count()
    total_skips = db.query(Event).filter(Event.event_type == "skip").count()
    
    # Acceptance rate = acceptances / (acceptances + skips)
    decided = total_acceptances + total_skips
    acceptance_rate = (total_acceptances / decided * 100) if decided > 0 else 0
    
    # Unique sites
    unique_sites = db.query(Event.site).distinct().count()
    
    # Events in last 24 hours
    yesterday = datetime.utcnow() - timedelta(hours=24)
    events_today = db.query(Event).filter(Event.timestamp >= yesterday).count()
    
    return {
        "total_events": total_events,
        "total_detections": total_detections,
        "total_acceptances": total_acceptances,
        "total_skips": total_skips,
        "acceptance_rate": round(acceptance_rate, 1),
        "unique_sites": unique_sites,
        "events_today": events_today,
    }


def get_top_terms(db: Session, limit: int = 10):
    """Return top accepted terms with acceptance rates."""
    # Get all terms that have been detected
    results = (
        db.query(
            Event.term,
            func.count(Event.id).label("total_detections")
        )
        .filter(Event.event_type == "detection")
        .group_by(Event.term)
        .order_by(desc("total_detections"))
        .limit(limit)
        .all()
    )
    
    top_terms = []
    for term, detection_count in results:
        # Count acceptances for this term
        acceptances = (
            db.query(Event)
            .filter(Event.event_type == "acceptance", Event.term == term)
            .count()
        )
        skips = (
            db.query(Event)
            .filter(Event.event_type == "skip", Event.term == term)
            .count()
        )
        decided = acceptances + skips
        rate = (acceptances / decided * 100) if decided > 0 else 0
        
        top_terms.append({
            "term": term,
            "detections": detection_count,
            "acceptances": acceptances,
            "skips": skips,
            "acceptance_rate": round(rate, 1),
        })
    
    return top_terms


def get_recent_activity(db: Session, limit: int = 20):
    """Return recent events for live feed."""
    events = (
        db.query(Event)
        .order_by(desc(Event.timestamp))
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": e.id,
            "event_type": e.event_type,
            "phrase": e.phrase,
            "term": e.term,
            "site": e.site,
            "timestamp": e.timestamp.isoformat(),
        }
        for e in events
    ]


def get_site_breakdown(db: Session):
    """Return event counts grouped by site."""
    results = (
        db.query(
            Event.site,
            func.count(Event.id).label("count")
        )
        .group_by(Event.site)
        .order_by(desc("count"))
        .all()
    )
    
    return [
        {"site": site, "events": count}
        for site, count in results
    ]
