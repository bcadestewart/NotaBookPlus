import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Packer, Document, Paragraph } from 'docx';

const NoteViewer = ({ note, onUpdate, onDelete }) => {
  const [content, setContent] = useState(note.content || '');
  const [title, setTitle] = useState(note.title || 'Untitled Note');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setContent(note.content || '');
    setTitle(note.title || 'Untitled Note');
  }, [note]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    onUpdate({ ...note, title, content });
  };

  const exportAsTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${title}.txt`);
  };

  const exportAsPdf = () => {
    const element = document.createElement('div');
    element.innerHTML = content;
    html2pdf().from(element).save(`${title}.pdf`);
  };

  const exportAsPng = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current);
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, `${title}.png`);
    });
  };

  const exportAsDocx = async () => {
    const doc = new Document({
      sections: [{
        children: [new Paragraph(content)],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  const handleExport = (type) => {
    switch (type) {
      case 'txt': exportAsTxt(); break;
      case 'pdf': exportAsPdf(); break;
      case 'png': exportAsPng(); break;
      case 'docx': exportAsDocx(); break;
      default: break;
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="text-2xl font-bold mb-1 border-b outline-none flex-grow mr-2"
        />
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
          >
            Export As
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 grid grid-cols-2 gap-1 bg-white border rounded shadow w-32 p-1 z-10">
              {['txt', 'pdf', 'png', 'docx'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className="text-sm px-2 py-1 hover:bg-blue-100 text-left"
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(note.id)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Delete Note
        </button>
      </div>

      <div
        ref={contentRef}
        contentEditable
        className="flex-1 border p-2 rounded overflow-y-auto"
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default NoteViewer;
