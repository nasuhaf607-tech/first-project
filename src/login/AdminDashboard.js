import React, { useState, useEffect } from 'react';

// SVG Icons (no dependencies)
const PeopleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM2 16v-1a4 4 0 014-4h8a4 4 0 014 4v1" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 7a2 2 0 110-4 2 2 0 010 4zM17.5 12.5a3.5 3.5 0 00-5.2 0" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const CarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="10" width="16" height="7" rx="2" stroke="#22c55e" strokeWidth="1.5"/>
    <path d="M4 11V8a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#22c55e" strokeWidth="1.5"/>
    <circle cx="5.5" cy="16.5" r="1.5" fill="#22c55e"/>
    <circle cx="14.5" cy="16.5" r="1.5" fill="#22c55e"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <path d="M10 18s-6-5.686-6-10A6 6 0 0110 2a6 6 0 016 6c0 4.314-6 10-6 10z" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="10" cy="8" r="2" stroke="#7c3aed" strokeWidth="1.5"/>
  </svg>
);
const MoneyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
    <path d="M16 5V4a2 2 0 00-2-2H6a2 2 0 00-2 2v1" stroke="#fb923c" strokeWidth="1.5"/>
    <rect x="3" y="5" width="14" height="11" rx="2" stroke="#fb923c" strokeWidth="1.5"/>
    <text x="10" y="14" textAnchor="middle" fontSize="10" fill="#fb923c" fontWeight="bold">$</text>
  </svg>
);

