import React, { useState } from 'react';

const SimpleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (email, password) => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Attempting login with:', email);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      const result = await response.json();
      console.log('Login response data:', result);
      
      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setMessage('✅ Login successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setMessage('❌ Login failed: ' + result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('❌ Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (type) => {
    if (type === 'oku') {
      handleLogin('test@example.com', 'password123');
    } else if (type === 'driver') {
      handleLogin('ahmad@driver.com', 'password123');
    } else if (type === 'admin') {
      handleLogin('jkm@admin.com', 'password123');
    }
  };

  const directToDashboard = () => {
    // Set fake auth for testing
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'OKU User',
      status: 'active'
    }));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">🚐 OKUTransport</h1>
          <p className="text-gray-600">Simple Login Test</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => quickLogin('oku')}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? '🔄 Signing in...' : '👤 Login as OKU User'}
          </button>

          <button
            onClick={() => quickLogin('driver')}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? '🔄 Signing in...' : '🚗 Login as Driver'}
          </button>

          <button
            onClick={() => quickLogin('admin')}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            {loading ? '🔄 Signing in...' : '🏛️ Login as JKM Admin'}
          </button>

          <div className="border-t pt-4">
            <button
              onClick={directToDashboard}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium"
            >
              🎯 Direct to Dashboard (Test Mode)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">← Back to Homepage</a>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;