import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DriverProfileComplete = () => {
  const { user, API_BASE_URL } = useAuth();
  const [formData, setFormData] = useState({
    licenseNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleFeatures: [],
    experience: '',
    languages: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: ''
  });
  const [files, setFiles] = useState({
    licensePhoto: null,
    vehiclePhoto: null,
    icPhoto: null,
    selfiePhoto: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const vehicleTypes = [
    'Van with Wheelchair Ramp',
    'Low-Floor Bus',
    'Modified Sedan',
    'Wheelchair Accessible Vehicle (WAV)',
    'Standard Van',
    'Multi-Purpose Vehicle (MPV)'
  ];

  const accessibilityFeatures = [
    'Wheelchair Ramp',
    'Low Floor Entry',
    'Hand Rails',
    'Wide Doors',
    'Wheelchair Lock System',
    'Audio Announcements',
    'Visual Displays',
    'Emergency Communication'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleFeatureChange = (feature) => {
    const updatedFeatures = formData.vehicleFeatures.includes(feature)
      ? formData.vehicleFeatures.filter(f => f !== feature)
      : [...formData.vehicleFeatures, feature];
    
    setFormData({
      ...formData,
      vehicleFeatures: updatedFeatures
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'vehicleFeatures') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      const response = await axios.put(`${API_BASE_URL}/driver/profile`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('✅ Profile updated successfully! You can now receive booking requests.');
      
      // Reload page after 2 seconds to refresh dashboard
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('❌ Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation with Logout */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-blue-800">🚐 OKUTransport</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700"
            >
              🚪 LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🚗 Complete Driver Profile</h1>
              <p className="text-orange-100 mt-2">
                Complete your profile to start receiving booking requests from OKU passengers
              </p>
            </div>
            <div className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold">
              Required
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Driver Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📋 Driver Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="6-10 years">6-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken *
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  placeholder="e.g., Malay, English, Chinese"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🚐 Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., WXY1234"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Accessibility Features *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {accessibilityFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.vehicleFeatures.includes(feature)}
                      onChange={() => handleFeatureChange(feature)}
                      className="mr-2"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">🆘 Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📄 Required Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Photo *
                </label>
                <input
                  type="file"
                  name="licensePhoto"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Photo *
                </label>
                <input
                  type="file"
                  name="vehiclePhoto"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IC Photo *
                </label>
                <input
                  type="file"
                  name="icPhoto"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selfie Photo *
                </label>
                <input
                  type="file"
                  name="selfiePhoto"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={logout}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
            >
              Cancel & Logout
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⏳ Updating Profile...' : '✅ Complete Profile & Start Receiving Bookings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverProfileComplete;