from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import whisper
import os
import time
from transformers import pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend to communicate with backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model
model = whisper.load_model("base")

# Load Summarization model
summarizer = pipeline("summarization")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    start_time = time.time()
    audio_path = f"./uploads/{file.filename}"
    
    # Ensure the uploads directory exists
    os.makedirs("uploads", exist_ok=True)

    # Save the uploaded file
    with open(audio_path, "wb") as f:
        f.write(await file.read())

    print(f"File {file.filename} saved successfully. Starting transcription...")

    # Whisper Transcription
    result = model.transcribe(audio_path)

    print(f"Transcription complete! Time taken: {time.time() - start_time:.2f} seconds")
    print(f"Transcription Output: {result['text']}")  # <-- Print output to confirm

    return {"text": result["text"]}

@app.post("/summarize")
async def summarize_text(data: dict):
    text = data.get("text", "")

    if not text:
        return {"error": "No text provided"}

    print(f"Summarizing text: {text[:200]}... (truncated for logging)")  # Print first 200 characters

    # Set model limits (BART supports ~1024 tokens)
    max_input_tokens = 1024
    text_chunks = [text[i : i + max_input_tokens] for i in range(0, len(text), max_input_tokens)]

    print(f"Text split into {len(text_chunks)} chunks.")

    summaries = []
    for chunk in text_chunks:
        summary = summarizer(chunk, max_length=150, min_length=50, do_sample=False)
        summaries.append(summary[0]["summary_text"])

    full_summary = " ".join(summaries)
    print(f"Final Summary: {full_summary[:300]}...")  # Print first 300 characters

    return {"summary": full_summary}
