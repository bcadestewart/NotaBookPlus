import { useState, useEffect } from "react";

export default function NoteViewer({ note, onUpdate }) {
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setContent(note.content); // Update content when the selected note changes
  }, [note]);

  return (
    <div className="flex-1 p-6">
      <div className="border rounded-lg p-4 bg-white shadow">
        <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
        <textarea
          className="w-full h-64 border p-2 rounded mt-2"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onUpdate(note._id, e.target.value); // Ensure _id is used correctly
          }}
          placeholder="Start typing your note here..."
        />
      </div>
      <button
        onClick={() => onUpdate(note._id, content)}
        className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-700 hover:scale-105 transition-transform"
      >
        Save Note
      </button>
    </div>
  );
}
