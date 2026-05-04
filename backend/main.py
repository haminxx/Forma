import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents import translate_phrase
from patterns import contains_vague_phrase
from parser import parse_response

app = FastAPI(title="Forma Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PhraseRequest(BaseModel):
    phrase: str


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

