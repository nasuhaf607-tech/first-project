import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const GPSTracking = ({ bookingId = null, showMap = true }) => {
  const { user, API_BASE_URL, socket } = useAuth();
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [locations, setLocations] = useState([]);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    // Load recent GPS locations
    loadRecentLocations();

    // Listen for real-time GPS updates
    if (socket) {
      socket.on('gps_update', (data) => {
        setLocations(prev => [data, ...prev.slice(0, 99)]);
        
        // Calculate ETA if we have destination
        if (data.driver_id === user?.id && bookingId) {
          calculateETA(data);
        }
      });

      return () => {
        socket.off('gps_update');
      };
    }
  }, [socket, user, bookingId]);

  const loadRecentLocations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gps/latest`);
      setLocations(response.data.locations);
    } catch (error) {
      console.error('Failed to load GPS locations:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const calculateETA = useCallback((gpsData) => {
    // This is a simplified ETA calculation
    // In production, you'd use Google Maps API or similar for accurate routing
    if (gpsData.booking_id === bookingId && gpsData.pickup_location) {
      const dist = calculateDistance(
        gpsData.lat, 
        gpsData.lng, 
        // These would come from booking destination coordinates
        3.1390, 103.3190 // Default Kuala Terengganu coordinates
      );
      
      setDistance(dist);
      
      // Simple ETA calculation: distance / average speed (assume 40 km/h in city)
      const averageSpeed = 40; // km/h
      const etaHours = dist / averageSpeed;
      const etaMinutes = Math.round(etaHours * 60);
      
      setEta(etaMinutes);
    }
  }, [bookingId]);

  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      setTrackingError('GPS not supported by this device');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    const successCallback = (position) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      
      const locationData = {
        lat: latitude,
        lng: longitude,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || 0,
        booking_id: bookingId
      };

      setCurrentLocation(locationData);
      setTrackingError('');

      // Send to backend
      updateGPSLocation(locationData);
    };

    const errorCallback = (error) => {
      console.error('GPS Error:', error);
      setTrackingError(`GPS Error: ${error.message}`);
    };

    const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    setWatchId(id);
    setGpsEnabled(true);
  };

  const stopGPSTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setGpsEnabled(false);
    setCurrentLocation(null);
  };

  const updateGPSLocation = async (locationData) => {
    try {
      await axios.post(`${API_BASE_URL}/gps/update`, locationData);
    } catch (error) {
      console.error('Failed to update GPS location:', error);
    }
  };

  // Driver GPS Control Panel
  if (user?.role === 'Driver') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="mr-2">📍</span>GPS Tracking
          </h2>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${gpsEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-sm font-medium ${gpsEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {gpsEnabled ? 'GPS Active' : 'GPS Inactive'}
            </span>
          </div>
        </div>

        {/* GPS Control */}
        <div className="mb-6">
          {!gpsEnabled ? (
            <button
              onClick={startGPSTracking}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">🚀</span>Start GPS Tracking
            </button>
          ) : (
            <button
              onClick={stopGPSTracking}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2">⏹️</span>Stop GPS Tracking
            </button>
          )}
        </div>

        {/* Current Location Display */}
        {currentLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">📍 Current Location</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Latitude:</strong> {currentLocation.lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> {currentLocation.lng.toFixed(6)}</p>
              </div>
              <div>
                <p><strong>Speed:</strong> {(currentLocation.speed * 3.6).toFixed(1)} km/h</p>
                <p><strong>Accuracy:</strong> ±{currentLocation.accuracy.toFixed(1)}m</p>
              </div>
            </div>
          </div>
        )}

        {/* ETA Display for Active Booking */}
        {eta && distance && bookingId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Trip Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Distance to Destination:</strong> {distance.toFixed(1)} km</p>
                <p><strong>Estimated Time:</strong> {eta} minutes</p>
              </div>
              <div>
                <p><strong>Booking ID:</strong> #{bookingId}</p>
                <p><strong>Status:</strong> <span className="text-green-600">En Route</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {trackingError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">⚠️ {trackingError}</p>
            <p className="text-red-600 text-xs mt-1">
              Make sure location services are enabled and you have granted permission.
            </p>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 GPS Tracking Guide</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enable GPS before starting trips</li>
            <li>• Keep the app open for continuous tracking</li>
            <li>• OKU passengers can see your real-time location</li>
            <li>• GPS data helps calculate accurate ETAs</li>
            <li>• Tracking automatically stops when you end trips</li>
          </ul>
        </div>
      </div>
    );
  }

  // OKU User GPS Viewing (Live tracking of assigned drivers)
  if (user?.role === 'OKU User') {
    const activeDriverLocations = locations.filter(loc => 
      new Date(loc.timestamp) > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🗺️</span>Live Driver Tracking
        </h2>

        {activeDriverLocations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📱</div>
            <p className="text-gray-500">No active drivers nearby</p>
            <p className="text-gray-400 text-sm mt-2">Driver locations will appear here when they start GPS tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDriverLocations.map((location, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{location.driver_name}</h3>
                    <p className="text-sm text-gray-600">{location.vehicleType} - {location.vehicleNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(location.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Speed:</strong> {(location.speed * 3.6).toFixed(1)} km/h</p>
                    <p><strong>Location:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                  </div>
                  <div>
                    {location.booking_id && (
                      <div>
                        <p><strong>Status:</strong> <span className="text-blue-600">On Trip</span></p>
                        <p><strong>Booking:</strong> #{location.booking_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simple ETA estimation */}
                {location.booking_id && eta && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-800">Estimated Arrival</p>
                      <p className="text-lg font-bold text-blue-600">{eta} minutes</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Map Integration Placeholder */}
        {showMap && (
          <div className="mt-6 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-500 text-sm">
              Real-time map view with driver locations, routes, and ETA calculations will be available here.
              Integration with Leaflet/OpenStreetMap is ready for implementation.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GPSTracking;