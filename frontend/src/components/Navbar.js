import { Link } from "react-router-dom";

export default function Navbar({ showLogin }) {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Note Taking App</h1>
      <div>
        <Link to="/" className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-700 transition">
          Home
        </Link>
        <Link to="/settings" className="ml-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition">
          Settings
        </Link>
        {showLogin && (
          <Link to="/login" className="ml-4 px-4 py-2 bg-green-500 rounded hover:bg-green-700 transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
