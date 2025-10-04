import React, { useState } from "react";

// Icon SVGs for simplicity (no dependencies)
const PhoneIcon = ({ className = "" }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M2.5 3.5A2.5 2.5 0 015 1h2A2.5 2.5 0 019.5 3.5V4a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5zm13 0A2.5 2.5 0 0015 1h-2A2.5 2.5 0 0010.5 3.5V4a1 1 0 001 1h3a1 1 0 001-1V3.5z" stroke="#17855b" strokeWidth="1.5"/><path d="M3 5h14v9.5A2.5 2.5 0 0114.5 17h-9A2.5 2.5 0 013 14.5V5z" stroke="#17855b" strokeWidth="1.5"/></svg>
);
const CalendarIcon = ({ className = "" }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="2" stroke="#fff" strokeWidth="1.5"/><path d="M16.5 8.5h-13" stroke="#fff" strokeWidth="1.5"/></svg>
);
const HistoryIcon = ({ className = "" }) => (
  <svg className={className} width="18" height="18" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#2563eb" strokeWidth="1.5"/><path d="M10 5v5l3 2" stroke="#2563eb" strokeWidth="1.5"/></svg>
);
const SettingsIcon = ({ className = "" }) => (
  <svg className={className} width="18" height="18" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" stroke="#2563eb" strokeWidth="1.5"/><path d="M10 2v2M10 16v2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M2 10h2M16 10h2M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="#2563eb" strokeWidth="1.5"/></svg>
);
const AlertIcon = ({ className = "" }) => (
  <svg className={className} width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 4v6" stroke="#e11d48" strokeWidth="1.7"/><circle cx="10" cy="15" r="1" fill="#e11d48"/><circle cx="10" cy="10" r="9" stroke="#e11d48" strokeWidth="1.7"/></svg>
);

