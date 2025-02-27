export default function Login() {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form className="flex flex-col space-y-4">
          <input type="text" placeholder="Username" className="p-2 border rounded" />
          <input type="password" placeholder="Password" className="p-2 border rounded" />
          <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>
      </div>
    );
  }
  