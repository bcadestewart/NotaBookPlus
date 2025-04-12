import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TranscriptionButton from "../components/TranscriptionButton";
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

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
    };
    setNotes([...notes, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const handleNoteSelect = (id) => {
    setSelectedNoteId(id);
  };

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

  const handleSummarize = () => {
    alert("Summarize feature is not implemented yet.");
  };

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

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
        <Typography variant="h6" gutterBottom>
          Your Notes
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={createNewNote}
          sx={{ mb: 2 }}
        >
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
          <Button variant="outlined" onClick={handleSummarize}>Summarize</Button>
          <TranscriptionButton onTranscribe={(text) => handleUpdateNote(selectedNoteId, text)} />
        </Stack>
        {selectedNote && (
          <Box p={2}>
            <ReactQuill
              theme="snow"
              value={selectedNote.content}
              onChange={(value) => handleUpdateNote(selectedNote.id, value)}
              modules={quillModules}
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeleteNote(selectedNote.id)}
              sx={{ mt: 2 }}
            >
              Delete Note
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
}
