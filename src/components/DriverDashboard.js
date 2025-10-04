import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import DriverProfileComplete from './DriverProfileComplete';
import EnhancedBookingSystem from './EnhancedBookingSystem';

const DriverDashboard = () => {
  const { user, API_BASE_URL } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/driver/profile/status`);
      setProfileStatus(response.data);
    } catch (error) {
      console.error('Failed to check profile status:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  // If profile is not complete, show profile completion form
  if (!profileStatus?.isComplete) {
    return <DriverProfileComplete />;
  }

  // If profile is complete but pending approval
  if (profileStatus?.needsApproval) {
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

        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-8 text-white text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold mb-4">Waiting for Admin Approval</h1>
            <p className="text-xl mb-6">
              Your driver profile has been submitted successfully!
            </p>
            <div className="bg-white text-orange-600 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-3">📋 What happens next?</h2>
              <ul className="text-left space-y-2 text-sm">
                <li>✅ Profile submitted with all required documents</li>
                <li>🔍 JKM/Admin will review your application</li>
                <li>📧 You will be notified via email about approval status</li>
                <li>🚗 Once approved, you can start receiving booking requests</li>
              </ul>
            </div>
            
            <div className="mt-8">
              <p className="text-lg">
                Expected approval time: <strong>1-3 business days</strong>
              </p>
              <p className="text-orange-100 mt-2">
                Please ensure your phone is available for contact if needed
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📞 Need Help?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact JKM Office</h3>
                <p className="text-sm text-gray-600">Phone: +60 9-622 1200</p>
                <p className="text-sm text-gray-600">Email: jkm.terengganu@gov.my</p>
                <p className="text-sm text-gray-600">Office Hours: 8:00 AM - 5:00 PM</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Documents Checklist</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Valid Driving License</li>
                  <li>✅ Vehicle Registration</li>
                  <li>✅ IC (MyKad)</li>
                  <li>✅ Recent Photo</li>
                  <li>✅ Vehicle Insurance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If profile is complete and approved, show booking dashboard
  if (profileStatus?.canAcceptBookings) {
    return <EnhancedBookingSystem />;
  }

  // If profile is rejected or other status
  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-8 text-white text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold mb-4">Application Not Approved</h1>
          <p className="text-xl mb-6">
            Unfortunately, your driver application was not approved.
          </p>
          
          <div className="bg-white text-red-600 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-3">📞 Next Steps</h2>
            <ul className="text-left space-y-2 text-sm">
              <li>Contact JKM office for feedback on your application</li>
              <li>Review and update required documents if needed</li>
              <li>Resubmit application after addressing any issues</li>
              <li>Ensure all vehicle safety requirements are met</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;