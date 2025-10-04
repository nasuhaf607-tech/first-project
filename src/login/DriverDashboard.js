import React, { useState } from "react";

// Simple icons for demo (no dependencies)
const PhoneIcon = ({ className = "" }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 3.5A2.5 2.5 0 015 1h2A2.5 2.5 0 019.5 3.5V4a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5zm13 0A2.5 2.5 0 0015 1h-2A2.5 2.5 0 0010.5 3.5V4a1 1 0 001 1h3a1 1 0 001-1V3.5z" stroke="#2563eb" strokeWidth="1.5"/><path d="M3 5h14v9.5A2.5 2.5 0 0114.5 17h-9A2.5 2.5 0 013 14.5V5z" stroke="#2563eb" strokeWidth="1.5"/></svg>
);
const StartIcon = ({ className = "" }) => (
  <svg className={className} width="18" height="18" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="1.7"/><path d="M8 13l4-3-4-3v6z" fill="#22c55e"/></svg>
);

export default function DriverDashboard() {
  // Data
  const assignments = [
    {
      id: 1,
      okuUser: { name: "Ahmad Rahman", type: "Wheelchair user", phone: "012-345-6789", preferred: "9 AM - 5 PM" },
      period: "January 2024"
    }
  ];
  const stats = { assignedUsers: 3, completedTrips: 45, rating: 4.8 };
  const todayRides = [
    {
      id: 1,
      okuUser: "Ahmad Rahman",
      pickup: "Jalan Sultan Zainal Abidin",
      destination: "Hospital Sultanah Nur Zahirah",
      time: "Today, 16 Jan 2024 at 2:00 PM"
    }
  ];

  // Modal states
  const [showCall, setShowCall] = useState({ open: false, phone: "" });
  const [showStart, setShowStart] = useState({ open: false, name: "" });
  const [showAccept, setShowAccept] = useState({ open: false, ride: null });

  // Handlers
  const handleCallUser = (phone) => setShowCall({ open: true, phone });
  const handleStartService = (name) => setShowStart({ open: true, name });
  const handleAcceptRide = (ride) => setShowAccept({ open: true, ride });

  // Modal actions
  const doCall = () => {
    window.open(`tel:${showCall.phone.replace(/-/g, "")}`, "_self");
    setShowCall({ open: false, phone: "" });
  };
  const doStart = () => {
    setShowStart({ open: false, name: "" });
    alert("Service started for user!");
  };
  const doAccept = () => {
    setShowAccept({ open: false, ride: null });
    alert("Scheduled ride accepted!");
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* ✅ Banner/Header */}
      <header className="bg-blue-700 text-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="px-6 py-4 flex justify-between items-center">
          {/* Title */}
          <h1 className="text-2xl font-bold">OKU Transport Service</h1>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              Help
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
              P
            </div>
          </div>
        </div>
      </header>

      {/* Push content down so it's not hidden behind header */}
      <div style={{ padding: 32, paddingTop: 100, maxWidth: 1200, margin: "0 auto", display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* MAIN COLUMN */}
        <main style={{ flex: 2, minWidth: 350 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: "0 2px 8px #eee" }}>
            <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#2563eb" }}>Driver Dashboard</h2>

            {/* Monthly Assignments */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12, color: "#17855b" }}>Monthly Assignments</div>
              {assignments.map(a => (
                <div key={a.id} style={{ background: "#e0edfa", border: "1px solid #b7d6f8", borderRadius: 12, padding: 24, marginBottom: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#93c5fd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 22, color: "#2563eb" }}>
                      {a.okuUser.name.split(" ").map(x => x[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#2563eb", fontSize: 16 }}>{a.okuUser.name}</div>
                      <div style={{ color: "#666", fontSize: 14 }}>{a.okuUser.type}</div>
                      <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>Contact: {a.okuUser.phone}</div>
                      <div style={{ color: "#888", fontSize: 13 }}>Preferred times: {a.okuUser.preferred}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                    <span style={{ background: "#c7e0fb", color: "#2563eb", borderRadius: 8, padding: "3px 12px", fontWeight: "bold", fontSize: 13 }}>{a.period}</span>
                    <button onClick={() => handleCallUser(a.okuUser.phone)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "7px 15px", fontWeight: "bold", fontSize: 15, cursor: "pointer" }}>
                      <PhoneIcon /> Call User
                    </button>
                    <button onClick={() => handleStartService(a.okuUser.name)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#22c55e", color: "#fff", border: "none", borderRadius: 7, padding: "7px 15px", fontWeight: "bold", fontSize: 15, cursor: "pointer" }}>
                      <StartIcon /> Start Service
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Scheduled Rides */}
            <div>
              <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12, color: "#7c3aed" }}>Today's Scheduled Rides</div>
              {todayRides.map(r => (
                <div key={r.id} style={{ background: "#ede9fe", border: "1px solid #d1c4e9", borderRadius: 12, padding: 24, marginBottom: 14 }}>
                  <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4, color: "#7c3aed" }}>{r.okuUser}</div>
                  <div style={{ fontSize: 14, color: "#444" }}>Pickup: <span style={{ fontWeight: "bold" }}>{r.pickup}</span></div>
                  <div style={{ fontSize: 14, color: "#444" }}>Destination: <span style={{ fontWeight: "bold" }}>{r.destination}</span></div>
                  <div style={{ fontSize: 12, color: "#6366f1", marginTop: 4 }}>🗓 {r.time}</div>
                  <button onClick={() => handleAcceptRide(r)} style={{ marginTop: 14, width: "100%", background: "#2563eb", color: "#fff", fontWeight: "bold", borderRadius: 8, padding: "10px 0", fontSize: 15, border: "none", boxShadow: "0 1px 4px #ddd" }}>
                    Accept Scheduled Ride
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px #eee", borderLeft: "8px solid #2563eb" }}>
            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 14, color: "#2563eb" }}>Assignment Stats</div>
            <div style={{ color: "#333", fontSize: 16, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Assigned Users:</span> <span style={{ fontWeight: "bold" }}>{stats.assignedUsers}</span>
            </div>
            <div style={{ color: "#333", fontSize: 16, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Trips Completed:</span> <span style={{ fontWeight: "bold" }}>{stats.completedTrips}</span>
            </div>
            <div style={{ color: "#333", fontSize: 16, display: "flex", justifyContent: "space-between" }}>
              <span>Rating:</span>
              <span style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 5 }}>
                <svg className="w-5 h-5" fill="#facc15" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {stats.rating}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