export default function AdminDashboard() {
  const [showDetails, setShowDetails] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  // Load drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Fetch drivers from backend
  const fetchDrivers = async () => {
    try {
      console.log("Fetching drivers from backend...");
      const response = await fetch("http://localhost/first-project/backend/getDrivers.php");
      const data = await response.json();
      console.log("Fetched drivers data:", data);
      
      if (data.status === "success") {
        setPendingDrivers(data.pending || []);
        setApprovedDrivers(data.approved || []);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Handle driver approval/rejection
  const handleDriverAction = async (driverEmail, action) => {
    try {
      const response = await fetch("http://localhost/first-project/backend/approveDriver.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverEmail, action })
      });
      
      const data = await response.json();
      if (data.status === "success") {
        fetchDrivers(); // Refresh drivers list
        alert(`Driver ${action} successfully! Email notification attempted. Check email_notifications.log for details.`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating driver status:", error);
      alert("Error updating driver status");
    }
  };

  // Handle driver status reset (back to pending)
  const handleDriverReset = async (driverEmail) => {
    const confirmed = window.confirm("Are you sure you want to reset this driver's status back to pending? This will allow them to be reviewed again.");
    if (confirmed) {
      try {
        const response = await fetch("http://localhost/first-project/backend/approveDriver.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverEmail, action: 'pending' })
        });
        
        const data = await response.json();
        if (data.status === "success") {
          fetchDrivers(); // Refresh drivers list
          alert("Driver status reset to pending successfully!");
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error resetting driver status:", error);
        alert("Error resetting driver status");
      }
    }
  };

  // View driver details
  const viewDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };


  const stats = [
    { label: "Total Drivers", value: pendingDrivers.length + approvedDrivers.length, icon: <PeopleIcon /> },
    { label: "Pending Approval", value: pendingDrivers.length, icon: <CarIcon /> },
    { label: "Approved Drivers", value: approvedDrivers.length, icon: <LocationIcon /> },
    { label: "Active Services", value: approvedDrivers.length, icon: <MoneyIcon /> },
  ];

  // Combine pending and approved drivers for display
  const allDrivers = [
    ...pendingDrivers.map(driver => ({ ...driver, status: 'Pending' })),
    ...approvedDrivers.map(driver => ({ ...driver, status: 'Approved' }))
  ];

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 0 }}>
      {/* ✅ Banner/Header */}
      <header className="bg-blue-700 text-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="px-6 py-4 flex justify-between items-center">
          {/* Title */}
          <h1 className="text-2xl font-bold">OKU Transport Service</h1>
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchDrivers}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              🔄 Refresh
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
              P
            </div>
          </div>
        </div>
      </header>

      {/* Add top padding so content isn't hidden behind fixed banner */}
      <div style={{ paddingTop: "90px", maxWidth: 1200, margin: "0 auto" }}>
        {/* HEADER */}
        <h2 style={{fontWeight:"bold",fontSize:32,margin:"32px 0 32px 40px",color:"#111",letterSpacing:"-1px"}}>
          Company Administrator Dashboard
        </h2>

        {/* STATS */}
        <div style={{display:"flex",gap:24,marginBottom:40,justifyContent:"flex-start",flexWrap:"wrap",marginLeft:40}}>
          {stats.map((s) => (
            <div key={s.label}
              style={{
                background:"#fff",
                borderRadius:16,
                boxShadow:"0 4px 16px #eee",
                padding:"24px 32px",
                display:"flex",
                flexDirection:"column",
                alignItems:"flex-start",
                minWidth:230,
                marginBottom:8,
                position:"relative"
              }}
            >
              <div style={{fontSize:15,color:"#888",marginBottom:8,display:"flex",alignItems:"center",gap:9}}>{s.label}</div>
              <div style={{fontWeight:"bold",fontSize:28,color:"#111",letterSpacing:"-1px",marginBottom:8}}>{s.value}</div>
              <div style={{marginTop:-44,marginLeft:"auto"}}>{s.icon}</div>
            </div>
          ))}
        </div>

        {/* DRIVER MANAGEMENT */}
        <div style={{background:"#fff",borderRadius:16,boxShadow:"0 4px 16px #eee",padding:"32px 0 16px 0",margin:"0 40px 40px 40px"}}>
          <div style={{fontWeight:"bold",fontSize:20,margin:"0 0 24px 48px"}}>Driver Management</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{color:"#888",fontSize:14,textAlign:"left",background:"#fafbfc"}}>
                <th style={{padding:"16px 0 12px 48px",fontWeight:500}}>DRIVER</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>EMAIL</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>PHONE</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>STATUS</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {allDrivers.map((d, i) => (
                <tr key={i} style={{borderTop:"1px solid #f0f0f0",background:"#fff"}}>
                  <td style={{padding:"18px 0 14px 48px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#2563eb",fontSize:15}}>
                      {d.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight:"bold",fontSize:15,color:"#222"}}>{d.name}</div>
                      <div style={{color:"#888",fontSize:13}}>{d.vehicleType} - {d.vehicleNumber}</div>
                    </div>
                  </td>
                  <td style={{padding:"18px 0 14px 0",fontSize:15,color:"#333"}}>{d.email}</td>
                  <td style={{padding:"18px 0 14px 0",fontSize:15,color:"#333"}}>{d.phone}</td>
                  <td style={{padding:"18px 0 14px 0"}}>
                    <span style={{
                      background: d.status === 'Approved' ? "#bbf7d0" : "#fef3c7",
                      color: d.status === 'Approved' ? "#16a34a" : "#d97706",
                      padding:"3px 18px",
                      borderRadius:16,
                      fontSize:14,
                      fontWeight:500
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{padding:"18px 0 14px 0"}}>
                    <button
                      onClick={()=>viewDriverDetails(d)}
                      style={{color:"#2563eb",background:"none",border:"none",fontWeight:500,fontSize:15,cursor:"pointer",marginRight:20}}
                    >View Details</button>
                    {d.status === 'Pending' && (
                      <>
                        <button
                          onClick={()=>handleDriverAction(d.email, 'approved')}
                          style={{color:"#16a34a",background:"none",border:"none",fontWeight:500,fontSize:15,cursor:"pointer",marginRight:10}}
                        >Approve</button>
                        <button
                          onClick={()=>handleDriverAction(d.email, 'rejected')}
                          style={{color:"#dc2626",background:"none",border:"none",fontWeight:500,fontSize:15,cursor:"pointer",marginRight:10}}
                        >Reject</button>
                      </>
                    )}
                    {(d.status === 'Approved' || d.status === 'Rejected') && (
                      <button
                        onClick={()=>handleDriverReset(d.email)}
                        style={{color:"#f59e0b",background:"none",border:"none",fontWeight:500,fontSize:15,cursor:"pointer"}}
                      >Reset</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Details Modal */}
      {showDriverModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Driver Details</h2>
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedDriver.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedDriver.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedDriver.phone}</div>
                    <div><span className="font-medium">IC Number:</span> {selectedDriver.icNumber}</div>
                    <div><span className="font-medium">Address:</span> {selectedDriver.address}</div>
                  </div>
                </div>

                {/* Driver Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Driver Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">License Number:</span> {selectedDriver.licenseNumber}</div>
                    <div><span className="font-medium">Experience:</span> {selectedDriver.experience}</div>
                    <div><span className="font-medium">Languages:</span> {selectedDriver.languages}</div>
                    <div><span className="font-medium">Availability:</span> {selectedDriver.availability}</div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Vehicle Type:</span> {selectedDriver.vehicleType}</div>
                    <div><span className="font-medium">Vehicle Number:</span> {selectedDriver.vehicleNumber}</div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Contact Name:</span> {selectedDriver.emergencyContact}</div>
                    <div><span className="font-medium">Contact Phone:</span> {selectedDriver.emergencyPhone}</div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedDriver.icPhoto && (
                    <div className="text-center">
                      <h4 className="font-medium mb-2">IC Photo</h4>
                      <img 
                        src={`http://localhost/first-project/uploads/${selectedDriver.icPhoto}`} 
                        alt="IC" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedDriver.selfiePhoto && (
                    <div className="text-center">
                      <h4 className="font-medium mb-2">Selfie</h4>
                      <img 
                        src={`http://localhost/first-project/uploads/${selectedDriver.selfiePhoto}`} 
                        alt="Selfie" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedDriver.licensePhoto && (
                    <div className="text-center">
                      <h4 className="font-medium mb-2">License</h4>
                      <img 
                        src={`http://localhost/first-project/uploads/${selectedDriver.licensePhoto}`} 
                        alt="License" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedDriver.vehiclePhoto && (
                    <div className="text-center">
                      <h4 className="font-medium mb-2">Vehicle</h4>
                      <img 
                        src={`http://localhost/first-project/uploads/${selectedDriver.vehiclePhoto}`} 
                        alt="Vehicle" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedDriver.status === 'Pending' && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      handleDriverAction(selectedDriver.email, 'rejected');
                      setShowDriverModal(false);
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleDriverAction(selectedDriver.email, 'approved');
                      setShowDriverModal(false);
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              )}
              {(selectedDriver.status === 'Approved' || selectedDriver.status === 'Rejected') && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      handleDriverReset(selectedDriver.email);
                      setShowDriverModal(false);
                    }}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
                  >
                    Reset to Pending
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}