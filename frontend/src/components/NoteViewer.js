import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NoteViewer = ({ content, onChange }) => {
  return (
    <div className="editor-container border border-gray-300 p-4 rounded overflow-auto flex-1">
      <ReactQuill
        value={content}
        onChange={onChange}
        theme="snow"
      />
    </div>
  );
};

export default NoteViewer;
