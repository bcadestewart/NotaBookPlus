// Core react imports and libraries
import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
  Stack,
} from "@mui/material";
import axios from "axios";

//Main Home component handling note editing, AI features, recording, and export
export default function Home() {
  // Notes state
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  // Dark theme
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Refs for recording and file input
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

// Saved note storage
useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(savedNotes);
    if (savedNotes.length > 0) {
      setSelectedNoteId(savedNotes[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Sync editor content when selected note changes
  useEffect(() => {
    const note = notes.find(note => note.id === selectedNoteId);
    if (note) setEditorContent(note.content);
  }, [selectedNoteId, notes]);

  // Note management
  const createNewNote = () => {
    const newId = Date.now();
    const newNote = { id: newId, title: 'Untitled Note', content: '' };

    const updatedNotes = notes.map(note =>
      note.id === selectedNoteId ? { ...note, content: editorContent } : note
    );

    const newNotes = [...updatedNotes, newNote];

    setNotes(newNotes);
    setSelectedNoteId(newId);

    setTimeout(() => {
      setEditorContent('');
    }, 0);
  };

  const handleNoteSelect = (id) => setSelectedNoteId(id);

  const handleUpdateNote = (id, newContent) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, content: newContent } : note
    );
    setNotes(updatedNotes);
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    if (selectedNoteId === id && updatedNotes.length > 0) {
      setSelectedNoteId(updatedNotes[0].id);
    } else if (updatedNotes.length === 0) {
      setSelectedNoteId(null);
    }
  };

  const handleRename = (id) => {
    const newTitle = prompt("Enter new title:");
    if (newTitle) {
      const updatedNotes = notes.map((note) =>
        note.id === id ? { ...note, title: newTitle } : note
      );
      setNotes(updatedNotes);
    }
  };

  const handleSummarizeClick = async () => {
    const note = selectedNote;
    if (!note?.content?.trim()) return alert("Note is empty.");
    try {
      const res = await axios.post("http://localhost:8000/summarize", {
        text: note.content,
      });
      const summary = res.data?.summary;
      if (summary) {
        const newNote = {
          id: Date.now(),
          title: `Summary of ${note.title || "Note"}`,
          content: `Summary:\n\n${summary}`,
        };
        setNotes((prev) => [...prev, newNote]);
        setSelectedNoteId(newNote.id);
      } else alert("No summary received.");
    } catch (err) {
      console.error("Summarize error:", err);
      alert("Error summarizing.");
    }
  };

  // Transcription upload
  const handleTranscriptionUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:8000/transcribe', formData);
      const text = res.data?.text;
      if (text) {
        setEditorContent(prev => `${prev}\n\n${text}`);
        setNotes(prev =>
          prev.map(note => note.id === selectedNoteId ? { ...note, content: `${editorContent}\n\n${text}` } : note)
        );
      } else alert('No transcription result.');
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Error transcribing.');
    }
  };

  // File picker for transcription
  const triggerFilePicker = () => fileInputRef.current.click();

  // Currently selected note
  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  // Quill toolbar module
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/wav",
      });
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.wav";
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Export options (.txt, .pdf, .png, .docx)
  const exportAsTxt = () => {
    if (!selectedNote) return;
    const blob = new Blob([selectedNote.content], { type: "text/plain" });
    saveAs(blob, `${selectedNote.title || "note"}.html`);
  };

  const exportAsPDF = () => {
    if (!selectedNote) return;
    const editorContent = document.querySelector(".ql-editor");
    if (!editorContent) {
      alert("Editor not found for PDF export.");
      return;
    }
    const opt = {
      margin: 0.5,
      filename: `${selectedNote.title || "note"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().from(editorContent).set(opt).save();
  };

  const exportAsPNG = () => {
    if (!selectedNote) return;
    const editorElement = document.querySelector(".editor-container .ql-editor");
    if (!editorElement) {
      alert("Editor not found");
      return;
    }
    html2canvas(editorElement, { scale: 2 }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${selectedNote.title || "note"}.png`);
        } else {
          alert("Failed to generate image.");
        }
      });
    });
  };

  const exportAsDOCX = () => {
    if (!selectedNote) return;
    const doc = new Document({
      sections: [{ children: [new Paragraph(selectedNote.content)] }],
    });
    Packer.toBlob(doc).then((blob) =>
      saveAs(blob, `${selectedNote.title || "note"}.docx`)
    );
  };

  // Render UI features
  return (
    <div style={{ display: "flex", width: "100%" }}>
      <Box
        sx={{
          width: 280,
          minWidth: 280,
          bgcolor: isDark ? "#2c2c2c" : "#f0f0f0",
          color: isDark ? "#fff" : "#000",
          p: 2,
          height: "100vh",
          overflowY: "auto",
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" gutterBottom>Your Notes</Typography>
        <Button variant="contained" fullWidth onClick={createNewNote} sx={{ mb: 2 }}>
          + New Note
        </Button>
        <Divider sx={{ mb: 2 }} />
        <List>
          {notes.map((note) => (
            <ListItemButton
              key={note.id}
              onClick={() => handleNoteSelect(note.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleRename(note.id);
              }}
              selected={note.id === selectedNoteId}
            >
              <ListItemText primary={note.title || "Untitled Note"} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box flex={1} display="flex" flexDirection="column">
        <Stack direction="row" spacing={2} sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Button variant="outlined" onClick={handleSummarizeClick}>Summarize</Button>
          <Button variant="outlined" onClick={triggerFilePicker}>Transcribe</Button>
          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleTranscriptionUpload} style={{ display: 'none' }} />
        </Stack>

        {selectedNote && (
          <Box p={2}>
            <div className="editor-container">
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={(value) => {
                  setEditorContent(value);
                  handleUpdateNote(selectedNote.id, value);
                }}
                modules={quillModules}
              />
            </div>

            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" color="error" onClick={() => handleDeleteNote(selectedNote.id)}>
                Delete Note
              </Button>
              <Button variant="outlined" onClick={exportAsTxt}>Export TXT</Button>
              <Button variant="outlined" onClick={exportAsPDF}>Export PDF</Button>
              <Button variant="outlined" onClick={exportAsPNG}>Export PNG</Button>
              <Button variant="outlined" onClick={exportAsDOCX}>Export DOCX</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={startRecording} disabled={isRecording}>
                Start Recording
              </Button>
              <Button variant="contained" onClick={pauseRecording} disabled={!isRecording || isPaused}>
                Pause
              </Button>
              <Button variant="contained" onClick={resumeRecording} disabled={!isRecording || !isPaused}>
                Resume
              </Button>
              <Button variant="contained" color="error" onClick={stopRecording} disabled={!isRecording}>
                Stop
              </Button>
            </Stack>

          </Box>
        )}
      </Box>
    </div>
  );
}
