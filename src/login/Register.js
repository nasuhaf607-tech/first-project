import React, { useState, useEffect } from "react";
import AccessibilityForm from "./accessiblity";
import DriverRegistration from "./DriverRegistration";

export default function RegisterForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpen, setNextOpen] = useState(false); // second popup
  const [driverRegistrationOpen, setDriverRegistrationOpen] = useState(false);
  const [name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("OKU User");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // If user selected Driver, open driver registration form
    if (userType === "Driver") {
      setIsOpen(false);
      setDriverRegistrationOpen(true);
      return;
    }

    try {
      const response = await fetch("http://localhost/first-project/backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userType, phone, email, password }),
      });

      const data = await response.json();

      if (data.status !== "success") {
        setError(data.message);
        return;
      }

      setSuccess(data.message);

      // ✅ Slide to next form
      setTimeout(() => {
        setIsOpen(false);
        setNextOpen(true);
      }, 500);

      // reset form
      setFullname("");
      setEmail("");
      setPhone("");
      setPassword("");
      setUserType("OKU User");
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <>
      {/* Tailwind animations */}
      <style>
        {`
          @keyframes fadein {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .slide-enter {
            transform: translateX(100%);
            opacity: 0;
          }
          .slide-enter-active {
            transform: translateX(0%);
            opacity: 1;
            transition: all 0.5s ease-in-out;
          }
          .slide-exit {
            transform: translateX(0%);
            opacity: 1;
          }
          .slide-exit-active {
            transform: translateX(-100%);
            opacity: 0;
            transition: all 0.5s ease-in-out;
          }
        `}
      </style>

      {/* Register Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all duration-300 hover:-translate-y-0.5"
      >
        Register
      </button>

      {/* Register Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50
          bg-black/30 backdrop-blur-sm transition-opacity duration-500
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 
          ${isOpen ? "slide-enter-active" : "slide-exit-active"}`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>

          {/* Error / Success popup */}
          {error && (
            <div className="bg-red-500 text-white text-center p-2 rounded-lg mb-4 animate-fade-in">
              {error}
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium dark:text-white">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium dark:text-white">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium dark:text-white">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium dark:text-white">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium dark:text-white">
                Register as:
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
              >
                <option>OKU User</option>
                <option>Driver</option>
                <option>Company Admin</option>
                <option>JKM Officer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
            >
              Register
            </button>
          </form>
        </div>
      </div>

      {/* Next Popup (Accessibility / Preferences) */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50
          bg-black/30 backdrop-blur-sm transition-opacity duration-500
          ${nextOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 
          ${nextOpen ? "slide-enter-active" : "slide-exit-active"}`}
        >
          <button
            onClick={() => setNextOpen(false)}
            className="absolute top-3 right-3 text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>

          <AccessibilityForm />
        </div>
      </div>

      {/* Driver Registration Modal */}
      {driverRegistrationOpen && (
        <DriverRegistration
          onClose={() => {
            setDriverRegistrationOpen(false);
            setIsOpen(true);
          }}
          onSuccess={() => {
            setDriverRegistrationOpen(false);
            // Reset form
            setFullname("");
            setEmail("");
            setPhone("");
            setPassword("");
            setUserType("OKU User");
          }}
        />
      )}
    </>
  );
}
