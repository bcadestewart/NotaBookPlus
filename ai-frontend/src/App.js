import { useState } from "react";
import axios from "axios";

export default function SpeechToTextApp() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setAudioFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!audioFile) {
      alert("Please select a file first.");
      return;
    }
    
    setLoading(true);

    const formData = new FormData();
    formData.append("file", audioFile);

    try {
      console.log("Uploading file:", audioFile.name);

      const response = await axios.post("http://127.0.0.1:8000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000, // Set timeout to 10 minutes
      });

      console.log("Server Response:", response.data);
      setTranscription(response.data.text || "Error: No transcription received.");
    } catch (error) {
      console.error("Error uploading file:", error);
      setTranscription("Error: Failed to transcribe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcription) {
      alert("No transcription available to summarize.");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("Sending text to summarize:", transcription);
  
      const response = await axios.post("http://127.0.0.1:8000/summarize", { text: transcription });
  
      console.log("Summary Response:", response.data);
  
      setSummary(response.data.summary || "Error: No summary received.");
    } catch (error) {
      console.error("Error summarizing text:", error);
      setSummary("Error: Failed to summarize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Speech to Text Summarizer</h1>
      
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      
      <button onClick={handleUpload} className="m-2 p-2 bg-blue-500 text-white">
        Transcribe
      </button>
      
      <button onClick={handleSummarize} className="m-2 p-2 bg-green-500 text-white">
        Summarize
      </button>

      {loading && <p className="mt-4 text-red-500">Processing... This may take a while.</p>}

      <p><strong>Transcription:</strong> {transcription}</p>
      <p><strong>Summary:</strong> {summary}</p>
    </div>
  );
}
