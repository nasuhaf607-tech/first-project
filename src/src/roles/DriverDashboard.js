import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LiveMap from "../components/LiveMap";

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

  // Booking lists
  const [driverId] = useState(() => {
    try { return localStorage.getItem("driver_id") || "DRV1"; } catch { return "DRV1"; }
  });
  const [myBookings, setMyBookings] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(false);
  // GPS sharing state
  const [isSharing, setIsSharing] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [activeRideId, setActiveRideId] = useState(() => {
    try { return localStorage.getItem("ride_id") || ""; } catch { return ""; }
  });
  const [pickupLocation] = useState(null);
  const [user, setUser] = useState(null);
  const watchIdRef = useRef(null);
  const navigate = useNavigate();

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const [u, m] = await Promise.all([
        fetch("http://localhost/first-project/backend/driverBookings.php?action=unassigned").then(r=>r.json()),
        fetch(`http://localhost/first-project/backend/driverBookings.php?action=my&driver_id=${encodeURIComponent(driverId)}`).then(r=>r.json())
      ]);
      if (u && u.success) setUnassigned(u.data || []);
      if (m && m.success) setMyBookings(m.data || []);
    } catch {}
    setLoading(false);
  }, [driverId]);

  useEffect(() => { 
    // Load user data
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadLists(); 
  }, [loadLists]);

  const postLocation = async (position) => {
    const { latitude, longitude, speed, heading } = position.coords;
    setLastLocation({ lat: latitude, lng: longitude, speed, heading, ts: Date.now() });
    try {
      await fetch("http://localhost/first-project/backend/location.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: activeRideId,
          driver_id: driverId,
          lat: latitude,
          lng: longitude,
          speed: typeof speed === "number" ? speed : null,
          heading: typeof heading === "number" ? heading : null,
        }),
      });
    } catch (e) {
      // swallow errors for now
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation || isSharing || !activeRideId) return;
    // Send an immediate one-time ping so passenger sees ETA quickly
    navigator.geolocation.getCurrentPosition(postLocation, () => {}, { enableHighAccuracy: true, timeout: 10000 });
    const watchId = navigator.geolocation.watchPosition(postLocation, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 10000,
    });
    watchIdRef.current = watchId;
    setIsSharing(true);
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    setIsSharing(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const acceptRide = async (rideId) => {
    try {
      await fetch("http://localhost/first-project/backend/driverBookings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", ride_id: rideId, driver_id: driverId })
      });
      try { localStorage.setItem("ride_id", rideId); localStorage.setItem("driver_id", driverId); } catch {}
      setActiveRideId(rideId);
      await loadLists();
      alert("Ride accepted. You can start sharing location to enable ETA.");
    } catch {}
  };

  const declineRide = async (rideId) => {
    try {
      await fetch("http://localhost/first-project/backend/driverBookings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", ride_id: rideId })
      });
      await loadLists();
    } catch {}
  };

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
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 32 }}>
      {/* MODALS */}
      {showCall.open && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:10,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:32,width:350,maxWidth:"90%",position:"relative"}}>
            <button onClick={()=>setShowCall({open:false,phone:""})} style={{position:"absolute",right:20,top:15,background:"none",border:"none",fontSize:24,color:"#bbb"}}>×</button>
            <div style={{fontWeight:"bold",fontSize:20,marginBottom:20,color:"#2563eb"}}>Call User</div>
            <div style={{marginBottom:24}}>Call <span style={{fontWeight:"bold"}}>{showCall.phone}</span>?</div>
            <button onClick={doCall} style={{width:"100%",background:"#2563eb",color:"#fff",padding:"12px 0",borderRadius:8,fontWeight:"bold",border:"none"}}>Call Now</button>
          </div>
        </div>
      )}
      {showStart.open && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:10,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:32,width:350,maxWidth:"90%",position:"relative"}}>
            <button onClick={()=>setShowStart({open:false,name:""})} style={{position:"absolute",right:20,top:15,background:"none",border:"none",fontSize:24,color:"#bbb"}}>×</button>
            <div style={{fontWeight:"bold",fontSize:20,marginBottom:20,color:"#22c55e"}}>Start Service</div>
            <div style={{marginBottom:24}}>Start service for <span style={{fontWeight:"bold"}}>{showStart.name}</span>?</div>
            <button onClick={doStart} style={{width:"100%",background:"#22c55e",color:"#fff",padding:"12px 0",borderRadius:8,fontWeight:"bold",border:"none"}}>Start Now</button>
          </div>
        </div>
      )}
      {showAccept.open && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:10,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:32,width:350,maxWidth:"90%",position:"relative"}}>
            <button onClick={()=>setShowAccept({open:false,ride:null})} style={{position:"absolute",right:20,top:15,background:"none",border:"none",fontSize:24,color:"#bbb"}}>×</button>
            <div style={{fontWeight:"bold",fontSize:20,marginBottom:20,color:"#2563eb"}}>Accept Scheduled Ride</div>
            <div style={{marginBottom:24}}>Accept scheduled ride for <span style={{fontWeight:"bold"}}>{showAccept.ride?.okuUser}</span>?</div>
            <button onClick={doAccept} style={{width:"100%",background:"#2563eb",color:"#fff",padding:"12px 0",borderRadius:8,fontWeight:"bold",border:"none"}}>Accept Ride</button>
          </div>
        </div>
      )}

      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",gap:32,flexWrap:"wrap"}}>
        {/* MAIN COLUMN */}
        <main style={{flex:2,minWidth:350}}>
          <div style={{background:"#fff",borderRadius:16,padding:32,marginBottom:32,boxShadow:"0 2px 8px #eee"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:"16px"}}>
              <h2 style={{fontSize:24,fontWeight:"bold",margin:0,color:"#2563eb"}}>🚗 Driver Dashboard</h2>
              
              {/* Action Buttons */}
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    padding:"10px 16px",
                    background:"#6b7280",
                    color:"#fff",
                    border:"none",
                    borderRadius:"8px",
                    fontSize:"14px",
                    fontWeight:"bold",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:"6px"
                  }}
                >
                  🏠 Home
                </button>
                
                <button
                  onClick={() => {
                    if (user) {
                      alert(`Profile Information:\n\nName: ${user.name}\nEmail: ${user.email}\nUser Type: ${user.userType}\nPhone: ${user.phone || 'Not provided'}`);
                    } else {
                      alert("Driver Profile\n\nDriver ID: " + driverId);
                    }
                  }}
                  style={{
                    padding:"10px 16px",
                    background:"#3b82f6",
                    color:"#fff",
                    border:"none",
                    borderRadius:"8px",
                    fontSize:"14px",
                    fontWeight:"bold",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:"6px"
                  }}
                >
                  👤 Profile
                </button>
                
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to logout?")) {
                      localStorage.removeItem("user");
                      localStorage.removeItem("driver_id");
                      localStorage.removeItem("ride_id");
                      navigate("/");
                    }
                  }}
                  style={{
                    padding:"10px 16px",
                    background:"#ef4444",
                    color:"#fff",
                    border:"none",
                    borderRadius:"8px",
                    fontSize:"14px",
                    fontWeight:"bold",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:"6px"
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
            {/* Live Requests */}
            <div style={{marginBottom:24}}>
              <div style={{fontWeight:"bold",fontSize:18,marginBottom:12,color:"#2563eb"}}>Unassigned Requests</div>
              {loading && <div style={{color:"#888"}}>Loading...</div>}
              {!loading && unassigned.length === 0 && (
                <div style={{background:"#f1f5f9",padding:12,borderRadius:8,color:"#555"}}>No unassigned rides.</div>
              )}
              {unassigned.map(b => (
                <div key={b.ride_id} style={{background:"#eef2ff",border:"1px solid #dbe2fe",borderRadius:12,padding:16,marginBottom:10}}>
                  <div style={{fontWeight:"bold",color:"#4f46e5"}}>{b.pickup} → {b.destination}</div>
                  <div style={{fontSize:13,color:"#555"}}>🗓 {b.date} {b.time}</div>
                  <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                    <button onClick={()=>acceptRide(b.ride_id)} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:8,padding:"8px 12px",fontWeight:"bold"}}>Accept</button>
                    <button onClick={()=>declineRide(b.ride_id)} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:8,padding:"8px 12px",fontWeight:"bold"}}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
            {/* My Accepted Rides */}
            <div style={{marginBottom:24}}>
              <div style={{fontWeight:"bold",fontSize:18,marginBottom:12,color:"#17855b"}}>My Accepted Rides</div>
              {myBookings.length === 0 && (
                <div style={{background:"#ecfdf5",padding:12,borderRadius:8,color:"#166534"}}>No accepted rides yet.</div>
              )}
              {myBookings.map(b => (
                <div key={b.ride_id} style={{background:"#e8faee",border:"1px solid #bdf3d1",borderRadius:12,padding:16,marginBottom:10}}>
                  <div style={{fontWeight:"bold",color:"#17855b"}}>{b.pickup} → {b.destination}</div>
                  <div style={{fontSize:13,color:"#555"}}>🗓 {b.date} {b.time} • Status: {b.status}</div>
                  <div style={{fontSize:12,color:"#777",marginTop:6}}>Ride ID: {b.ride_id}</div>
                </div>
              ))}
            </div>
            {/* Monthly Assignments */}
            <div style={{marginBottom:32}}>
              <div style={{fontWeight:"bold",fontSize:18,marginBottom:12,color:"#17855b"}}>Monthly Assignments</div>
              {assignments.map(a => (
                <div key={a.id} style={{background:"#e0edfa",border:"1px solid #b7d6f8",borderRadius:12,padding:24,marginBottom:14,display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <div style={{width:56,height:56,borderRadius:"50%",background:"#93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:22,color:"#2563eb"}}>
                      {a.okuUser.name.split(" ").map(x => x[0]).join("")}
                    </div>
                    <div>
                      <div style={{fontWeight:"bold",color:"#2563eb",fontSize:16}}>{a.okuUser.name}</div>
                      <div style={{color:"#666",fontSize:14}}>{a.okuUser.type}</div>
                      <div style={{color:"#888",fontSize:13,marginTop:2}}>Contact: {a.okuUser.phone}</div>
                      <div style={{color:"#888",fontSize:13}}>Preferred times: {a.okuUser.preferred}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
                    <span style={{background:"#c7e0fb",color:"#2563eb",borderRadius:8,padding:"3px 12px",fontWeight:"bold",fontSize:13}}>{a.period}</span>
                    <button
                      onClick={()=>handleCallUser(a.okuUser.phone)}
                      style={{display:"flex",alignItems:"center",gap:6,background:"#2563eb",color:"#fff",border:"none",borderRadius:7,padding:"7px 15px",fontWeight:"bold",fontSize:15,cursor:"pointer"}}
                    >
                      <PhoneIcon /> Call User
                    </button>
                    <button
                      onClick={()=>handleStartService(a.okuUser.name)}
                      style={{display:"flex",alignItems:"center",gap:6,background:"#22c55e",color:"#fff",border:"none",borderRadius:7,padding:"7px 15px",fontWeight:"bold",fontSize:15,cursor:"pointer"}}
                    >
                      <StartIcon /> Start Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Today's Scheduled Rides */}
            <div>
              <div style={{fontWeight:"bold",fontSize:18,marginBottom:12,color:"#7c3aed"}}>Today's Scheduled Rides</div>
              {todayRides.map(r => (
                <div key={r.id} style={{background:"#ede9fe",border:"1px solid #d1c4e9",borderRadius:12,padding:24,marginBottom:14}}>
                  <div style={{fontWeight:"bold",fontSize:16,marginBottom:4,color:"#7c3aed"}}>{r.okuUser}</div>
                  <div style={{fontSize:14,color:"#444"}}>Pickup: <span style={{fontWeight:"bold"}}>{r.pickup}</span></div>
                  <div style={{fontSize:14,color:"#444"}}>Destination: <span style={{fontWeight:"bold"}}>{r.destination}</span></div>
                  <div style={{fontSize:12,color:"#6366f1",marginTop:4}}>🗓 {r.time}</div>
                  <button
                    onClick={()=>handleAcceptRide(r)}
                    style={{marginTop:14,width:"100%",background:"#2563eb",color:"#fff",fontWeight:"bold",borderRadius:8,padding:"10px 0",fontSize:15,border:"none",boxShadow:"0 1px 4px #ddd"}}
                  >
                    Accept Scheduled Ride
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
        {/* SIDEBAR */}
        <aside style={{flex:1,minWidth:320,display:"flex",flexDirection:"column",gap:24}}>
          <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 8px #eee",borderLeft:"8px solid #2563eb"}}>
            <div style={{fontWeight:"bold",fontSize:18,marginBottom:14,color:"#2563eb"}}>Assignment Stats</div>
            <div style={{color:"#333",fontSize:16,marginBottom:8,display:"flex",justifyContent:"space-between"}}>
              <span>Assigned Users:</span> <span style={{fontWeight:"bold"}}>{stats.assignedUsers}</span>
            </div>
            <div style={{color:"#333",fontSize:16,marginBottom:8,display:"flex",justifyContent:"space-between"}}>
              <span>Trips Completed:</span> <span style={{fontWeight:"bold"}}>{stats.completedTrips}</span>
            </div>
            <div style={{color:"#333",fontSize:16,display:"flex",justifyContent:"space-between"}}>
              <span>Rating:</span>
              <span style={{fontWeight:"bold",display:"flex",alignItems:"center",gap:5}}>
                <svg className="w-5 h-5" fill="#facc15" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                {stats.rating}
              </span>
            </div>
          </div>
        </aside>
        {/* GPS SHARING SIDEBAR */}
        <aside style={{flex:1,minWidth:320,display:"flex",flexDirection:"column",gap:24}}>
          <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 8px #eee"}}>
            <div style={{fontWeight:"bold",fontSize:18,marginBottom:12,color:"#2563eb"}}>🚗 Live GPS Tracking</div>
            {activeRideId ? (
              <>
                {/* Live Map for Driver */}
                <div style={{marginBottom:16}}>
                  <LiveMap
                    driverLocation={lastLocation}
                    passengerLocation={null}
                    pickupLocation={pickupLocation}
                    destinationLocation={null}
                    eta={null}
                    rideId={activeRideId}
                    isDriver={true}
                  />
                </div>
                
                <div style={{fontSize:14,color:"#555",marginBottom:12}}>Ride ID: <span style={{fontWeight:"bold"}}>{activeRideId}</span></div>
                <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
                  {!isSharing ? (
                    <button onClick={startSharing} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:"bold"}}>📍 Start GPS</button>
                  ) : (
                    <button onClick={stopSharing} style={{background:"#ef4444",color:"#fff",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:"bold"}}>⏹️ Stop GPS</button>
                  )}
                </div>
                {lastLocation && (
                  <div style={{fontSize:12,color:"#666",background:"#f5f5f5",padding:8,borderRadius:6}}>
                    <div><strong>📍 Location:</strong> {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}</div>
                    <div><strong>🚗 Speed:</strong> {lastLocation.speed ? `${(lastLocation.speed * 3.6).toFixed(1)} km/h` : "N/A"}</div>
                    <div><strong>⏰ Updated:</strong> {new Date(lastLocation.ts).toLocaleTimeString()}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{color:"#666",fontSize:14,textAlign:"center",padding:"20px"}}>
                📋 Accept a ride to start GPS tracking
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}