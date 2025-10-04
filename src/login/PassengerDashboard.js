import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LiveMap from "../components/LiveMap";

const OKUPassengerDashboard = () => {
  const [activeTab, setActiveTab] = useState("book-ride");
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  // Live tracking state
  const [activeRideId, setActiveRideId] = useState(() => localStorage.getItem("ride_id") || "");
  const [driverLoc, setDriverLoc] = useState(null);
  const [etaMin, setEtaMin] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const pollRef = useRef(null);

  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    specialNeeds: "",
    recurring: false,
    email: "",
  });

  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setBookingData(prev => ({ ...prev, email: JSON.parse(userData).email }));
    }
  }, []);

  // Load bookings
  const fetchBookings = async (email) => {
    try {
      const response = await fetch(`http://localhost/first-project/backend/getBook.php?email=${email}`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchBookings(user.email);
    }
  }, [user]);

  // Live tracking functions
  const haversineKm = (a, b) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const computeEta = (from, to, speedMps) => {
    const distanceKm = haversineKm(from, to);
    const kmh = speedMps && speedMps > 0 ? speedMps * 3.6 : 30;
    const hours = distanceKm / kmh;
    return Math.max(0, Math.round(hours * 60));
  };

  const fetchLatest = useCallback(async () => {
    if (!activeRideId) return;
    try {
      const res = await fetch(`http://localhost/first-project/backend/location.php?ride_id=${encodeURIComponent(activeRideId)}`);
      const json = await res.json();
      if (json && json.success && json.data) {
        const d = json.data;
        const loc = { lat: parseFloat(d.lat), lng: parseFloat(d.lng), speed: d.speed ? parseFloat(d.speed) : null };
        setDriverLoc(loc);
        if (pickupLocation) {
          setEtaMin(computeEta(loc, pickupLocation, loc.speed));
        }
      }
    } catch (_) {}
  }, [activeRideId, pickupLocation]);

  useEffect(() => {
    if (activeRideId) {
      pollRef.current = setInterval(fetchLatest, 5000);
      fetchLatest();
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeRideId, pickupLocation, fetchLatest]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPassengerLocation({ lat: latitude, lng: longitude });
          setPickupLocation({ lat: latitude, lng: longitude });
          setPickupCoords([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost/first-project/backend/book.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ Booking request submitted successfully!");
        fetchBookings(user.email);
        setBookingData({
          pickup: "",
          destination: "",
          date: "",
          time: "",
          specialNeeds: "",
          recurring: false,
          email: user.email,
        });
        setPickupCoords(null);
        setDestinationCoords(null);
        setPickupLocation(null);
        setDestinationLocation(null);
        
        if (result.ride_id) {
          localStorage.setItem("ride_id", result.ride_id);
          setActiveRideId(result.ride_id);
          setActiveTab("live-tracking");
        }
      } else {
        alert("⚠️ Booking failed: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error submitting booking.");
    }
  };

  // Map click handler
  const handleMapClick = useCallback((lat, lng) => {
    if (activeTab === "book-ride") {
      if (!pickupCoords) {
        setPickupCoords([lat, lng]);
        setPickupLocation({ lat, lng });
        setBookingData(prev => ({ ...prev, pickup: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      } else if (!destinationCoords) {
        setDestinationCoords([lat, lng]);
        setDestinationLocation({ lat, lng });
        setBookingData(prev => ({ ...prev, destination: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      }
    }
  }, [activeTab, pickupCoords, destinationCoords]);

  // Set up map click handler
  useEffect(() => {
    window.onMapClick = handleMapClick;
    return () => {
      window.onMapClick = null;
    };
  }, [activeTab, pickupCoords, destinationCoords, handleMapClick]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ margin: 0, color: "#1f2937", fontSize: "28px", fontWeight: "bold" }}>
                🚗 OKU Transport Dashboard
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
                Welcome, {user.name}! Book your accessible transport service.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "10px 16px",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🏠 Home
              </button>
              
              <button
                onClick={() => {
                  alert(`Profile Information:\n\nName: ${user.name}\nEmail: ${user.email}\nUser Type: ${user.userType}\nPhone: ${user.phone || 'Not provided'}`);
                }}
                style={{
                  padding: "10px 16px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                👤 Profile
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to logout?")) {
                    localStorage.removeItem("user");
                    localStorage.removeItem("ride_id");
                    navigate("/");
                  }
                }}
                style={{
                  padding: "10px 16px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("book-ride")}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "book-ride" ? "#3b82f6" : "#e5e7eb",
              color: activeTab === "book-ride" ? "#fff" : "#374151",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            📅 Book New Ride
          </button>
          <button
            onClick={() => setActiveTab("live-tracking")}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "live-tracking" ? "#3b82f6" : "#e5e7eb",
              color: activeTab === "live-tracking" ? "#fff" : "#374151",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🗺️ Live Tracking
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "history" ? "#3b82f6" : "#e5e7eb",
              color: activeTab === "history" ? "#fff" : "#374151",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            📋 Trip History
          </button>
        </div>

        {/* Book Ride Tab */}
        {activeTab === "book-ride" && (
          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>Book Your Ride</h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={bookingData.pickup}
                    onChange={(e) => setBookingData(prev => ({ ...prev, pickup: e.target.value }))}
                    placeholder="Click on map to set pickup location"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px"
                    }}
                    required
                  />
                  {!pickupCoords && (
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      style={{
                        marginTop: "8px",
                        padding: "8px 16px",
                        background: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      📍 Use My Location
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                    Destination
                  </label>
                  <input
                    type="text"
                    value={bookingData.destination}
                    onChange={(e) => setBookingData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Click on map to set destination"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px"
                    }}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px"
                      }}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={bookingData.time}
                      onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px"
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>
                    Special Needs (Optional)
                  </label>
                  <textarea
                    value={bookingData.specialNeeds}
                    onChange={(e) => setBookingData(prev => ({ ...prev, specialNeeds: e.target.value }))}
                    placeholder="Any special assistance needed..."
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      resize: "vertical"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  🚗 Submit Booking Request
                </button>
              </form>
            </div>

            <div style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>🗺️ Select Locations</h3>
              <p style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "14px" }}>
                {!pickupCoords ? "Click on map to set pickup location" : 
                 !destinationCoords ? "Click on map to set destination" : 
                 "Both locations set! You can submit your booking."}
              </p>
              
              <LiveMap
                driverLocation={null}
                passengerLocation={passengerLocation}
                pickupLocation={pickupLocation}
                destinationLocation={destinationLocation}
                eta={null}
                rideId=""
                isDriver={false}
              />
            </div>
          </div>
        )}

        {/* Live Tracking Tab */}
        {activeTab === "live-tracking" && (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>🚗 Live Driver Tracking</h2>
            
            {activeRideId ? (
              <>
                <LiveMap
                  driverLocation={driverLoc}
                  passengerLocation={passengerLocation}
                  pickupLocation={pickupLocation}
                  destinationLocation={destinationLocation}
                  eta={etaMin}
                  rideId={activeRideId}
                  isDriver={false}
                />
                
                <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#374151" }}>Ride Information</h4>
                      <p style={{ margin: "4px 0", fontSize: "14px" }}>
                        <strong>Ride ID:</strong> {activeRideId}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "14px" }}>
                        <strong>Status:</strong> {driverLoc ? "Driver Connected" : "Waiting for Driver"}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "14px" }}>
                        <strong>ETA:</strong> {etaMin !== null ? `${etaMin} minutes` : "Calculating..."}
                      </p>
                    </div>
                  </div>
                  
                  {driverLoc && (
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#065f46" }}>Driver Location</h4>
                        <p style={{ margin: "4px 0", fontSize: "14px" }}>
                          <strong>Latitude:</strong> {driverLoc.lat.toFixed(5)}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px" }}>
                          <strong>Longitude:</strong> {driverLoc.lng.toFixed(5)}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px" }}>
                          <strong>Speed:</strong> {driverLoc.speed ? `${(driverLoc.speed * 3.6).toFixed(1)} km/h` : "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                <h3 style={{ margin: "0 0 16px 0" }}>No Active Ride</h3>
                <p style={{ margin: "0 0 16px 0" }}>Book a ride to start live tracking</p>
                <button
                  onClick={() => setActiveTab("book-ride")}
                  style={{
                    padding: "12px 24px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Book New Ride
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>📋 Trip History</h2>
            
            {bookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {bookings.map((booking, index) => (
                  <div key={index} style={{ 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "8px", 
                    padding: "16px",
                    background: "#f9fafb"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
                          {booking.pickup} → {booking.destination}
                        </h4>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#6b7280" }}>
                          <strong>Date:</strong> {booking.date} at {booking.time}
                        </p>
                        {booking.specialNeeds && (
                          <p style={{ margin: "4px 0", fontSize: "14px", color: "#6b7280" }}>
                            <strong>Special Needs:</strong> {booking.specialNeeds}
                          </p>
                        )}
                        {booking.ride_id && (
                          <p style={{ margin: "4px 0", fontSize: "12px", color: "#9ca3af" }}>
                            <strong>Ride ID:</strong> {booking.ride_id}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: booking.status === "completed" ? "#dcfce7" : 
                                     booking.status === "accepted" ? "#dbeafe" : "#fef3c7",
                          color: booking.status === "completed" ? "#166534" : 
                                 booking.status === "accepted" ? "#1e40af" : "#92400e"
                        }}>
                          {booking.status || "pending"}
                        </span>
                        {booking.driver_id && (
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            Driver: {booking.driver_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                <h3 style={{ margin: "0 0 16px 0" }}>No Bookings Yet</h3>
                <p style={{ margin: "0 0 16px 0" }}>Your trip history will appear here</p>
                <button
                  onClick={() => setActiveTab("book-ride")}
                  style={{
                    padding: "12px 24px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Book Your First Ride
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OKUPassengerDashboard;