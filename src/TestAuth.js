import React, { useState } from 'react';

const TestAuth = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setResult('LOGIN SUCCESS: ' + JSON.stringify(data, null, 2));
        
        // Auto redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setResult('LOGIN FAILED: ' + JSON.stringify(data));
      }
    } catch (err) {
      setResult('ERROR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Auth User',
          email: `testauth${Date.now()}@example.com`,
          phone: '0123456789',
          password: 'password123',
          userType: 'OKU User'
        })
      });
      
      const data = await response.json();
      setResult('REGISTER: ' + JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('ERROR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setResult('LOGGED OUT - Local storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔧 OKU Transport Auth Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Tests</h2>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button 
              onClick={testRegister}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Register'}
            </button>
            
            <button 
              onClick={logout}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700"
            >
              Clear Storage
            </button>
            
            <a 
              href="/dashboard"
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 inline-block"
            >
              Go to Dashboard
            </a>
          </div>
          
          {result && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-x-auto">{result}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibent mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/" className="bg-gray-600 text-white text-center py-3 rounded-md hover:bg-gray-700">Home</a>
            <a href="/login" className="bg-blue-600 text-white text-center py-3 rounded-md hover:bg-blue-700">Login</a>
            <a href="/register" className="bg-green-600 text-white text-center py-3 rounded-md hover:bg-green-700">Register</a>
            <a href="/dashboard" className="bg-purple-600 text-white text-center py-3 rounded-md hover:bg-purple-700">Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;