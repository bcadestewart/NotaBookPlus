import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Login component (WIP): Provide a login form for users to authenticate via the backend.
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
        <input type="text" placeholder="Username" className="p-2 border rounded"
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" className="p-2 border rounded"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  );
}
