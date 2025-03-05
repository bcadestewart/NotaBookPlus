require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Note = require("./models/Note"); // ✅ Ensure this model exists

const app = express();
app.use(express.json());
app.use(cors());

// **Connect to MongoDB**
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// **Create a Note**
app.post("/notes", async (req, res) => {
  try {
    const newNote = new Note(req.body);
    await newNote.save();
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Get All Notes**
app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Update a Note**
app.put("/notes/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Delete a Note**
app.delete("/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Start the Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
