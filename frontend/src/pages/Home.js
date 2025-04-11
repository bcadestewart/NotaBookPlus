import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NoteViewer from "../components/NoteViewer";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("notes");
    const parsedNotes = stored ? JSON.parse(stored) : [];
    setNotes(parsedNotes);
    if (parsedNotes.length > 0) setSelectedNote(parsedNotes[0]);
  }, []);

  useEffect(() => {
    if (selectedNote) setContent(selectedNote.content);
  }, [selectedNote]);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      content: "",
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    setSelectedNote(newNote);
  };

  const updateNoteContent = (id, changes) => {
    const updated = notes.map((note) =>
      note.id === id ? { ...note, ...changes } : note
    );
    setNotes(updated);
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => ({ ...prev, ...changes }));
    }
  };

  const deleteNote = (id) => {
    const filtered = notes.filter((note) => note.id !== id);
    setNotes(filtered);
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  return (
    <div className="flex h-full bg-gray-800 text-white">
      <Sidebar
        notes={notes}
        onAddNote={addNote}
        onSelect={setSelectedNote}
        selectedNote={selectedNote}
      />
      <NoteViewer
        note={selectedNote}
        content={content}
        setContent={setContent}
        onUpdate={updateNoteContent}
        onDelete={deleteNote}
      />
    </div>
  );
}
