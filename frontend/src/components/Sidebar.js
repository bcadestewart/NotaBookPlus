// src/components/Sidebar.js
import React from 'react';

const Sidebar = ({ notes, onSelectNote, onAddNote }) => {
  return (
    <div className="w-64 bg-gray-100 h-full p-4">
      <h2 className="font-semibold mb-4">Your Notes</h2>
      <button
        onClick={onAddNote}
        className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        + New Note
      </button>
      <ul>
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className="cursor-pointer py-1 px-2 hover:bg-gray-200 rounded"
          >
            {note.title || 'Untitled Note'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
