import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Navbar showLogin={true} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <button
        onClick={() => alert("Add Note Clicked")}
        className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 hover:scale-105 transition-transform"
      >
        Add Note
      </button>
    </Router>
  );
}

