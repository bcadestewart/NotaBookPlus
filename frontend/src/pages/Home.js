import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const Home = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Untitled Note', content: '' }
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState(1);
  const [editorContent, setEditorContent] = useState('');

  const fileInputRef = useRef(null);

  const selectedNote = notes.find(note => note.id === selectedNoteId);

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

  const handleTranscriptionUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  const triggerFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleSummarizeClick = async () => {
    if (!editorContent.trim()) {
      alert("Current note is empty. Nothing to summarize.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/summarize', {
        text: editorContent
      });

      const summary = response.data?.summary;
      if (summary) {
        const newId = Date.now();
        const summaryNote = {
          id: newId,
          title: `Summarization of ${selectedNote?.title || "Untitled Note"}`,
          content: `Summarization:\n\n${summary}`
        };

        setNotes(prevNotes => [...prevNotes, summaryNote]);
        setSelectedNoteId(newId);
        setEditorContent(summaryNote.content);
      } else {
        alert("No summary received from server.");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      alert("An error occurred while summarizing.");
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
        <div className="flex mb-2">
          <button onClick={triggerFilePicker} className="px-4 py-1 bg-gray-300 rounded mr-2">Transcribe</button>
          <button onClick={handleSummarizeClick} className="px-4 py-1 bg-gray-300 rounded">Summarize</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleTranscriptionUpload}
            style={{ display: 'none' }}
          />
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
