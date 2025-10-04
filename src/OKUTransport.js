import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './output.css';

// make sure the filename matches case

const OKUTransport = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>

      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white shadow-md px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-800">🚐 OKUTransport</h1>
        <div className="hidden md:flex space-x-6">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-blue-800 hover:text-blue-600 font-medium px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 px-6 animate-fadeIn">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="block w-full text-left py-3 px-4 text-blue-800 hover:text-blue-600 font-medium rounded-lg transition-all duration-300 hover:bg-blue-50 hover:pl-6"
          >
            Login
          </button>
          <a
            onClick={() => setIsRegisterOpen(true)}
            className="block py-3 px-4 text-blue-800 hover:text-blue-600 font-medium rounded-lg transition-all duration-300 hover:bg-blue-50 hover:pl-6 mt-2"
          >
            Register
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 px-6 md:py-20 md:px-12 bg-gradient-to-r from-blue-900 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-soft-light"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-soft-light"></div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Monthly Transport Service
            </h1>
            <div className="mb-6">
              <span className="text-3xl font-bold bg-white text-blue-800 px-2 py-1 inline-block transform -skew-x-3 hover:skew-x-0 transition-all duration-300">
                OKU
              </span>
              <span className="text-3xl font-bold ml-2">Transport</span>
            </div>
            <p className="text-lg mb-8 opacity-90 leading-relaxed">
              Dedicated monthly transport service with assigned drivers in Kuala
              Terengganu, approved and funded by JKM
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-800 px-6 py-3 rounded-md font-semibold transition-all duration-300 hover:bg-blue-100 hover:shadow-lg transform hover:-translate-y-1">
                Request Monthly Service
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold transition-all duration-300 hover:bg-white hover:text-blue-800 hover:shadow-lg transform hover:-translate-y-1">
                Learn More
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="bg-blue-600/80 backdrop-blur-sm rounded-xl p-6 w-full max-w-md h-64 flex items-center justify-center transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-blue-500/90">
              <span className="text-white text-lg">Transportation Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Why Choose Our Service?
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Professional, reliable, and accessible transport designed
            specifically for the OKU community
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-blue-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-110">
                <svg
                  className="w-8 h-8 text-blue-800 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                Assigned Driver
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                Get your dedicated driver for the entire month, ensuring
                consistency and familiarity with your specific needs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-blue-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-110">
                <svg
                  className="w-8 h-8 text-blue-800 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                Monthly Planning
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                Pre-planned monthly service schedule approved by JKM, giving you
                peace of mind and reliable transport.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-blue-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-110">
                <svg
                  className="w-8 h-8 text-blue-800 transition-all duration-300 group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                JKM Approved
              </h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                Fully approved and funded by Jabatan Kebajikan Masyarakat,
                ensuring quality and accessibility standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6 transition-colors duration-500 hover:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="transition-all duration-300 hover:scale-105 inline-block">
            © {new Date().getFullYear()} OKU Transport. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default OKUTransport;
