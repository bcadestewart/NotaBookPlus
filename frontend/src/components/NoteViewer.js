import React from "react";

const NoteViewer = ({ note, content, setContent, onUpdate, onDelete }) => {
  if (!note) {
    return (
      <div className="flex-1 p-4">
        <p className="text-gray-400">Select a note to view or edit</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
      <textarea
        className="w-full h-64 p-2 bg-gray-900 text-white border border-gray-700 rounded resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onUpdate(note.id, content)}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-700 hover:scale-105 transition-transform"
        >
          Save Note
        </button>
        <button
          onClick={() => {
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${note.title || "note"}.txt`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 hover:scale-105 transition-transform"
        >
          Export as .txt
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-800 hover:scale-105 transition-transform"
        >
          Delete Note
        </button>
      </div>
    </div>
  );
};

export default NoteViewer;
