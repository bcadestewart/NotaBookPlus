import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import NoteViewer from "../components/NoteViewer";

const API_URL = "http://localhost:5000/notes";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then((response) => {
        setNotes(response.data);
        if (response.data.length > 0) setSelectedNote(response.data[0]);
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, []);

  const updateNoteContent = (id, newContent) => {
    axios.put(`${API_URL}/${id}`, { content: newContent })
      .then(() => {
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === id ? { ...note, content: newContent } : note
          )
        );
      })
      .catch((error) => console.error("Error updating note:", error));
  };

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} onSelect={setSelectedNote} selectedNote={selectedNote} />
      {selectedNote ? (
        <NoteViewer note={selectedNote} onUpdate={updateNoteContent} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No note selected
        </div>
      )}
    </div>
  );
}
