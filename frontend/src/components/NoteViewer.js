import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
} from "@mui/material";

export default function NoteViewer({ note, onUpdate, onDelete }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
    }
  }, [note]);

  if (!note) {
    return (
      <Box flex={1} display="flex" justifyContent="center" alignItems="center">
        <Typography variant="body1" color="textSecondary">
          No note selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box flex={1} p={4}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {note.title}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          variant="outlined"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onUpdate(note.id, e.target.value);
          }}
          placeholder="Start typing your note here..."
        />
        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => onUpdate(note.id, content)}
          >
            Save Note
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onDelete(note.id)}
          >
            Delete Note
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
