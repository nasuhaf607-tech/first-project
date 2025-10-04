import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LiveMap = ({ 
  driverLocation, 
  passengerLocation, 
  pickupLocation, 
  destinationLocation, 
  eta,
  isDriver = false,
  rideId = ""
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const passengerMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([5.3299, 103.1370], 13);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles (free, no API key needed)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add click handler for passenger to set locations
    if (!isDriver) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (window.onMapClick) {
          window.onMapClick(lat, lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDriver]);

  // Update driver marker
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation) return;

    const { lat, lng } = driverLocation;
    
    // Remove old marker
    if (driverMarkerRef.current) {
      mapInstanceRef.current.removeLayer(driverMarkerRef.current);
    }

    // Create new driver marker with custom icon
    const driverIcon = L.divIcon({
      className: 'driver-marker',
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: #22c55e; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    driverMarkerRef.current = L.marker([lat, lng], { icon: driverIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>🚗 Driver Location</strong><br/>
          Lat: ${lat.toFixed(5)}<br/>
          Lng: ${lng.toFixed(5)}<br/>
          ${eta ? `ETA: ${eta} min` : ''}
        </div>
      `);

    // Center map on driver if it's a driver view
    if (isDriver) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, [driverLocation, eta, isDriver]);

  // Update passenger marker
  useEffect(() => {
    if (!mapInstanceRef.current || !passengerLocation) return;

    const { lat, lng } = passengerLocation;
    
    if (passengerMarkerRef.current) {
      mapInstanceRef.current.removeLayer(passengerMarkerRef.current);
    }

    const passengerIcon = L.divIcon({
      className: 'passenger-marker',
      html: `
        <div style="
          width: 16px; 
          height: 16px; 
          background: #3b82f6; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    passengerMarkerRef.current = L.marker([lat, lng], { icon: passengerIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>👤 You</strong><br/>
          Lat: ${lat.toFixed(5)}<br/>
          Lng: ${lng.toFixed(5)}
        </div>
      `);
  }, [passengerLocation]);

  // Update pickup marker
  useEffect(() => {
    if (!mapInstanceRef.current || !pickupLocation) return;

    const { lat, lng } = pickupLocation;
    
    if (pickupMarkerRef.current) {
      mapInstanceRef.current.removeLayer(pickupMarkerRef.current);
    }

    const pickupIcon = L.divIcon({
      className: 'pickup-marker',
      html: `
        <div style="
          width: 18px; 
          height: 18px; 
          background: #f59e0b; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    pickupMarkerRef.current = L.marker([lat, lng], { icon: pickupIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>📍 Pickup Point</strong><br/>
          Lat: ${lat.toFixed(5)}<br/>
          Lng: ${lng.toFixed(5)}
        </div>
      `);
  }, [pickupLocation]);

  // Update destination marker
  useEffect(() => {
    if (!mapInstanceRef.current || !destinationLocation) return;

    const { lat, lng } = destinationLocation;
    
    if (destinationMarkerRef.current) {
      mapInstanceRef.current.removeLayer(destinationMarkerRef.current);
    }

    const destinationIcon = L.divIcon({
      className: 'destination-marker',
      html: `
        <div style="
          width: 18px; 
          height: 18px; 
          background: #ef4444; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    destinationMarkerRef.current = L.marker([lat, lng], { icon: destinationIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>🏁 Destination</strong><br/>
          Lat: ${lat.toFixed(5)}<br/>
          Lng: ${lng.toFixed(5)}
        </div>
      `);
  }, [destinationLocation]);

  // Draw route line between driver and pickup
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation || !pickupLocation) return;

    // Remove old route line
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
    }

    // Create route line
    const routeLine = L.polyline([
      [driverLocation.lat, driverLocation.lng],
      [pickupLocation.lat, pickupLocation.lng]
    ], {
      color: '#22c55e',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    routeLineRef.current = routeLine;

    // Fit map to show both points
    const group = new L.featureGroup([routeLine]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  }, [driverLocation, pickupLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '12px',
          overflow: 'hidden'
        }} 
      />
      
      {/* ETA Overlay */}
      {eta && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          🚗 ETA: {eta} min
        </div>
      )}

      {/* Ride ID Overlay */}
      {rideId && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Ride: {rideId}
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '11px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', marginRight: '6px' }}></div>
          Driver
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%', marginRight: '6px' }}></div>
          You
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', marginRight: '6px' }}></div>
          Pickup
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', marginRight: '6px' }}></div>
          Destination
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LiveMap;
