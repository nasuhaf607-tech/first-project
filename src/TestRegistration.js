import React, { useState } from 'react';
import axios from 'axios';

const TestRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    phone: '',
    password: '',
    userType: 'OKU User'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Submitting registration:', formData);
      
      const response = await axios.post('/api/register', formData);
      console.log('Registration response:', response.data);
      
      setMessage(`Success: ${response.data.message}`);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Test Registration</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('Success') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <select
            value={formData.userType}
            onChange={(e) => setFormData({...formData, userType: e.target.value})}
            className="w-full border rounded px-3 py-2"
          >
            <option value="OKU User">OKU User</option>
            <option value="Driver">Driver</option>
          </select>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestRegistration;