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

export default function Sidebar({ notes, onSelectNote, onAddNote }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        backgroundColor: isDark ? "#2e2e2e" : "#ffffff", // ✅ hard switch based on mode
        color: isDark ? "#ffffff" : "#000000",            // ✅ ensure text is readable
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Notes
      </Typography>

      <Button
        variant="contained"
        onClick={onAddNote}
        sx={{ mb: 2 }}
        fullWidth
      >
        + New Note
      </Button>

      <Divider sx={{ mb: 2 }} />

      <List>
        {notes.map((note) => (
          <ListItemButton key={note.id} onClick={() => onSelectNote(note.id)}>
            <ListItemText primary={note.title || "Untitled Note"} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
