import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import NoteViewer from "../components/NoteViewer";

const API_URL = "http://localhost:5000/notes"; // ✅ Backend API URL

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  // ✅ Load notes from MongoDB when the app starts
  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        setNotes(response.data);
        if (response.data.length > 0) setSelectedNote(response.data[0]);
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, []);

  // ✅ Add a new note (saved to MongoDB)
  const addNote = () => {
    const newNote = { title: "New Note", content: "" };
    axios.post(API_URL, newNote)
      .then((response) => {
        setNotes([...notes, response.data]); // ✅ Update local state
        setSelectedNote(response.data);  // ✅ Auto-select new note
      })
      .catch((error) => console.error("Error adding note:", error));
  };

  // ✅ Update note content in MongoDB
  const updateNoteContent = (id, newContent) => {
    axios.put(`${API_URL}/${id}`, { content: newContent })
      .then(() => {
        const updatedNotes = notes.map((note) =>
          note._id === id ? { ...note, content: newContent } : note
        );
        setNotes(updatedNotes);
      })
      .catch((error) => console.error("Error updating note:", error));
  };

  // ✅ Delete a note from MongoDB
  const deleteNote = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        const updatedNotes = notes.filter((note) => note._id !== id);
        setNotes(updatedNotes);
        setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      })
      .catch((error) => console.error("Error deleting note:", error));
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
