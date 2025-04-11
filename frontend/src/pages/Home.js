import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Document, Packer, Paragraph } from 'docx';

const Home = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Untitled Note', content: '' }
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState(1);
  const [editorContent, setEditorContent] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const fileInputRef = useRef(null);
  const selectedNote = notes.find(note => note.id === selectedNoteId);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    if (selectedNote) {
      setEditorContent(selectedNote.content);
    }
  }, [selectedNoteId, notes]);

  const createNewNote = () => {
    const newId = Date.now();
    const newNote = { id: newId, title: 'Untitled Note', content: '' };

    setNotes(prevNotes => {
      const updated = prevNotes.map(note =>
        note.id === selectedNoteId ? { ...note, content: editorContent } : note
      );
      return [...updated, newNote];
    });

    setTimeout(() => {
      setSelectedNoteId(newId);
      setEditorContent('');
    }, 0);
  };

  const handleNoteSelect = (id) => {
    const updatedNotes = notes.map(note => note.id === selectedNoteId ? { ...note, content: editorContent } : note);
    setNotes(updatedNotes);
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

  const handleDeleteNote = () => {
    const updated = notes.filter(note => note.id !== selectedNoteId);
    setNotes(updated);
    if (updated.length > 0) {
      setSelectedNoteId(updated[0].id);
      setEditorContent(updated[0].content);
    } else {
      const fallbackNote = { id: Date.now(), title: 'Untitled Note', content: '' };
      setNotes([fallbackNote]);
      setSelectedNoteId(fallbackNote.id);
      setEditorContent('');
    }
  };

  const handleExportTXT = () => {
    const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${selectedNote?.title || 'note'}.txt`);
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = editorContent;
    html2pdf().from(element).save(`${selectedNote?.title || 'note'}.pdf`);
    setShowExportDropdown(false);
  };

  const handleExportPNG = () => {
    const container = document.querySelector('.ql-editor');
    html2canvas(container).then(canvas => {
      canvas.toBlob(blob => {
        saveAs(blob, `${selectedNote?.title || 'note'}.png`);
      });
    });
    setShowExportDropdown(false);
  };

  const handleExportDOCX = async () => {
    const paragraphs = editorContent
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => new Paragraph(line));
    const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${selectedNote?.title || 'note'}.docx`);
    setShowExportDropdown(false);
  };

  const toggleExportDropdown = () => {
    setShowExportDropdown(prev => !prev);
  };

  const triggerFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleTranscriptionUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/transcribe', formData);
      const text = response.data?.text;
      if (text) {
        setEditorContent(prev => `${prev}\n\n${text}`);
        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.id === selectedNoteId
              ? { ...note, content: `${editorContent}\n\n${text}` }
              : note
          )
        );
      } else {
        alert('No transcription result received.');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('An error occurred while transcribing.');
    }
  };

  const handleSummarizeClick = async () => {
    if (!editorContent.trim()) return alert("Note is empty.");
    try {
      const response = await axios.post('http://localhost:8000/summarize', { text: editorContent });
      const summary = response.data?.summary;
      if (summary) {
        const newId = Date.now();
        const summaryNote = {
          id: newId,
          title: `Summarization of ${selectedNote?.title || "Note"}`,
          content: `Summarization:\n\n${summary}`
        };
        setNotes(prevNotes => [...prevNotes, summaryNote]);
        setSelectedNoteId(newId);
        setEditorContent(summaryNote.content);
      } else {
        alert("No summary returned.");
      }
    } catch (err) {
      console.error("Summarization error:", err);
      alert("Error summarizing.");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'recording.wav';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-gray-100 p-2">
        <button
          onClick={createNewNote}
          className="mb-2 px-2 py-1 bg-blue-500 text-white rounded"
        >
          + New Note
        </button>
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
        {/* Top row buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <button onClick={triggerFilePicker} className="px-4 py-1 bg-gray-300 rounded">Transcribe</button>
          <button onClick={handleSummarizeClick} className="px-4 py-1 bg-gray-300 rounded">Summarize</button>
          <button onClick={startRecording} className="px-4 py-1 bg-green-500 text-white rounded">Start</button>
          <button onClick={pauseRecording} className="px-4 py-1 bg-yellow-500 text-black rounded">Pause</button>
          <button onClick={resumeRecording} className="px-4 py-1 bg-blue-500 text-white rounded">Resume</button>
          <button onClick={stopRecording} className="px-4 py-1 bg-red-500 text-white rounded">Stop</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleTranscriptionUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Export + Delete row */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="relative">
            <button onClick={toggleExportDropdown} className="px-4 py-1 bg-gray-500 text-white rounded">Export As</button>
            {showExportDropdown && (
              <div
                className="absolute mt-2 grid grid-cols-2 gap-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50"
                onMouseLeave={() => setShowExportDropdown(false)}
              >
                <button onClick={handleExportTXT} className="px-2 py-1 hover:bg-gray-100 text-left">TXT</button>
                <button onClick={handleExportPDF} className="px-2 py-1 hover:bg-gray-100 text-left">PDF</button>
                <button onClick={handleExportPNG} className="px-2 py-1 hover:bg-gray-100 text-left">PNG</button>
                <button onClick={handleExportDOCX} className="px-2 py-1 hover:bg-gray-100 text-left">DOCX</button>
              </div>
            )}
          </div>
          <button onClick={handleDeleteNote} className="px-4 py-1 bg-red-500 text-white rounded">Delete Note</button>
        </div>

        <div className="editor-container">
          <ReactQuill
            value={editorContent}
            onChange={handleNoteChange}
            theme="snow"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
