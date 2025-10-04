import React from 'react';

const SimpleDashboard = () => {
  const user = {
    name: 'Test OKU User',
    email: 'test@example.com',
    role: 'OKU User'
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP NAVIGATION BAR WITH LOGOUT BUTTON */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-800">🚐 OKUTransport</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                🏠 Dashboard
              </a>
              <a href="/bookings" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                📅 Bookings
              </a>
              <a href="/map" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                🗺️ Live Map
              </a>
            </div>

            {/* User Profile & LOGOUT BUTTON */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              
              {/* PROMINENT LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors shadow-md"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE LOGOUT BUTTON */}
      <div className="md:hidden bg-blue-50 p-4 border-b">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-900">Welcome, {user.name}!</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header with ANOTHER LOGOUT BUTTON */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Good morning, {user.name}! 👋</h1>
              <p className="text-blue-100 mt-2">Welcome to your {user.role} dashboard</p>
            </div>
            {/* HEADER LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 shadow-lg"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Completed Trips</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 text-white p-3 rounded-lg mr-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Live</p>
                <p className="text-sm text-gray-600">GPS Tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium">
                🚐 Book Transport
              </button>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium">
                🗺️ Track Drivers
              </button>
            </div>
          </div>

          {/* LOGOUT SECTION */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <h2 className="text-xl font-semibold mb-4 text-red-700">🚪 Session Management</h2>
            <p className="text-gray-600 mb-4">Click logout to safely end your session and return to homepage.</p>
            {/* MAIN LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
            >
              🚪 LOGOUT NOW
            </button>
          </div>
        </div>

        {/* Footer with Logout */}
        <footer className="mt-12 bg-gray-800 text-white py-8 rounded-lg">
          <div className="text-center">
            <p>&copy; 2024 OKU Transport System. All rights reserved.</p>
            <div className="mt-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-bold"
              >
                🚪 End Session
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SimpleDashboard;