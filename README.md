# NotaBookPlus

An intelligent note-taking app with support for audio transcription, summarization, rich text editing, and exporting to various formats.

---

## 🚀 Features

- 📝 Rich-text note editor (with headings, bold, italic, etc.)
- 📂 Export notes to TXT, PDF, PNG, or DOCX
- 🎙️ Record audio from your browser (pause/resume/stop)
- 🔁 Transcribe uploaded or recorded `.wav, .mp3` audio to text
- 📄 Summarize note contents via OpenAI
- 🧠 Backend powered by FastAPI and Whisper

---

## ⚠️ Requirements

### ✅ Python Version (VERY IMPORTANT)

> You must use **Python 3.10.x** — newer versions like 3.12 are **NOT supported** due to `whisper` and `torch` compatibility issues.

- **Node.js** and **npm**
- **FFmpeg** (required for audio recording/transcription)

#### 🛠️ FFmpeg Setup

**Windows:**
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract (e.g., to `C:\FFmpeg`)
3. Add `C:\FFmpeg\bin` to System `PATH`
4. Restart terminal

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install ffmpeg
```

Test with:
```bash
ffmpeg -version
```

---

## 🧪 Backend Setup (FastAPI)

1. **Open ai-backend folder**
   ```bash
   cd ai-backend
   ```

2. **Create virtual environment**
   ```bash
   python3.10 -m venv venv
   ```

3. **Activate the venv**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

---

## 🌐 Frontend Setup (React)

1. **Install Node dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the development server**
   ```bash
   npm start
   ```

> Required frontend dependencies are defined in `package.json`. React Router is included.

---


## 📁 Notes

- Import any general audio file, and it can be transcribed by loading the saved file.
- Export options available: `.txt`, `.pdf`, `.png`, `.docx`.
- Recordings are client-side via `MediaRecorder`.
- Backend routes:
  - `/transcribe` – Accepts audio and returns transcribed text.
  - `/summarize` – Accepts text and returns summarized text.

---

## 🧠 Whisper + Torch Notes

- Whisper is used for transcription and requires PyTorch.
- If you get strange errors, make sure you're on Python 3.10 and reinstall `torch`, `whisper`, etc.

---
