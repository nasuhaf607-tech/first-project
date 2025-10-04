import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BookingSystem = () => {
  const { user, API_BASE_URL, socket } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [bookingForm, setBookingForm] = useState({
    booking_type: 'daily',
    start_datetime: '',
    end_datetime: '',
    pickup_location: '',
    dropoff_location: '',
    purpose: '',
    special_instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBookings();
    loadAssignments();
  }, []);

  // Listen for real-time booking updates
  useEffect(() => {
    if (socket) {
      socket.on('booking_update', (data) => {
        setMessage(`Booking ${data.status}: ${data.message}`);
        loadBookings(); // Refresh bookings
      });

      socket.on('new_booking', (data) => {
        setMessage('New booking request received!');
        loadBookings();
      });

      return () => {
        socket.off('booking_update');
        socket.off('new_booking');
      };
    }
  }, [socket]);

  const loadBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings`);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments`);
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      setMessage('Please select a driver');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        ...bookingForm,
        driver_id: selectedDriver
      });
      
      setMessage('Booking created successfully!');
      setBookingForm({
        booking_type: 'daily',
        start_datetime: '',
        end_datetime: '',
        pickup_location: '',
        dropoff_location: '',
        purpose: '',
        special_instructions: ''
      });
      setSelectedDriver('');
      loadBookings();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        status: newStatus
      });
      setMessage(`Booking ${newStatus} successfully`);
      loadBookings();
    } catch (error) {
      setMessage('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800', 
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (user?.role === 'OKU User') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Transport</h1>
        
        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.includes('successfully') || message.includes('approved') 
              ? 'bg-green-100 text-green-700' 
              : message.includes('failed') || message.includes('error')
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Booking</h2>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Assigned Driver
                </label>
                <select 
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Choose a driver</option>
                  {assignments.map(assignment => (
                    <option key={assignment.driver_id} value={assignment.driver_id}>
                      {assignment.driver_name} - {assignment.vehicleType} ({assignment.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Type
                </label>
                <select 
                  value={bookingForm.booking_type}
                  onChange={(e) => setBookingForm({...bookingForm, booking_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="daily">Daily Service</option>
                  <option value="monthly">Monthly Rental</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time
                  </label>
                  <input 
                    type="datetime-local"
                    value={bookingForm.start_datetime}
                    onChange={(e) => setBookingForm({...bookingForm, start_datetime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <input 
                    type="datetime-local"
                    value={bookingForm.end_datetime}
                    onChange={(e) => setBookingForm({...bookingForm, end_datetime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <input 
                  type="text"
                  value={bookingForm.pickup_location}
                  onChange={(e) => setBookingForm({...bookingForm, pickup_location: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter pickup address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop-off Location
                </label>
                <input 
                  type="text"
                  value={bookingForm.dropoff_location}
                  onChange={(e) => setBookingForm({...bookingForm, dropoff_location: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter destination address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Trip
                </label>
                <input 
                  type="text"
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Medical appointment, work, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea 
                  value={bookingForm.special_instructions}
                  onChange={(e) => setBookingForm({...bookingForm, special_instructions: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Any special requirements or instructions"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating Booking...' : 'Submit Booking Request'}
              </button>
            </form>
          </div>

          {/* Booking List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
            
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{booking.driver_name}</p>
                        <p className="text-sm text-gray-500">{booking.vehicleType} - {booking.vehicleNumber}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Date:</strong> {new Date(booking.start_datetime).toLocaleString()}</p>
                      <p><strong>From:</strong> {booking.pickup_location}</p>
                      <p><strong>To:</strong> {booking.dropoff_location}</p>
                      {booking.purpose && <p><strong>Purpose:</strong> {booking.purpose}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Driver View
  if (user?.role === 'Driver') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Booking Requests</h1>
        
        {message && (
          <div className="mb-4 p-4 rounded-md bg-blue-100 text-blue-700">
            {message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No booking requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{booking.oku_name}</h3>
                    <p className="text-gray-600">Phone: {booking.oku_phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Type:</strong> {booking.booking_type}</p>
                    <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(booking.start_datetime).toLocaleString()}</p>
                    <p className="text-sm text-gray-600"><strong>Duration:</strong> {new Date(booking.end_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>From:</strong> {booking.pickup_location}</p>
                    <p className="text-sm text-gray-600"><strong>To:</strong> {booking.dropoff_location}</p>
                    <p className="text-sm text-gray-600"><strong>Purpose:</strong> {booking.purpose}</p>
                  </div>
                </div>
                
                {booking.special_instructions && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm"><strong>Special Instructions:</strong> {booking.special_instructions}</p>
                  </div>
                )}
                
                {booking.status === 'pending' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {booking.status === 'approved' && (
                  <button 
                    onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Start Trip
                  </button>
                )}
                
                {booking.status === 'in_progress' && (
                  <button 
                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Complete Trip
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default BookingSystem;