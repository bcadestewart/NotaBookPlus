import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Packer, Document, Paragraph } from 'docx';

const Home = () => {
  const [notes, setNotes] = useState([{ id: 1, title: 'Untitled Note', content: '' }]);
  const [selectedNoteId, setSelectedNoteId] = useState(1);
  const [editorContent, setEditorContent] = useState('');
  const [title, setTitle] = useState('Untitled Note');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const contentRef = useRef(null);

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote) {
      setEditorContent(selectedNote.content);
      setTitle(selectedNote.title);
    }
  }, [selectedNoteId, notes]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createNewNote = () => {
    const newId = Date.now();
    const newNote = { id: newId, title: 'Untitled Note', content: '' };
    const updated = notes.map(note =>
      note.id === selectedNoteId ? { ...note, content: editorContent } : note
    );
    setNotes([...updated, newNote]);
    setSelectedNoteId(newId);
    setEditorContent('');
    setTitle('Untitled Note');
  };

  const handleNoteSelect = (id) => {
    const updated = notes.map(note =>
      note.id === selectedNoteId ? { ...note, content: editorContent, title } : note
    );
    setNotes(updated);
    setSelectedNoteId(id);
  };

  const handleNoteChange = (value) => {
    setEditorContent(value);
    setNotes(notes.map(note =>
      note.id === selectedNoteId ? { ...note, content: value } : note
    ));
  };

  const handleRename = (id) => {
    const newTitle = prompt('Enter new title:');
    if (newTitle) {
      setNotes(notes.map(note =>
        note.id === id ? { ...note, title: newTitle } : note
      ));
    }
  };

  const handleTranscriptionUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const text = response.data?.text;
      if (text) {
        const updatedContent = `${editorContent}\n\n${text}`;
        setEditorContent(updatedContent);
        setNotes(notes.map(note =>
          note.id === selectedNoteId ? { ...note, content: updatedContent } : note
        ));
      } else {
        alert('No transcription result received.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Error while transcribing.');
    }
  };

  const handleSummarizeClick = async () => {
    if (!editorContent.trim()) {
      alert('Note is empty. Nothing to summarize.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/summarize', {
        text: editorContent,
      });
      const summary = response.data?.summary;
      if (summary) {
        const newId = Date.now();
        const summaryNote = {
          id: newId,
          title: `Summarization of ${title}`,
          content: `Summarization:\n\n${summary}`,
        };
        setNotes(prev => [...prev, summaryNote]);
        setSelectedNoteId(newId);
        setEditorContent(summaryNote.content);
        setTitle(summaryNote.title);
      } else {
        alert('No summary returned.');
      }
    } catch (err) {
      console.error('Summarize error:', err);
      alert('Error during summarization.');
    }
  };

  const handleDeleteNote = () => {
    const updated = notes.filter(note => note.id !== selectedNoteId);
    setNotes(updated);
    if (updated.length > 0) {
      setSelectedNoteId(updated[0].id);
    } else {
      createNewNote();
    }
  };

  const triggerFilePicker = () => fileInputRef.current.click();

  const handleExport = (type) => {
    const fileName = `${title}.${type}`;
    switch (type) {
      case 'txt':
        const txtBlob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
        saveAs(txtBlob, fileName);
        break;
      case 'pdf':
        const pdfDiv = document.createElement('div');
        pdfDiv.innerHTML = editorContent;
        html2pdf().from(pdfDiv).save(fileName);
        break;
      case 'png':
        if (!contentRef.current) return;
        html2canvas(contentRef.current).then(canvas => {
          canvas.toBlob(blob => {
            if (blob) saveAs(blob, fileName);
          });
        });
        break;
      case 'docx':
        const doc = new Document({
          sections: [{
            children: [new Paragraph(editorContent)],
          }],
        });
        Packer.toBlob(doc).then(blob => saveAs(blob, fileName));
        break;
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-gray-100 p-2">
        <button onClick={createNewNote} className="mb-2 px-2 py-1 bg-blue-500 text-white rounded">+ New Note</button>
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => handleNoteSelect(note.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleRename(note.id);
            }}
            className={`p-2 mb-1 cursor-pointer rounded ${note.id === selectedNoteId ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100`}
          >
            {note.title}
          </div>
        ))}
      </div>

      <div className="flex-1 p-2 flex flex-col">
        <div className="flex items-center mb-2 space-x-2">
          <button onClick={triggerFilePicker} className="px-3 py-1 bg-gray-300 rounded">Transcribe</button>
          <button onClick={handleSummarizeClick} className="px-3 py-1 bg-gray-300 rounded">Summarize</button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Export As
            </button>
            {isDropdownOpen && (
              <div className="absolute mt-1 grid grid-cols-2 gap-1 bg-white border rounded shadow w-32 p-1 z-10">
                {['txt', 'pdf', 'png', 'docx'].map(type => (
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

          <button onClick={handleDeleteNote} className="px-3 py-1 bg-red-500 text-white rounded">
            Delete Note
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleTranscriptionUpload}
            style={{ display: 'none' }}
          />
        </div>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => {
            setNotes(notes.map(note => note.id === selectedNoteId ? { ...note, title } : note));
          }}
          className="text-2xl font-bold border-b mb-2 outline-none"
        />

        <div className="editor-container flex-1 overflow-y-auto border rounded p-2" ref={contentRef}>
          <ReactQuill value={editorContent} onChange={handleNoteChange} theme="snow" />
        </div>
      </div>
    </div>
  );
};

export default Home;
