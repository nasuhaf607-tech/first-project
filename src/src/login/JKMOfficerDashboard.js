import React, { useState } from "react";

const StarIcon = () => (
  <svg width="18" height="18" fill="#fbbf24" viewBox="0 0 20 20" style={{display:'inline',verticalAlign:'middle'}}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
);

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
      background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: 32, width: 370, maxWidth: "95vw", position: "relative", boxShadow: "0 2px 24px #bbb"
      }}>
        <button onClick={onClose} style={{ position: "absolute", right: 18, top: 12, background: "none", border: "none", fontSize: 26, color: "#bbb" }}>×</button>
        <div style={{ fontWeight: "bold", fontSize: 22, marginBottom: 18, color: "#2563eb" }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

export default function JKMOfficerDashboard() {
  // Stats etc omitted for brevity
  const stats = [
    { label: "Active OKU Users", value: 247 },
    { label: "Monthly Services", value: 89 },
    { label: "This Month Trips", value: "1,256" },
    { label: "Monthly Budget", value: "RM 45,000" },
  ];
  const [tab, setTab] = useState("services");
  const [modal, setModal] = useState({ open: false, type: null, data: null });
  const [ratings, setRatings] = useState([
    {
      initials: "SA",
      name: "Encik Siti Aminah",
      period: "January 2024 Performance",
      rating: 4.8,
      usersServed: 15,
      feedback: [
        "Very helpful and patient",
        "Always on time",
        "Vehicle always clean",
        "Good communication"
      ]
    }
  ]);
  const [form, setForm] = useState({
    initials: "",
    name: "",
    period: "",
    rating: "",
    usersServed: "",
    feedback: ""
  });

  // Monthly services table
  const services = [
    { id: 1, user: { initials: "AR", name: "Ahmad Rahman", type: "Wheelchair user" }, period: "January 2024", driver: "Encik Siti Aminah", status: "Active" },
    { id: 2, user: { initials: "FH", name: "Fatimah Hassan", type: "Visual impairment" }, period: "February 2024", driver: "Pending Assignment", status: "Pending" },
  ];

  // Reports
  const utilization = [
    { label: "🦽 Wheelchair users", value: "65%" },
    { label: "👁️ Visual impairment", value: "20%" },
    { label: "🦯 Mobility aids", value: "15%" }
  ];
  const budget = {
    allocated: "RM 45,000",
    used: "RM 38,500",
    remaining: "RM 6,500"
  };

  // Button/modal handlers
  const handleModal = (type, data = null) => setModal({ open: true, type, data });
  const closeModal = () => setModal({ open: false, type: null, data: null });

  // Services buttons
  const handleApprove = (row) => handleModal("approve", row);
  const handleAssignDriver = (row) => handleModal("assign", row);
  const handleViewDetails = (row) => handleModal("details", row);
  const handleModify = (row) => handleModal("modify", row);

  // Ratings add/edit
  const handleAddRating = () => {
    setForm({
      initials: "",
      name: "",
      period: "",
      rating: "",
      usersServed: "",
      feedback: ""
    });
    handleModal("add-rating");
  };
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAddRatingSubmit = e => {
    e.preventDefault();
    setRatings([
      ...ratings,
      {
        initials: form.initials,
        name: form.name,
        period: form.period,
        rating: Number(form.rating),
        usersServed: Number(form.usersServed),
        feedback: form.feedback.split("\n").map(f => f.trim()).filter(Boolean)
      }
    ]);
    closeModal();
  };

  // Modal content
  const renderModal = () => {
    if (!modal.open) return null;
    const { type, data } = modal;
    if (type === "approve")
      return (
        <Modal title="Approve Service" onClose={closeModal}>
          <div style={{ marginBottom: 16 }}>Approve service for <b>{data.user.name}</b>? ✅</div>
          <button
            onClick={() => { closeModal(); alert("Service approved!"); }}
            style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", padding: "10px 0", width: "100%" }}
          >
            Approve Service
          </button>
        </Modal>
      );
    if (type === "assign")
      return (
        <Modal title="Assign Driver" onClose={closeModal}>
          <div style={{ marginBottom: 16 }}>Assign a driver for <b>{data.user.name}</b>? 🚗</div>
          <button
            onClick={() => { closeModal(); alert("Assigning driver..."); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", padding: "10px 0", width: "100%" }}
          >
            Assign Driver
          </button>
        </Modal>
      );
    if (type === "details")
      return (
        <Modal title="Service Details" onClose={closeModal}>
          <div style={{marginBottom:10}}><b>User:</b> {data.user.name} ({data.user.type})</div>
          <div style={{marginBottom:10}}><b>Period:</b> {data.period}</div>
          <div style={{marginBottom:10}}><b>Driver:</b> {data.driver}</div>
          <div style={{marginBottom:10}}><b>Status:</b> {data.status}</div>
          <button
            onClick={closeModal}
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", padding: "10px 0", width: "100%", marginTop: 20 }}
          >
            Close
          </button>
        </Modal>
      );
    if (type === "modify")
      return (
        <Modal title="Modify Service" onClose={closeModal}>
          <div style={{ marginBottom: 16 }}>Modify service for <b>{data.user.name}</b> (Demo only) ✏️</div>
          <button
            onClick={() => { closeModal(); alert("Modifying..."); }}
            style={{ background: "#fb923c", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", padding: "10px 0", width: "100%" }}
          >
            Modify
          </button>
        </Modal>
      );
    if (type === "add-rating")
      return (
        <Modal title="Add New Driver Rating" onClose={closeModal}>
          <form onSubmit={handleAddRatingSubmit}>
            <div style={{marginBottom:10}}>
              <input name="initials" placeholder="Initials" value={form.initials} onChange={handleFormChange}
                style={{width:"48px",marginRight:12,padding:6,borderRadius:6,border:"1px solid #ddd"}} required/>
              <input name="name" placeholder="Driver Name" value={form.name} onChange={handleFormChange}
                style={{width:"calc(100% - 70px)",padding:6,borderRadius:6,border:"1px solid #ddd"}} required/>
            </div>
            <div style={{marginBottom:10}}>
              <input name="period" placeholder="Performance Period" value={form.period} onChange={handleFormChange}
                style={{width:"100%",padding:6,borderRadius:6,border:"1px solid #ddd"}} required/>
            </div>
            <div style={{marginBottom:10,display:"flex",gap:8}}>
              <input name="rating" type="number" min="0" max="5" step="0.1" placeholder="Rating" value={form.rating} onChange={handleFormChange}
                style={{width:64,padding:6,borderRadius:6,border:"1px solid #ddd"}} required/>
              <input name="usersServed" type="number" min="1" placeholder="Users Served" value={form.usersServed} onChange={handleFormChange}
                style={{width:120,padding:6,borderRadius:6,border:"1px solid #ddd"}} required/>
            </div>
            <div style={{marginBottom:10}}>
              <textarea name="feedback" placeholder="Feedback (one per line)" value={form.feedback} onChange={handleFormChange}
                style={{width:"100%",padding:6,borderRadius:6,border:"1px solid #ddd"}} rows={4} required/>
            </div>
            <button style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", padding: "10px 0", width: "100%" }}>
              Add Rating
            </button>
          </form>
        </Modal>
      );
    return null;
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 0 }}>
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

      {renderModal()}
      {/* ✅ Added top padding so content isn’t hidden behind fixed banner */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "110px 0 24px 0" }}>
        <h2 style={{ fontWeight: "bold", fontSize: 32, margin: "32px 0 32px 40px", color: "#111", letterSpacing: "-1px" }}>
          JKM Officer Dashboard
        </h2>
        {/* Stats */}
        <div style={{ display: "flex", gap: 24, marginBottom: 40, justifyContent: "flex-start", flexWrap: "wrap", marginLeft: 40 }}>
          {stats.map((s, i) => (
            <div key={s.label}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 16px #eee",
                padding: "24px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                minWidth: 230,
                marginBottom: 8,
                position: "relative"
              }}
            >
              <div style={{ fontSize: 15, color: "#888", marginBottom: 8, display: "flex", alignItems: "center", gap: 9 }}>{s.label}</div>
              <div style={{ fontWeight: "bold", fontSize: 28, color: "#111", letterSpacing: "-1px", marginBottom: 8 }}>{s.value}</div>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 16px #eee", padding: "32px 0 16px 0", margin: "0 40px 40px 40px" }}>
          <div style={{ display: "flex", gap: 30, borderBottom: "1.5px solid #f1f5f9", marginLeft: 32, marginRight: 32, marginBottom: 18 }}>
            <button style={{
              paddingBottom: 10,
              fontWeight: "bold",
              fontSize: 20,
              background: "none",
              border: "none",
              color: tab === "services" ? "#2563eb" : "#888",
              borderBottom: tab === "services" ? "4px solid #2563eb" : "none",
              cursor: "pointer"
            }} onClick={() => setTab("services")}>Monthly Services</button>
            <button style={{
              paddingBottom: 10,
              fontWeight: "bold",
              fontSize: 20,
              background: "none",
              border: "none",
              color: tab === "ratings" ? "#2563eb" : "#888",
              borderBottom: tab === "ratings" ? "4px solid #2563eb" : "none",
              cursor: "pointer"
            }} onClick={() => setTab("ratings")}>Monthly Ratings</button>
            <button style={{
              paddingBottom: 10,
              fontWeight: "bold",
              fontSize: 20,
              background: "none",
              border: "none",
              color: tab === "reports" ? "#2563eb" : "#888",
              borderBottom: tab === "reports" ? "4px solid #2563eb" : "none",
              cursor: "pointer"
            }} onClick={() => setTab("reports")}>Reports</button>
          </div>
          {tab === "services" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 32px 24px 32px" }}>
                <div style={{ fontWeight: "bold", fontSize: 22, color: "#2563eb" }}>Monthly Service Management</div>
                <button
                  onClick={() => handleApprove({ user: { name: "All Pending" } })}
                  style={{ background: "#22c55e", color: "#fff", padding: "12px 32px", borderRadius: 8, fontWeight: "bold", fontSize: 18, boxShadow: "0 1px 4px #ddd", border: "none", cursor: "pointer" }}>
                  ✔ Approve Pending Services
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#888", fontSize: 14, textAlign: "left", background: "#fafbfc" }}>
                      <th style={{ padding: "16px 0 12px 48px", fontWeight: 500 }}>OKU USER</th>
                      <th style={{ padding: "16px 0 12px 0", fontWeight: 500 }}>SERVICE PERIOD</th>
                      <th style={{ padding: "16px 0 12px 0", fontWeight: 500 }}>ASSIGNED DRIVER</th>
                      <th style={{ padding: "16px 0 12px 0", fontWeight: 500 }}>STATUS</th>
                      <th style={{ padding: "16px 0 12px 0", fontWeight: 500 }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #f0f0f0", background: "#fff" }}>
                        <td style={{ padding: "18px 0 14px 48px", display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#2563eb", fontSize: 15 }}>{s.user.initials}</div>
                          <div>
                            <div style={{ fontWeight: "bold", fontSize: 15, color: "#222" }}>{s.user.name}</div>
                            <div style={{ color: "#888", fontSize: 13 }}>{s.user.type}</div>
                          </div>
                        </td>
                        <td style={{ padding: "18px 0 14px 0", fontSize: 15, color: "#333" }}>{s.period}</td>
                        <td style={{ padding: "18px 0 14px 0", fontSize: 15, color: "#333" }}>{s.driver}</td>
                        <td style={{ padding: "18px 0 14px 0" }}>
                          {s.status === "Active" && (
                            <span style={{ background: "#bbf7d0", color: "#16a34a", padding: "3px 18px", borderRadius: 16, fontSize: 14, fontWeight: 500 }}>Active</span>
                          )}
                          {s.status === "Pending" && (
                            <span style={{ background: "#fef08a", color: "#eab308", padding: "3px 18px", borderRadius: 16, fontSize: 14, fontWeight: 500 }}>Pending</span>
                          )}
                        </td>
                        <td style={{ padding: "18px 0 14px 0" }}>
                          {s.status === "Active" && (
                            <>
                              <button onClick={() => handleViewDetails(s)} style={{ color: "#2563eb", background: "none", border: "none", fontWeight: 500, fontSize: 15, cursor: "pointer", marginRight: 20 }}>👁️ View Details</button>
                              <button onClick={() => handleModify(s)} style={{ color: "#fb923c", background: "none", border: "none", fontWeight: 500, fontSize: 15, cursor: "pointer" }}>✏️ Modify</button>
                            </>
                          )}
                          {s.status === "Pending" && (
                            <>
                              <button onClick={() => handleApprove(s)} style={{ color: "#22c55e", background: "none", border: "none", fontWeight: 500, fontSize: 15, cursor: "pointer", marginRight: 20 }}>✔ Approve</button>
                              <button onClick={() => handleAssignDriver(s)} style={{ color: "#2563eb", background: "none", border: "none", fontWeight: 500, fontSize: 15, cursor: "pointer" }}>🚗 Assign Driver</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "ratings" && (
            <div style={{margin:"0 32px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                <div style={{fontWeight:"bold",fontSize:22,color:"#2563eb"}}>Monthly Driver Performance Ratings</div>
                <button
                  onClick={handleAddRating}
                  style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontWeight:"bold",padding:"10px 20px",fontSize:16,cursor:"pointer"}}
                >➕ Add Driver Rating</button>
              </div>
              {ratings.map((driver,i) => (
                <div key={i} style={{background:"#fafbfc",borderRadius:10,padding:20,marginBottom:36,border:"1px solid #eee"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:15}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#2563eb",fontSize:16}}>{driver.initials}</div>
                      <div>
                        <div style={{fontWeight:"bold",fontSize:15,color:"#111"}}>{driver.name}</div>
                        <div style={{fontSize:13,color:"#888"}}>{driver.period}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{color:"#222",fontSize:18,fontWeight:"bold",display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                        <StarIcon /> {driver.rating}/5.0
                      </div>
                      <div style={{color:"#2563eb",fontSize:13}}>{driver.usersServed} OKU users served</div>
                    </div>
                  </div>
                  <div style={{marginTop:20,background:"#f6f8fa",borderRadius:8,padding:"18px 20px"}}>
                    <div style={{fontWeight:"bold",marginBottom:7}}>Feedback Summary:</div>
                    <ul style={{margin:0,paddingLeft:20,color:"#444",fontSize:15}}>
                      {driver.feedback.map((f,j) => (
                        <li key={j} style={{marginBottom:2}}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "reports" && (
            <div style={{margin:"0 32px"}}>
              <div style={{fontWeight:"bold",fontSize:22,marginBottom:24,color:"#2563eb"}}>Monthly Reports & Analytics</div>
              <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
                {/* Service Utilization */}
                <div style={{flex:"1 1 260px",background:"#fafbfc",borderRadius:10,padding:24,border:"1px solid #eee"}}>
                  <div style={{fontWeight:"bold",fontSize:16,marginBottom:8}}>Service Utilization</div>
                  {utilization.map((u,i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:15}}>
                      <span>{u.label}</span>
                      <span>{u.value}</span>
                    </div>
                  ))}
                </div>
                {/* Monthly Budget Usage */}
                <div style={{flex:"1 1 260px",background:"#fafbfc",borderRadius:10,padding:24,border:"1px solid #eee"}}>
                  <div style={{fontWeight:"bold",fontSize:16,marginBottom:8}}>Monthly Budget Usage</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:15}}>
                    <span>Budget allocated</span>
                    <span>{budget.allocated}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:15}}>
                    <span>Used this month</span>
                    <span>{budget.used}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:15}}>
                    <span>Remaining</span>
                    <span style={{color:"#16a34a",fontWeight:"bold"}}>{budget.remaining}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}