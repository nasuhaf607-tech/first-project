import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const LiveMap = () => {
  const { user, socket, API_BASE_URL } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [drivers, setDrivers] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = () => {
      if (window.L && mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        const map = window.L.map(mapRef.current).setView([3.1390, 101.6869], 12); // Kuala Terengganu
        
        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        mapInstanceRef.current = map;
        
        // Load initial GPS locations
        loadGPSLocations();
      }
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = loadLeaflet;
      document.head.appendChild(script);
    } else {
      loadLeaflet();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Listen for real-time GPS updates
  useEffect(() => {
    if (socket) {
      socket.on('gps_update', (locationData) => {
        updateDriverMarker(locationData);
      });

      return () => {
        socket.off('gps_update');
      };
    }
  }, [socket]);

  const loadGPSLocations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gps/latest`);
      const locations = response.data.locations;
      
      // Group by driver_id and get latest location for each
      const latestLocations = {};
      locations.forEach(location => {
        if (!latestLocations[location.driver_id] || 
            new Date(location.timestamp) > new Date(latestLocations[location.driver_id].timestamp)) {
          latestLocations[location.driver_id] = location;
        }
      });
      
      setDrivers(Object.values(latestLocations));
      
      // Add markers for each driver
      Object.values(latestLocations).forEach(location => {
        updateDriverMarker(location);
      });
    } catch (error) {
      console.error('Failed to load GPS locations:', error);
    }
  };

  const updateDriverMarker = (locationData) => {
    if (!mapInstanceRef.current || !window.L) return;
    
    const { driver_id, lat, lng, driver_name, vehicleType, vehicleNumber, speed, timestamp } = locationData;
    
    // Remove existing marker if any
    if (markersRef.current[driver_id]) {
      mapInstanceRef.current.removeLayer(markersRef.current[driver_id]);
    }
    
    // Create custom icon for driver
    const driverIcon = window.L.divIcon({
      className: 'custom-driver-marker',
      html: `
        <div style="
          background-color: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="color: white; font-size: 12px; font-weight: bold;">🚗</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    // Add new marker
    const marker = window.L.marker([lat, lng], { icon: driverIcon }).addTo(mapInstanceRef.current);
    
    // Add popup with driver info
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #374151;">${driver_name || 'Driver'}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">
          <strong>Vehicle:</strong> ${vehicleType || 'N/A'} (${vehicleNumber || 'N/A'})
        </p>
        ${speed ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Speed:</strong> ${Math.round(speed)} km/h</p>` : ''}
        <p style="margin: 4px 0; font-size: 12px; color: #9ca3af;">
          <strong>Last Update:</strong> ${new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    markersRef.current[driver_id] = marker;
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    
    const trackingOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Send location to server if user is a driver
        if (user?.role === 'Driver') {
          sendLocationUpdate(latitude, longitude, speed, heading);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsTracking(false);
      },
      trackingOptions
    );

    // Store watch ID to stop tracking later
    window.locationWatchId = watchId;
  };

  const stopLocationTracking = () => {
    if (window.locationWatchId) {
      navigator.geolocation.clearWatch(window.locationWatchId);
      window.locationWatchId = null;
    }
    setIsTracking(false);
  };

  const sendLocationUpdate = async (lat, lng, speed, heading) => {
    try {
      await axios.post(`${API_BASE_URL}/gps/update`, {
        lat,
        lng,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: 10 // Default accuracy
      });
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* LIVE MAP HEADER with LOGOUT BUTTON */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Live GPS Tracking 🗺️</h1>
            <p className="text-indigo-100 mt-1">Real-time driver locations and route monitoring</p>
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

      <div className="flex justify-between items-center mb-6">
        
        {user?.role === 'Driver' && (
          <div className="flex gap-3">
            {!isTracking ? (
              <button 
                onClick={startLocationTracking}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <span>📍</span> Start Sharing Location
              </button>
            ) : (
              <button 
                onClick={stopLocationTracking}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <span>⏹️</span> Stop Sharing
              </button>
            )}
            
            {isTracking && (
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Location Active
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              ref={mapRef} 
              style={{ height: '500px', width: '100%' }}
              className="relative"
            >
              {/* Loading placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🚗</span> Active Drivers
            </h2>
            
            {drivers.length === 0 ? (
              <p className="text-gray-500 text-sm">No active drivers</p>
            ) : (
              <div className="space-y-3">
                {drivers.map(driver => (
                  <div key={driver.driver_id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                       onClick={() => {
                         if (mapInstanceRef.current && markersRef.current[driver.driver_id]) {
                           const marker = markersRef.current[driver.driver_id];
                           mapInstanceRef.current.setView([driver.lat, driver.lng], 15);
                           marker.openPopup();
                         }
                       }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{driver.driver_name || 'Driver'}</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-600">{driver.vehicleType} - {driver.vehicleNumber}</p>
                    {driver.speed && (
                      <p className="text-xs text-blue-600">Speed: {Math.round(driver.speed)} km/h</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(driver.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentLocation && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2">Your Location</h3>
              <p className="text-xs text-gray-600">
                Lat: {currentLocation.lat.toFixed(6)}<br/>
                Lng: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to Use Live GPS Tracking</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Drivers:</strong> Click "Start Sharing Location" to broadcast your real-time position</li>
          <li><strong>OKU Users:</strong> View live locations of all active drivers on the map</li>
          <li><strong>Admin/JKM:</strong> Monitor all drivers and track service delivery</li>
          <li>Click on driver markers to see detailed information and current status</li>
          <li>Click on driver names in the sidebar to focus the map on their location</li>
        </ul>
      </div>
    </div>
  );
};

export default LiveMap;