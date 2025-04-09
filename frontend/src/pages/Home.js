import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NoteViewer from "../components/NoteViewer";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("notes");
    const parsedNotes = stored ? JSON.parse(stored) : [];
    setNotes(parsedNotes);
    if (parsedNotes.length > 0) setSelectedNote(parsedNotes[0]);
  }, []);

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

  const updateNoteContent = (id, content) => {
    const updated = notes.map((note) =>
      note.id === id ? { ...note, content } : note
    );
    setNotes(updated);
  };

  const deleteNote = (id) => {
    const updated = notes.filter((note) => note.id !== id);
    setNotes(updated);
    setSelectedNote(updated.length > 0 ? updated[0] : null);
  };

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} onSelect={setSelectedNote} selectedNote={selectedNote} />
      {selectedNote ? (
        <NoteViewer note={selectedNote} onUpdate={updateNoteContent} onDelete={deleteNote} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No note selected
        </div>
      )}
      <button
        onClick={addNote}
        className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 hover:scale-105 transition-transform"
      >
        Add Note
      </button>
    </div>
  );
}
