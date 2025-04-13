import { Link } from "react-router-dom";

// Register Component (WIP): Provides a static registration form UI.
export default function Register() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
      <form className="flex flex-col space-y-4">
        <input type="text" placeholder="Username" className="p-2 border rounded" />
        <input type="password" placeholder="Password" className="p-2 border rounded" />
        <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">
          Create Account
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
