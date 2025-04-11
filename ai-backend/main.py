from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tempfile import NamedTemporaryFile
import os
import whisper

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Whisper model once at startup
model = whisper.load_model("base")

@app.get("/")
def root():
    return {"message": "API is running"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        with NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        result = model.transcribe(temp_path)
        os.remove(temp_path)
        return {"text": result["text"]}

    except Exception as e:
        print("Transcription error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize")
async def summarize_text(payload: dict):
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required for summarization.")
    
    # Dummy summary for placeholder purposes
    summary = "This is a summary of the provided text."
    return {"summary": summary}
