import React, { useRef } from 'react';
import axios from 'axios';

/*
* Transcription button that allows users to upload an audio file like .wav, .mp3
* Sends the file to the backend for transcription and passes the result back to the parent component via the 'onTranscription' callback
*/
const TranscriptionButton = ({ onTranscription }) => {
  const fileInputRef = useRef(null);

  // Triggered when a file is selected
  const handleFileChange = async (event) => {
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
        onTranscription(text);
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

  return (
    <>
      <button
        onClick={triggerFilePicker}
        className="px-4 py-1 bg-gray-300 rounded mr-2"
      >
        Transcribe
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default TranscriptionButton;