export default function NoteViewer({ note, content, setContent, onUpdate, onDelete }) {
  if (!note) {
    return (
      <div className="flex-1 p-8 text-gray-400 text-center">
        <p>Select or create a note to get started</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <input
        className="text-2xl font-bold mb-4 bg-transparent border-b border-gray-300 outline-none w-full"
        value={note.title || ""}
        onChange={(e) =>
          onUpdate(note.id, { ...note, title: e.target.value })
        }
      />

      <textarea
        className="w-full h-96 p-4 text-black"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="mt-4 flex gap-4">
        <button
		  onClick={() => onUpdate(note.id, { ...note, title: note.title, content })}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>

        <button
          onClick={() => {
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${note.title || "note"}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
