import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float
from sqlalchemy.orm import declarative_base, sessionmaker

# Database file lives in /tmp on Railway, persists between requests but resets on redeploy
# For hackathon demo this is fine — we seed data on startup
DB_PATH = os.getenv("DB_PATH", "/tmp/forma_events.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)  # "detection", "acceptance", "skip"
    phrase = Column(String)
    term = Column(String, index=True)  # canonical term
    alternative_term = Column(String, nullable=True)  # if user picked alternative
    site = Column(String, index=True)  # hostname
    latency_ms = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
