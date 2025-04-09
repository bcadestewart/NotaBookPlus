function Sidebar({ notes, onSelect, selectedNote }) {
  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r">
      <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
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
