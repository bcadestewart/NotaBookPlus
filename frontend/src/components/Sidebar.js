function Sidebar({ notes, onSelect, selectedNote, onAddNote }) {
  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Notes</h2>
        <button
          onClick={onAddNote}
          className="ml-2 p-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          +
        </button>
      </div>
      {notes.map((note) => (
        <button
          key={note.id}
          className={`w-full mb-2 text-left p-2 rounded ${
            selectedNote && selectedNote.id === note.id ? "bg-gray-300" : "hover:bg-gray-200"
          }`}
          onClick={() => onSelect(note)}
        >
          {note.title || "Untitled Note"}
        </button>
      ))}
    </div>
  );
}

export default Sidebar;
