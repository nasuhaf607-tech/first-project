import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EnhancedBookingSystem = () => {
  const { user, API_BASE_URL, socket } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [driverSchedule, setDriverSchedule] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    booking_type: 'daily',
    start_datetime: '',
    end_datetime: '',
    pickup_location: '',
    pickup_suggestions: [],
    dropoff_location: '',
    dropoff_suggestions: [],
    purpose: '',
    special_instructions: '',
    accessibility_needs: [],
    vehicle_preferences: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // Malaysia locations database (like Grab/Maxim)
  const malaysiaLocations = [
    // Kuala Terengganu locations
    'Hospital Sultanah Nur Zahirah, Kuala Terengganu',
    'Pasar Payang, Kuala Terengganu',
    'Masjid Kristal, Kuala Terengganu',
    'Pantai Batu Burok, Kuala Terengganu',
    'Kampung Cina, Kuala Terengganu',
    'Terminal Bas Kuala Terengganu',
    'Universiti Malaysia Terengganu (UMT)',
    'Airport Sultan Mahmud, Kuala Nerus',
    'Bukit Puteri, Kuala Terengganu',
    'Drawbridge, Kuala Terengganu',
    
    // General Malaysia locations
    'KLCC, Kuala Lumpur',
    'Pavilion KL, Bukit Bintang',
    'Mid Valley Megamall, KL',
    'Hospital Kuala Lumpur',
    'KLIA Airport, Sepang',
    'Sunway Pyramid, Petaling Jaya',
    'IOI City Mall, Putrajaya',
    'Genting Highlands',
    'Malacca Historical City',
    'Penang Georgetown',
    'Johor Bahru City Centre',
    'Kota Kinabalu City',
    'Kuching Waterfront'
  ];

  const accessibilityNeeds = [
    'Wheelchair Access',
    'Mobility Aid Support', 
    'Visual Assistance',
    'Hearing Assistance',
    'Cognitive Support',
    'Multiple Disabilities'
  ];

  const vehiclePreferences = [
    'Wheelchair Ramp Required',
    'Low Floor Entry',
    'Wide Door Access',
    'Hand Rails',
    'Wheelchair Lock System',
    'Audio Announcements',
    'Visual Displays',
    'Air Conditioning',
    'Comfortable Seating'
  ];

  useEffect(() => {
    loadBookings();
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      loadDriverSchedule();
    }
  }, [selectedDriver]);

  // Listen for real-time booking updates
  useEffect(() => {
    if (socket) {
      socket.on('booking_update', (data) => {
        setMessage(`Booking ${data.status}: ${data.message}`);
        loadBookings();
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

  const loadDriverSchedule = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/driver/${selectedDriver}/schedule`);
      setDriverSchedule(response.data.schedule);
    } catch (error) {
      console.error('Failed to load driver schedule:', error);
    }
  };

  // Location autocomplete functionality (like Grab/Maxim)
  const handleLocationSearch = (value, isPickup = true) => {
    const suggestions = malaysiaLocations
      .filter(location => location.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);

    if (isPickup) {
      setBookingForm(prev => ({
        ...prev,
        pickup_location: value,
        pickup_suggestions: suggestions
      }));
      setShowPickupSuggestions(value.length > 2 && suggestions.length > 0);
    } else {
      setBookingForm(prev => ({
        ...prev,
        dropoff_location: value,
        dropoff_suggestions: suggestions
      }));
      setShowDropoffSuggestions(value.length > 2 && suggestions.length > 0);
    }
  };

  const selectLocation = (location, isPickup = true) => {
    if (isPickup) {
      setBookingForm(prev => ({ ...prev, pickup_location: location }));
      setShowPickupSuggestions(false);
    } else {
      setBookingForm(prev => ({ ...prev, dropoff_location: location }));
      setShowDropoffSuggestions(false);
    }
  };

  const handleAccessibilityChange = (need) => {
    const updatedNeeds = bookingForm.accessibility_needs.includes(need)
      ? bookingForm.accessibility_needs.filter(n => n !== need)
      : [...bookingForm.accessibility_needs, need];
    
    setBookingForm(prev => ({ ...prev, accessibility_needs: updatedNeeds }));
  };

  const handleVehiclePreferenceChange = (preference) => {
    const updatedPrefs = bookingForm.vehicle_preferences.includes(preference)
      ? bookingForm.vehicle_preferences.filter(p => p !== preference)
      : [...bookingForm.vehicle_preferences, preference];
    
    setBookingForm(prev => ({ ...prev, vehicle_preferences: updatedPrefs }));
  };

  // Check for booking conflicts
  const checkBookingConflict = () => {
    const startTime = new Date(bookingForm.start_datetime);
    const endTime = new Date(bookingForm.end_datetime);
    
    return driverSchedule.some(schedule => {
      const scheduleStart = new Date(schedule.start_datetime);
      const scheduleEnd = new Date(schedule.end_datetime);
      
      return (startTime < scheduleEnd && endTime > scheduleStart);
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      setMessage('Please select a driver');
      return;
    }

    // Check for conflicts
    if (checkBookingConflict()) {
      setMessage('❌ Driver is not available at this time slot! Please choose another time or check the schedule below.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, {
        ...bookingForm,
        driver_id: selectedDriver,
        accessibility_needs: JSON.stringify(bookingForm.accessibility_needs),
        vehicle_preferences: JSON.stringify(bookingForm.vehicle_preferences)
      });
      
      setMessage('✅ Booking created successfully! Waiting for driver approval.');
      setBookingForm({
        booking_type: 'daily',
        start_datetime: '',
        end_datetime: '',
        pickup_location: '',
        pickup_suggestions: [],
        dropoff_location: '',
        dropoff_suggestions: [],
        purpose: '',
        special_instructions: '',
        accessibility_needs: [],
        vehicle_preferences: []
      });
      setSelectedDriver('');
      setDriverSchedule([]);
      loadBookings();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      setMessage('❌ ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        status: newStatus
      });
      setMessage(`✅ Booking ${newStatus} successfully`);
      loadBookings();
    } catch (error) {
      setMessage('❌ Failed to update booking status');
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

  const formatScheduleTime = (datetime) => {
    return new Date(datetime).toLocaleString('en-MY', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (user?.role === 'OKU User') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Logout */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Book Transport 🚐</h1>
              <p className="text-green-100 mt-1">Schedule your rides with assigned drivers</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg"
            >
              🚪 LOGOUT
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700' 
                : message.includes('❌')
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Booking</h2>
              
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Driver Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Assigned Driver *
                  </label>
                  <select 
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Choose a driver</option>
                    {assignments.filter(a => a.driver_status === 'approved').map(assignment => (
                      <option key={assignment.driver_id} value={assignment.driver_id}>
                        {assignment.driver_name} - {assignment.vehicleType} ({assignment.vehicleNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Type *
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
                      Start Date & Time *
                    </label>
                    <input 
                      type="datetime-local"
                      value={bookingForm.start_datetime}
                      onChange={(e) => setBookingForm({...bookingForm, start_datetime: e.target.value})}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input 
                      type="datetime-local"
                      value={bookingForm.end_datetime}
                      onChange={(e) => setBookingForm({...bookingForm, end_datetime: e.target.value})}
                      min={bookingForm.start_datetime}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                {/* Pickup Location with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location * (Type to search)
                  </label>
                  <input 
                    type="text"
                    value={bookingForm.pickup_location}
                    onChange={(e) => handleLocationSearch(e.target.value, true)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Start typing location... (e.g., Hospital Sultanah Nur Zahirah)"
                    required
                  />
                  {showPickupSuggestions && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {bookingForm.pickup_suggestions.map((location, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectLocation(location, true)}
                        >
                          📍 {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropoff Location with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drop-off Location * (Type to search)
                  </label>
                  <input 
                    type="text"
                    value={bookingForm.dropoff_location}
                    onChange={(e) => handleLocationSearch(e.target.value, false)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Start typing destination... (e.g., Pasar Payang)"
                    required
                  />
                  {showDropoffSuggestions && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {bookingForm.dropoff_suggestions.map((location, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectLocation(location, false)}
                        >
                          📍 {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accessibility Needs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessibility Needs
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {accessibilityNeeds.map(need => (
                      <label key={need} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bookingForm.accessibility_needs.includes(need)}
                          onChange={() => handleAccessibilityChange(need)}
                          className="mr-2"
                        />
                        <span className="text-sm">{need}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vehicle Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Preferences
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {vehiclePreferences.map(pref => (
                      <label key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bookingForm.vehicle_preferences.includes(pref)}
                          onChange={() => handleVehiclePreferenceChange(pref)}
                          className="mr-2"
                        />
                        <span className="text-sm">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Purpose and Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Trip
                  </label>
                  <input 
                    type="text"
                    value={bookingForm.purpose}
                    onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Medical appointment, work, shopping, etc."
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
                    placeholder="Any special requirements or instructions for the driver"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? '⏳ Creating Booking...' : '🚐 Submit Booking Request'}
                </button>
              </form>
            </div>

            {/* Driver Schedule & Bookings */}
            <div className="space-y-6">
              {/* Driver Schedule */}
              {selectedDriver && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold mb-4">📅 Driver Schedule</h2>
                  {driverSchedule.length === 0 ? (
                    <p className="text-green-600 text-sm">✅ Driver is available - no bookings found</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-2">Existing bookings:</p>
                      {driverSchedule.map(schedule => (
                        <div key={schedule.id} className="text-xs bg-gray-50 p-2 rounded border">
                          <p className="font-medium">{formatScheduleTime(schedule.start_datetime)}</p>
                          <p className="text-gray-600">to {formatScheduleTime(schedule.end_datetime)}</p>
                          <p className="text-gray-500 truncate">{schedule.pickup_location} → {schedule.dropoff_location}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">📋 My Recent Bookings</h2>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-sm">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{booking.driver_name}</p>
                            <p className="text-xs text-gray-500">{booking.vehicleType}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p>{new Date(booking.start_datetime).toLocaleString()}</p>
                          <p className="truncate">{booking.pickup_location} → {booking.dropoff_location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Driver view - only shows received bookings, cannot create
  if (user?.role === 'Driver') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Logout */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🚗 Driver Dashboard</h1>
              <p className="text-blue-100 mt-1">Manage your ride requests from OKU passengers</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 shadow-lg"
            >
              🚪 LOGOUT
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {message && (
            <div className="mb-4 p-4 rounded-md bg-blue-100 text-blue-700">
              {message}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Booking Requests</h2>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-500 text-lg">No booking requests yet</p>
                <p className="text-gray-400 text-sm mt-2">Requests from OKU passengers will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.oku_name}</h3>
                        <p className="text-gray-600">📞 {booking.oku_phone}</p>
                        {booking.disability_type && (
                          <p className="text-sm text-blue-600">♿ {booking.disability_type}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600"><strong>📅 Date:</strong> {new Date(booking.start_datetime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600"><strong>⏱️ Duration:</strong> {new Date(booking.end_datetime).toLocaleString()}</p>
                        <p className="text-sm text-gray-600"><strong>🎯 Purpose:</strong> {booking.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600"><strong>📍 From:</strong> {booking.pickup_location}</p>
                        <p className="text-sm text-gray-600"><strong>📍 To:</strong> {booking.dropoff_location}</p>
                        <p className="text-sm text-gray-600"><strong>📝 Type:</strong> {booking.booking_type}</p>
                      </div>
                    </div>
                    
                    {booking.special_instructions && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                        <p className="text-sm"><strong>📝 Special Instructions:</strong> {booking.special_instructions}</p>
                      </div>
                    )}

                    {booking.special_requirements && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm"><strong>♿ Special Requirements:</strong> {booking.special_requirements}</p>
                      </div>
                    )}
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'approved')}
                          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
                        >
                          ✅ Accept Request
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium"
                        >
                          ❌ Decline
                        </button>
                      </div>
                    )}
                    
                    {booking.status === 'approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                      >
                        🚗 Start Trip
                      </button>
                    )}
                    
                    {booking.status === 'in_progress' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 font-medium"
                      >
                        ✅ Complete Trip
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EnhancedBookingSystem;