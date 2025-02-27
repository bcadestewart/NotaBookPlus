import { useState, useEffect } from "react";

function NoteViewer({ note, onUpdate }) {
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
            onUpdate(note.id, e.target.value); // Update the note content
          }}
          placeholder="Start typing your note here..."
        />
      </div>
    </div>
  );
}

export default NoteViewer;
