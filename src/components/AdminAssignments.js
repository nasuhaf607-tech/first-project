import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminAssignments = () => {
  const { user, API_BASE_URL } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [okuUsers, setOkuUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    oku_id: '',
    driver_id: '',
    effective_from: '',
    effective_to: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    if (['Company Admin', 'JKM Officer'].includes(user?.role)) {
      loadAssignments();
      loadUsers();
      loadPendingDrivers();
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments`);
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // This would need a separate endpoint to get users by type
      // For now, we'll simulate it
      const okuResponse = await axios.get(`${API_BASE_URL}/users?type=oku`);
      const driverResponse = await axios.get(`${API_BASE_URL}/users?type=driver&status=approved`);
      
      setOkuUsers(okuResponse.data.users || []);
      setDrivers(driverResponse.data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Mock data for demonstration
      setOkuUsers([]);
      setDrivers([]);
    }
  };

  const loadPendingDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users?type=driver&status=pending`);
      setPendingDrivers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load pending drivers:', error);
      setPendingDrivers([]);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/assignments`, assignmentForm);
      setMessage('Assignment created successfully!');
      setAssignmentForm({
        oku_id: '',
        driver_id: '',
        effective_from: '',
        effective_to: '',
        notes: ''
      });
      loadAssignments();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create assignment';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDriver = async (driverId, action) => {
    try {
      await axios.put(`${API_BASE_URL}/drivers/${driverId}/status`, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      setMessage(`Driver ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      loadPendingDrivers();
      loadUsers();
    } catch (error) {
      setMessage('Failed to update driver status');
    }
  };

  if (!['Company Admin', 'JKM Officer'].includes(user?.role)) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Access denied. This section is for Admin and JKM Officer only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ADMIN HEADER with LOGOUT BUTTON */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard 🏛️</h1>
            <p className="text-white font-medium mt-1">Manage drivers, assignments and system operations</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg"
          >
            🚪 LOGOUT
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'assignments', label: 'Driver Assignments', icon: '👥' },
              { id: 'approvals', label: 'Driver Approvals', icon: '✅' },
              { id: 'users', label: 'User Management', icon: '👤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'assignments' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Assignment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create Driver Assignment</h2>
            
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select OKU User
                </label>
                <select 
                  value={assignmentForm.oku_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, oku_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Choose OKU User</option>
                  {okuUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                <select 
                  value={assignmentForm.driver_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, driver_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Choose Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.vehicleType} ({driver.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective From
                  </label>
                  <input 
                    type="date"
                    value={assignmentForm.effective_from}
                    onChange={(e) => setAssignmentForm({...assignmentForm, effective_from: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective To
                  </label>
                  <input 
                    type="date"
                    value={assignmentForm.effective_to}
                    onChange={(e) => setAssignmentForm({...assignmentForm, effective_to: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea 
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Assignment notes or special instructions"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating Assignment...' : 'Create Assignment'}
              </button>
            </form>
          </div>

          {/* Assignment List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
            
            {assignments.length === 0 ? (
              <p className="text-gray-500">No assignments created yet</p>
            ) : (
              <div className="space-y-4">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{assignment.oku_name}</p>
                        <p className="text-sm text-gray-600">{assignment.oku_email}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium text-gray-900">{assignment.driver_name}</p>
                      <p className="text-sm text-gray-600">
                        {assignment.vehicleType} - {assignment.vehicleNumber}
                      </p>
                      <p className="text-sm text-gray-600">{assignment.driver_email}</p>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <p>From: {assignment.effective_from}</p>
                      {assignment.effective_to && <p>To: {assignment.effective_to}</p>}
                      {assignment.notes && <p>Notes: {assignment.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Driver Approvals</h2>
          
          {pendingDrivers.length === 0 ? (
            <p className="text-gray-500">No pending driver applications</p>
          ) : (
            <div className="space-y-6">
              {pendingDrivers.map(driver => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{driver.name}</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Email:</strong> {driver.email}</p>
                        <p><strong>Phone:</strong> {driver.phone}</p>
                        <p><strong>IC Number:</strong> {driver.icNumber}</p>
                        <p><strong>License Number:</strong> {driver.licenseNumber}</p>
                        <p><strong>Vehicle Type:</strong> {driver.vehicleType}</p>
                        <p><strong>Vehicle Number:</strong> {driver.vehicleNumber}</p>
                        <p><strong>Experience:</strong> {driver.experience}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {driver.icPhoto && (
                          <a href={`/uploads/${driver.icPhoto}`} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">IC Photo</a>
                        )}
                        {driver.selfiePhoto && (
                          <a href={`/uploads/${driver.selfiePhoto}`} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">Selfie Photo</a>
                        )}
                        {driver.licensePhoto && (
                          <a href={`/uploads/${driver.licensePhoto}`} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">License Photo</a>
                        )}
                        {driver.vehiclePhoto && (
                          <a href={`/uploads/${driver.vehiclePhoto}`} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">Vehicle Photo</a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => handleApproveDriver(driver.id, 'approve')}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                      ✅ Approve Driver
                    </button>
                    <button 
                      onClick={() => handleApproveDriver(driver.id, 'reject')}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                    >
                      ❌ Reject Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600">User management features will be implemented here.</p>
          
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Total OKU Users</h3>
              <p className="text-2xl font-bold text-blue-700">{okuUsers.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Approved Drivers</h3>
              <p className="text-2xl font-bold text-green-700">{drivers.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900">Pending Drivers</h3>
              <p className="text-2xl font-bold text-yellow-700">{pendingDrivers.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;