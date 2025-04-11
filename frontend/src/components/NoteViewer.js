import { useState } from "react";
import { jsPDF } from "jspdf";

export default function NoteViewer({ note, content, setContent, onUpdate, onDelete }) {
  const [showExportOptions, setShowExportOptions] = useState(false);

  if (!note) {
    return (
      <div className="flex-1 p-8 text-gray-400 text-center">
        <p>Select or create a note to get started</p>
      </div>
    );
  }

  const exportTXT = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title || "note"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(note.title || "Untitled Note", 10, 10);
    doc.setFontSize(12);
    doc.text(content, 10, 20);
    doc.save(`${note.title || "note"}.pdf`);
    setShowExportOptions(false);
  };

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

      <div className="mt-4 flex gap-4 relative">
        <button
          onClick={() => onUpdate(note.id, { ...note, title: note.title, content })}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export as ⌄
          </button>
          {showExportOptions && (
            <div className="absolute bg-white text-black rounded shadow-md mt-2 z-10">
              <button
                onClick={exportTXT}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                TXT
              </button>
              <button
                onClick={exportPDF}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                PDF
              </button>
            </div>
          )}
        </div>

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
