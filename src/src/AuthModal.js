import React, { useState } from "react";

// Demo users stored in localStorage
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users")) || [];
  } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

const roles = ["OKU User", "Driver", "Company Admin", "JKM Officer"];

export default function AuthModal({ isRegister, onClose, onSuccess }) {
  const [mode, setMode] = useState(isRegister ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: roles[0] });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Register
  function handleRegister(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      setError("All fields required.");
      return;
    }
    const users = getUsers();
    if (users.find(u => u.email === form.email)) {
      setError("Email already registered.");
      return;
    }
    users.push({ ...form });
    saveUsers(users);
    onSuccess({ ...form });
  }

  // Login
  function handleLogin(e) {
    e.preventDefault();
    const users = getUsers();
    const found = users.find(u => u.email === form.email && u.password === form.password && u.role === form.role);
    if (found) {
      onSuccess(found);
    } else {
      setError("Invalid credentials or role.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {mode === "login" ? "Sign in" : "Register"}
        </h2>
        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="w-full p-2.5 border rounded-lg bg-gray-50" placeholder="Your name" required />
            </div>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full p-2.5 border rounded-lg bg-gray-50" placeholder="name@company.com" required />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="w-full p-2.5 border rounded-lg bg-gray-50" placeholder="••••••••" required />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Login/Register as:</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full p-2.5 border rounded-lg bg-gray-50" required>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
            {mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <button onClick={() => setMode(m => m === "login" ? "register" : "login")}
            className="text-blue-800 hover:underline">
            {mode === "login" ? "Create an account" : "Already have an account?"}
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
      </div>
    </div>
  );
}