export default function OKUDashboard() {
  const driver = { name: "Encik Ahmad Rahman", phone: "012-345-6789" };
  const service = { period: "1 Jan - 31 Jan 2024", status: "Active" };

  // State for modals
  const [showSchedule, setShowSchedule] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    pickup: "",
    destination: "",
    requirements: ""
  });

  // Accessibility
  const [accessSettings, setAccessSettings] = useState({
    wheelchair: false,
    visual: false,
    hearing: false,
  });

  // Main data
  const [recentTrips, setRecentTrips] = useState([
    { id: 1, destination: "Hospital Sultanah Nur Zahirah", date: "15 Jan 2024, 9:00 AM", status: "Completed" },
    { id: 2, destination: "Pasar Payang", date: "14 Jan 2024, 2:30 PM", status: "Completed" }
  ]);

  // Handlers
  const handleCallDriver = () => window.open(`tel:${driver.phone.replace(/-/g, "")}`, "_self");
  const handleEmergency = () => window.open("tel:999", "_self");
  const handleOpenSchedule = () => setShowSchedule(true);
  const handleOpenHistory = () => setShowHistory(true);
  const handleOpenAccessibility = () => setShowAccessibility(true);

  // Schedule modal submit
  const handleScheduleChange = (field, value) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }));
  };
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setRecentTrips([
      {
        id: recentTrips.length + 1,
        destination: scheduleForm.destination,
        date: `${scheduleForm.date}, ${scheduleForm.time}`,
        status: "Scheduled",
      },
      ...recentTrips,
    ]);
    setShowSchedule(false);
    setScheduleForm({ date: "", time: "", pickup: "", destination: "", requirements: "" });
    alert("Ride scheduled successfully!");
  };

  // Accessibility modal submit
  const handleAccessibilitySave = (e) => {
    e.preventDefault();
    setShowAccessibility(false);
    alert("Accessibility settings saved!");
  };

  // For history modal (add more example trips)
  const allTrips = [
    ...recentTrips,
    { id: 3, destination: "Bank Islam", date: "13 Jan 2024, 10:00 AM", status: "Completed" },
    { id: 4, destination: "Klinik Kesihatan", date: "12 Jan 2024, 8:30 AM", status: "Completed" },
    { id: 5, destination: "Universiti Malaysia Terengganu", date: "11 Jan 2024, 2:00 PM", status: "Completed" }
  ];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* MAIN COLUMN */}
        <main style={{ flex: 2, minWidth: 350 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: "0 2px 8px #eee" }}>
            <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>My Monthly Transport Service</h2>
            {/* SERVICE CARD */}
            <div style={{ background: "#e8faee", border: "1px solid #bdf3d1", borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 16, gap: 12 }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#17855b", marginBottom: 8 }}>January 2024 Service</div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: "#888", fontSize: 13 }}>Assigned Driver:</span><br />
                    <b>{driver.name}</b>
                    <div style={{ color: "#17855b", fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <PhoneIcon /> {driver.phone}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#888", fontSize: 13 }}>Service Period:</span><br />
                    <b>{service.period}</b>
                    <div style={{ color: "#17855b", fontSize: 14, marginTop: 2 }}>Approved by JKM</div>
                  </div>
                </div>
                <div>
                  <span style={{ background: "#c1f0d6", color: "#17855b", borderRadius: 8, padding: "4px 16px", fontWeight: "bold" }}>{service.status}</span>
                </div>
              </div>
              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                <button
                  style={{ flex: 1, background: "#2563eb", color: "#fff", padding: "16px 0", borderRadius: 8, fontWeight: "bold", border: "none", fontSize: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
                  onClick={handleCallDriver}
                >
                  <PhoneIcon className="icon" /> Call My Driver
                </button>
                <button
                  style={{ flex: 1, background: "#22c55e", color: "#fff", padding: "16px 0", borderRadius: 8, fontWeight: "bold", border: "none", fontSize: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
                  onClick={handleOpenSchedule}
                >
                  <CalendarIcon className="icon" /> Schedule Ride
                </button>
              </div>
            </div>
            {/* RECENT TRIPS */}
            <div>
              <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>Recent Trips</div>
              {recentTrips.slice(0, 3).map(trip => (
                <div key={trip.id} style={{ background: "#f5f7fa", borderRadius: 8, padding: 16, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{trip.destination}</div>
                    <div style={{ color: "#888" }}>{trip.date}</div>
                  </div>
                  <span style={{ background: "#c1f0d6", color: "#17855b", borderRadius: 8, padding: "2px 12px", fontSize: 12 }}>{trip.status}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
        {/* SIDEBAR */}
        <aside style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, minWidth: 320 }}>
          {/* EMERGENCY */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: "0 2px 8px #eee" }}>
            <div style={{ fontWeight: "bold", color: "#e11d48", marginBottom: 12, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertIcon /> Emergency
            </div>
            <button
              style={{ width: "100%", background: "#e11d48", color: "#fff", fontWeight: "bold", borderRadius: 8, padding: "16px 0", border: "none", fontSize: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
              onClick={handleEmergency}
            >
              <PhoneIcon /> Emergency (999)
            </button>
          </div>
          {/* QUICK ACTIONS */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px #eee" }}>
            <div style={{ fontWeight: "bold", marginBottom: 12, fontSize: 18 }}>Quick Actions</div>
            <button
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 0", marginBottom: 8, background: "#fff", fontWeight: "bold", display: "flex", alignItems: "center", gap: 8, color: "#2563eb", fontSize: 16, justifyContent: "flex-start" }}
              onClick={handleOpenHistory}
            >
              <HistoryIcon /> View Service History
            </button>
            <button
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 0", background: "#fff", fontWeight: "bold", display: "flex", alignItems: "center", gap: 8, color: "#2563eb", fontSize: 16, justifyContent: "flex-start" }}
              onClick={handleOpenAccessibility}
            >
              <SettingsIcon /> Accessibility Settings
            </button>
          </div>
        </aside>
      </div>

      {/* SCHEDULE MODAL */}
      {showSchedule && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form style={{ background: "#fff", borderRadius: 12, padding: 32, width: 400, maxWidth: "90%", position: "relative" }} onSubmit={handleScheduleSubmit}>
            <button type="button" style={{ position: "absolute", right: 24, top: 18, background: "none", border: "none", fontSize: 24 }} onClick={() => setShowSchedule(false)}>×</button>
            <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarIcon /> Schedule Your Ride
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Select Date</label><br />
              <input type="date" value={scheduleForm.date} onChange={e => handleScheduleChange("date", e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Select Time</label><br />
              <select value={scheduleForm.time} onChange={e => handleScheduleChange("time", e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}>
                <option value="">Choose time</option>
                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Pickup Location</label><br />
              <input type="text" value={scheduleForm.pickup} onChange={e => handleScheduleChange("pickup", e.target.value)} placeholder="Enter pickup address" required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Destination</label><br />
              <input type="text" value={scheduleForm.destination} onChange={e => handleScheduleChange("destination", e.target.value)} placeholder="Enter destination" required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Special Requirements (Optional)</label><br />
              <textarea value={scheduleForm.requirements} onChange={e => handleScheduleChange("requirements", e.target.value)} rows={2} placeholder="Any special assistance needed..." style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={() => setShowSchedule(false)} style={{ flex: 1, background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "10px 0", fontWeight: "bold" }}>Cancel</button>
              <button type="submit" style={{ flex: 1, background: "#22c55e", color: "#fff", borderRadius: 8, padding: "10px 0", fontWeight: "bold", border: "none", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <CalendarIcon /> Schedule Ride
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 500, maxWidth: "90%", position: "relative", maxHeight: "90vh", overflow: "auto" }}>
            <button type="button" style={{ position: "absolute", right: 24, top: 18, background: "none", border: "none", fontSize: 24 }} onClick={() => setShowHistory(false)}>×</button>
            <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <HistoryIcon /> Service History
            </div>
            <div>
              {allTrips.map(trip => (
                <div key={trip.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{trip.destination}</div>
                    <div style={{ color: "#888", fontSize: 14 }}>Driver: {driver.name}</div>
                    <div style={{ color: "#aaa", fontSize: 12 }}>{trip.date}</div>
                  </div>
                  <span style={{ background: "#c1f0d6", color: "#17855b", borderRadius: 8, padding: "2px 12px", fontSize: 12, fontWeight: "bold" }}>{trip.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACCESSIBILITY MODAL */}
      {showAccessibility && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form style={{ background: "#fff", borderRadius: 12, padding: 32, width: 400, maxWidth: "90%", position: "relative" }} onSubmit={handleAccessibilitySave}>
            <button type="button" style={{ position: "absolute", right: 24, top: 18, background: "none", border: "none", fontSize: 24 }} onClick={() => setShowAccessibility(false)}>×</button>
            <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <SettingsIcon /> Accessibility Settings
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Mobility Requirements</div>
              <label style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <input type="checkbox" checked={accessSettings.wheelchair} onChange={e => setAccessSettings(s => ({ ...s, wheelchair: e.target.checked }))} style={{ marginRight: 8 }} />
                Wheelchair user
              </label>
              <label style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <input type="checkbox" checked={accessSettings.visual} onChange={e => setAccessSettings(s => ({ ...s, visual: e.target.checked }))} style={{ marginRight: 8 }} />
                Visual impairment
              </label>
              <label style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <input type="checkbox" checked={accessSettings.hearing} onChange={e => setAccessSettings(s => ({ ...s, hearing: e.target.checked }))} style={{ marginRight: 8 }} />
                Hearing impairment
              </label>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={() => setShowAccessibility(false)} style={{ flex: 1, background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "10px 0", fontWeight: "bold" }}>Cancel</button>
              <button type="submit" style={{ flex: 1, background: "#2563eb", color: "#fff", borderRadius: 8, padding: "10px 0", fontWeight: "bold", border: "none" }}>
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}