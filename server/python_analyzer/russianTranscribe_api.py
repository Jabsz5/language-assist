import sys
sys.stdout.reconfigure(encoding='utf-8')
from flask import Flask, jsonify, request
import whisper
import time
from pathlib import Path
from flask_cors import CORS
import traceback

import subprocess

OLLAMA_MODEL = "qwen2.5:7b"
OLLAMA_TIMEOUT_SEC = 180

PROMPT_TEMPLATE = """You are a Russian→English translation tutor.
For the Russian text below, output:

Natural English translation

Word-by-word gloss (tokenized)

Grammar notes: cases, aspect, tense, gender/number, syntax/word order

2 alternative English phrasings and why

Russian: «{russian}»
"""

app = Flask(__name__)
CORS(app)

MODEL_NAME = "large"
LANGUAGE = "ru"

OUT_DIR = Path("./recordings")
OUT_DIR.mkdir(exist_ok=True)

print("[ASR] Loading Whisper model...")
model = whisper.load_model(MODEL_NAME)


def transcribe(audio_path):
    result = model.transcribe(
        str(audio_path),
        language=LANGUAGE,
        task="transcribe",
        fp16=False,
        verbose=False,
    )
    return (result.get("text") or "").strip()

def run_ollama(russian_text):

    prompt = PROMPT_TEMPLATE.format(russian=russian_text)

    proc = subprocess.run(
        ["ollama", "run", OLLAMA_MODEL],
        input=prompt,
        text=True,
        encoding="utf-8",
        capture_output=True,
        check=False,
        timeout=OLLAMA_TIMEOUT_SEC,
    )

    if proc.returncode != 0:
        raise RuntimeError(proc.stderr)

    return proc.stdout.strip()

@app.route("/asr", methods=["POST"])
def run_asr():

    try:

        if "audio" not in request.files:
            return jsonify({"success": False, "error": "No audio file"}), 400

        audio_file = request.files["audio"]

        ts = time.strftime("%Y%m%d_%H%M%S")
        audio_path = OUT_DIR / f"rec_{ts}.webm"

        audio_file.save(audio_path)

        print("[ASR] Received:", audio_path)

        text = transcribe(audio_path)

        return jsonify({
            "success": True,
            "text": text
        })

    except Exception as e:

        print("\n[ASR ERROR]")
        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/llm", methods=["POST"])
def run_llm():

    try:

        data = request.json

        if not data or "text" not in data:
            return jsonify({
                "success": False,
                "error": "No transcript provided"
            }), 400

        russian_text = data["text"]

        print("[LLM] Received transcript:", russian_text)

        tutor_output = run_ollama(russian_text)

        return jsonify({
            "success": True,
            "result": tutor_output
        })

    except Exception as e:

        print("\n[LLM ERROR]")
        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=5001)