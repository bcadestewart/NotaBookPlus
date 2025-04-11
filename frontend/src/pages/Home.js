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
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  useEffect(() => {
    const note = notes.find(note => note.id === selectedNoteId);
    if (note) setEditorContent(note.content);
  }, [selectedNoteId, notes]);

  const createNewNote = () => {
    const newId = Date.now();
    const newNote = { id: newId, title: 'Untitled Note', content: '' };
    setNotes(prev =>
      [...prev.map(n => n.id === selectedNoteId ? { ...n, content: editorContent } : n), newNote]
    );
    setSelectedNoteId(newId);
    setEditorContent('');
  };

  const handleNoteSelect = (id) => {
    const updated = notes.map(note => note.id === selectedNoteId ? { ...note, content: editorContent } : note);
    setNotes(updated);
    setSelectedNoteId(id);
  };

  const handleNoteChange = (value) => {
    setEditorContent(value);
    setNotes(notes.map(note => note.id === selectedNoteId ? { ...note, content: value } : note));
  };

  const handleRename = (id) => {
    const newTitle = prompt('Enter new title:');
    if (newTitle) {
      setNotes(notes.map(note => note.id === id ? { ...note, title: newTitle } : note));
    }
  };

  const handleDeleteNote = () => {
    setNotes(prev => prev.filter(note => note.id !== selectedNoteId));
    if (notes.length > 1) setSelectedNoteId(notes[0].id);
    else createNewNote();
  };

  const handleTranscriptionUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:8000/transcribe', formData);
      const text = res.data?.text;
      if (text) {
        setEditorContent(prev => `${prev}\n\n${text}`);
        setNotes(prev =>
          prev.map(note => note.id === selectedNoteId ? { ...note, content: `${editorContent}\n\n${text}` } : note)
        );
      } else alert('No transcription result.');
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Error transcribing.');
    }
  };

  const handleSummarizeClick = async () => {
    if (!editorContent.trim()) return alert("Note is empty.");
    try {
      const res = await axios.post('http://localhost:8000/summarize', { text: editorContent });
      const summary = res.data?.summary;
      if (summary) {
        const newNote = {
          id: Date.now(),
          title: `Summary of ${selectedNote?.title || "Note"}`,
          content: `Summary:\n\n${summary}`
        };
        setNotes(prev => [...prev, newNote]);
        setSelectedNoteId(newNote.id);
        setEditorContent(newNote.content);
      } else alert("No summary received.");
    } catch (err) {
      console.error("Summarize error:", err);
      alert("Error summarizing.");
    }
  };

  const triggerFilePicker = () => fileInputRef.current.click();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.wav';
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const exportAsTxt = () => {
    const blob = new Blob([editorContent], { type: 'text/plain' });
    saveAs(blob, `${selectedNote?.title || "note"}.txt`);
  };

  const exportAsPDF = () => {
    const opt = { margin: 1, filename: `${selectedNote?.title || "note"}.pdf`, html2canvas: {}, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(document.querySelector('.editor-container')).save();
  };

  const exportAsPNG = () => {
    html2canvas(document.querySelector('.editor-container')).then(canvas => {
      canvas.toBlob(blob => saveAs(blob, `${selectedNote?.title || "note"}.png`));
    });
  };

  const exportAsDOCX = () => {
    const doc = new Document({ sections: [{ children: [new Paragraph(editorContent)] }] });
    Packer.toBlob(doc).then(blob => saveAs(blob, `${selectedNote?.title || "note"}.docx`));
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/5 bg-gray-100 p-2">
        <button onClick={createNewNote} className="mb-2 px-2 py-1 bg-blue-500 text-white rounded">+ New Note</button>
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => handleNoteSelect(note.id)}
            onContextMenu={(e) => { e.preventDefault(); handleRename(note.id); }}
            className={`p-2 mb-1 cursor-pointer rounded ${note.id === selectedNoteId ? 'bg-blue-200' : 'bg-white'} hover:bg-blue-100`}>
            {note.title}
          </div>
        ))}
      </div>

      <div className="flex-1 p-2 flex flex-col">
        {/* Top Buttons */}
        <div className="flex flex-wrap mb-2 space-x-2 items-center">
          <button onClick={triggerFilePicker} className="px-4 py-1 bg-gray-300 rounded">Transcribe</button>
          <button onClick={handleSummarizeClick} className="px-4 py-1 bg-gray-300 rounded">Summarize</button>
          <button onClick={startRecording} className={`px-4 py-1 rounded ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-300'}`}>Start Recording</button>
          {isRecording && !isPaused && (
            <>
              <button onClick={pauseRecording} className="px-4 py-1 bg-yellow-400 rounded">Pause</button>
              <button onClick={stopRecording} className="px-4 py-1 bg-gray-400 rounded">Stop</button>
            </>
          )}
          {isRecording && isPaused && (
            <>
              <button onClick={resumeRecording} className="px-4 py-1 bg-green-400 rounded">Resume</button>
              <button onClick={stopRecording} className="px-4 py-1 bg-gray-400 rounded">Stop</button>
            </>
          )}
          {isRecording && <span className="text-red-500 font-semibold ml-2">Recording...</span>}
          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleTranscriptionUpload} style={{ display: 'none' }} />
        </div>

        {/* Export & Delete */}
        <div className="flex flex-wrap mb-2 space-x-2">
          <div className="relative">
            <button onClick={() => setShowExportDropdown(prev => !prev)} className="px-4 py-1 bg-purple-400 text-white rounded">Export As</button>
            {showExportDropdown && (
              <div className="absolute z-10 grid grid-cols-2 gap-2 bg-white border border-gray-300 rounded p-2 mt-1">
                <button onClick={exportAsTxt} className="px-2 py-1 bg-gray-200 rounded">TXT</button>
                <button onClick={exportAsPDF} className="px-2 py-1 bg-gray-200 rounded">PDF</button>
                <button onClick={exportAsPNG} className="px-2 py-1 bg-gray-200 rounded">PNG</button>
                <button onClick={exportAsDOCX} className="px-2 py-1 bg-gray-200 rounded">DOCX</button>
              </div>
            )}
          </div>
          <button onClick={handleDeleteNote} className="px-4 py-1 bg-red-400 text-white rounded">Delete Note</button>
        </div>

        {/* Editor */}
        <div className="editor-container flex-1">
          <ReactQuill value={editorContent} onChange={handleNoteChange} theme="snow" />
        </div>
      </div>
    </div>
  );
};

export default Home;
