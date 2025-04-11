import { useState, useEffect } from "react";
import NoteViewer from "../components/NoteViewer";
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(savedNotes);
    if (savedNotes.length > 0) {
      setSelectedNoteId(savedNotes[0].id);
    }
  }, []);

  // Save notes to localStorage
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

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  return (
    <div style={{ display: "flex" }}>
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

      <NoteViewer
        note={selectedNote}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
}
