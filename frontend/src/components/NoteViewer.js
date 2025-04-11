import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function NoteViewer({ note, content, setContent, onUpdate, onDelete }) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const exportRef = useRef(null);

  if (!note) {
    return (
      <div className="flex-1 p-8 text-gray-400 text-center">
        <p>Select or create a note to get started</p>
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const exportPNG = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1400;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px Arial";
    ctx.fillText(note.title || "Untitled Note", 40, 60);

    ctx.font = "16px Arial";
    const lines = content.split("\n");
    let y = 100;
    lines.forEach((line) => {
      ctx.fillText(line, 40, y);
      y += 24;
    });

    const imgURL = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imgURL;
    a.download = `${note.title || "note"}.png`;
    a.click();
    setShowExportOptions(false);
  };

  const exportDOCX = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: note.title || "Untitled Note",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            ...content.split("\n").map((line) =>
              new Paragraph({
                children: [new TextRun(line)],
              })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title || "note"}.docx`;
    a.click();
    URL.revokeObjectURL(url);
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

      <div className="mt-4 flex gap-4 relative" ref={exportRef}>
        <button
          onClick={() => onUpdate(note.id, { ...note, title: note.title, content })}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="bg-green-500 text-white px-6 py-2 w-40 rounded hover:bg-green-700 text-center"
          >
            Export as ⌄
          </button>
          {showExportOptions && (
            <div className="absolute w-40 bg-white text-black rounded shadow-md mt-2 z-10 grid grid-cols-2 divide-x divide-y border text-sm text-center">
              <button
                onClick={exportTXT}
                className="px-4 py-2 hover:bg-gray-100"
              >
                TXT
              </button>
              <button
                onClick={exportPDF}
                className="px-4 py-2 hover:bg-gray-100"
              >
                PDF
              </button>
              <button
                onClick={exportPNG}
                className="px-4 py-2 hover:bg-gray-100"
              >
                PNG
              </button>
              <button
                onClick={exportDOCX}
                className="px-4 py-2 hover:bg-gray-100"
              >
                DOCX
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
