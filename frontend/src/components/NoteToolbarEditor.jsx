import React from "react";


const NoteToolbarEditor = ({ onTranscribe, onSummarize }) => {
  return (
    <div className="toolbar-editor">
      <button className="toolbar-button" onClick={onTranscribe}>
        Transcribe
      </button>
      <button className="toolbar-button" onClick={onSummarize}>
        Summarize
      </button>
    </div>
  );
};

export default NoteToolbarEditor;
