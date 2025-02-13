import { useState } from "react";
import Sidebar from "../components/Sidebar";
import NoteViewer from "../components/NoteViewer";

const notes = [
  { id: 1, title: "Meeting Notes", content: "Discussed project timeline and tasks..." },
  { id: 2, title: "Research Ideas", content: "Exploring AI-based categorization..." },
  { id: 3, title: "Daily Journal", content: "Reflecting on today’s progress..." },
];

export default function Home() {
  const [selectedNote, setSelectedNote] = useState(notes[0]);

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes} onSelect={setSelectedNote} selectedNote={selectedNote} />
      <NoteViewer note={selectedNote} />
    </div>
  );
}