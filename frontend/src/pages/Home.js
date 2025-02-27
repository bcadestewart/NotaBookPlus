import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import NoteViewer from "../components/NoteViewer";
import { deleteNote } from "../utils/noteFunctions";

const API_URL = "http://localhost:5000/notes";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  // Load notes from API when the app starts
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
        setNotes((prevNotes) => prevNotes.map((note) =>
          note._id === id ? { ...note, content: newContent } : note
        ));
      })
      .catch((error) => console.error("Error updating note:", error));
  };

  const createNote = () => {
    const newNote = { title: "New Note", content: "" };
    axios.post(API_URL, newNote)
      .then((response) => {
        setNotes((prevNotes) => [...prevNotes, response.data]);
        setSelectedNote(response.data);
      })
      .catch((error) => console.error("Error creating note:", error));
  };

  const handleDeleteNote = (id) => {
    deleteNote(id, setNotes, setSelectedNote);
  };

  const saveNote = () => {
    if (selectedNote) {
      axios.put(`${API_URL}/${selectedNote._id}`, selectedNote)
        .then(() => {
          setNotes((prevNotes) => prevNotes.map((note) =>
            note._id === selectedNote._id ? selectedNote : note
          ));
        })
        .catch((error) => console.error("Error saving note:", error));
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} onSelect={setSelectedNote} selectedNote={selectedNote} />
      {selectedNote ? (
        <div className="flex-1 p-6">
          <NoteViewer note={selectedNote} onUpdate={updateNoteContent} />
          <button 
            onClick={saveNote} 
            className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-700 hover:scale-105 transition-transform">
            Save Note
          </button>
          <button 
            onClick={() => handleDeleteNote(selectedNote._id)} 
            className="mt-4 ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-700 hover:scale-105 transition-transform">
            Delete Note
          </button>
        </div>
      ) : (
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-500">No note selected</p>
        </div>
      )}
      <button 
        onClick={createNote} 
        className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 hover:scale-105 transition-transform">
        Add Note
      </button>
    </div>
  );
}
