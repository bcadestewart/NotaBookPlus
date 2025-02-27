import axios from "axios";

const API_URL = "http://localhost:5000/notes";

export const deleteNote = (id, setNotes, setSelectedNote) => {
  axios.delete(`${API_URL}/${id}`)
    .then(() => {
      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note._id !== id);
        setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
        return updatedNotes;
      });
    })
    .catch((error) => console.error("Error deleting note:", error));
};
