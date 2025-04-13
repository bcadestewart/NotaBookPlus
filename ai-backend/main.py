from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import whisper
import os
import time
import json
from transformers import pipeline

app = FastAPI()

# CORS setup for communication between frontend and backend on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model for audio transcription
model = whisper.load_model("base")

# Load HuggingFace summarization pipeline
summarizer = pipeline("summarization")

# ------------------------ Note Model & JSON Storage ------------------------

# Pydantic model for note data
class Note(BaseModel):
    id: str
    title: str
    content: str
    lastModified: Optional[int]

# Store notes into a local json file
NOTES_FILE = "notes.json"

# Load notes from json file and initialize if missing
def load_notes():
    if not os.path.exists(NOTES_FILE):
        with open(NOTES_FILE, "w") as f:
            json.dump([], f)
    with open(NOTES_FILE, "r") as f:
        return json.load(f)

# Save notes to the json file
def save_notes(notes):
    with open(NOTES_FILE, "w") as f:
        json.dump(notes, f, indent=2)

# Get all saved notes
@app.get("/notes")
def get_notes():
    return load_notes()

# Add a new note
@app.post("/notes")
def create_note(note: Note):
    notes = load_notes()
    notes.append(note.dict())
    save_notes(notes)
    return {"message": "Note added successfully."}

# Update an existing note via ID
@app.put("/notes/{note_id}")
def update_note(note_id: str, updated_note: Note):
    notes = load_notes()
    for i, note in enumerate(notes):
        if note["id"] == note_id:
            notes[i] = updated_note.dict()
            save_notes(notes)
            return {"message": "Note updated successfully."}
    return {"message": "Note not found."}

# Delete a note by ID
@app.delete("/notes/{note_id}")
def delete_note(note_id: str):
    notes = load_notes()
    notes = [note for note in notes if note["id"] != note_id]
    save_notes(notes)
    return {"message": "Note deleted successfully."}

# ------------------------ Transcription ------------------------

# Endpoint for audio file transcription with Whisper
@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    start_time = time.time()
    audio_path = f"./uploads/{file.filename}"

    os.makedirs("uploads", exist_ok=True)

    # Save uploaded audio file to disk
    with open(audio_path, "wb") as f:
        f.write(await file.read())

    print(f"File {file.filename} saved. Transcribing...")

    # Transcribe audio to text
    result = model.transcribe(audio_path)

    print(f"Transcribed in {time.time() - start_time:.2f} seconds")
    print(f"Result: {result['text'][:150]}...")

    return {"text": result["text"]}

# ------------------------ Summarization ------------------------

# Endpoint for text summarization using HuggingFace transformers
@app.post("/summarize")
async def summarize_text(data: dict):
    text = data.get("text", "")
    if not text:
        return {"error": "No text provided"}

    print(f"Summarizing text: {text[:200]}...")

    # Split text into chunks for models with input length limits
    max_input_tokens = 1024
    text_chunks = [text[i:i + max_input_tokens] for i in range(0, len(text), max_input_tokens)]

    summaries = []
    for chunk in text_chunks:
        summary = summarizer(chunk, max_length=150, min_length=50, do_sample=False)
        summaries.append(summary[0]["summary_text"])

    # Combine all summary chunks
    final_summary = " ".join(summaries)
    print(f"Summary complete. Length: {len(final_summary)} characters")

    return {"summary": final_summary}