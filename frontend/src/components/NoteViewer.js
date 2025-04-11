import { useState, useEffect } from "react";

export default function NoteViewer({ note, onUpdate, onDelete }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setContent(note.content || "");
    }
  }, [note]);

  if (!note) {
    return (
      <div className="flex-1 p-6 text-center text-gray-500">
        No note selected
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="border rounded-lg p-4 bg-white shadow">
        <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
        <textarea
          className="w-full h-64 border p-2 rounded mt-2"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onUpdate(note.id, e.target.value);
          }}
          placeholder="Start typing your note here..."
        />
      </div>
      <div className="mt-4">
        <button
          onClick={() => onUpdate(note.id, content)}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-700 hover:scale-105 transition-transform"
        >
          Save Note
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="ml-4 p-2 bg-red-500 text-white rounded hover:bg-red-700 hover:scale-105 transition-transform"
        >
          Delete Note
        </button>
      </div>
    </div>
  );
}
