import React, { useState } from "react";

// SVG Icons (no dependencies)
const PeopleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM2 16v-1a4 4 0 014-4h8a4 4 0 014 4v1" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 7a2 2 0 110-4 2 2 0 010 4zM17.5 12.5a3.5 3.5 0 00-5.2 0" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const CarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="16" height="7" rx="2" stroke="#22c55e" strokeWidth="1.5"/><path d="M4 11V8a2 2 0 012-2h8a2 2 0 012 2v3" stroke="#22c55e" strokeWidth="1.5"/><circle cx="5.5" cy="16.5" r="1.5" fill="#22c55e"/><circle cx="14.5" cy="16.5" r="1.5" fill="#22c55e"/></svg>
);
const LocationIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M10 18s-6-5.686-6-10A6 6 0 0110 2a6 6 0 016 6c0 4.314-6 10-6 10z" stroke="#7c3aed" strokeWidth="1.5"/><circle cx="10" cy="8" r="2" stroke="#7c3aed" strokeWidth="1.5"/></svg>
);
const MoneyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 20 20" fill="none"><path d="M16 5V4a2 2 0 00-2-2H6a2 2 0 00-2 2v1" stroke="#fb923c" strokeWidth="1.5"/><rect x="3" y="5" width="14" height="11" rx="2" stroke="#fb923c" strokeWidth="1.5"/><text x="10" y="14" textAnchor="middle" fontSize="10" fill="#fb923c" fontWeight="bold">$</text></svg>
);

export default function CompanyAdminDashboard() {
  const [showDetails, setShowDetails] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const stats = [
    { label: "Total Drivers", value: 45, icon: <PeopleIcon /> },
    { label: "Active Services", value: 89, icon: <CarIcon /> },
    { label: "Monthly Trips", value: "1,256", icon: <LocationIcon /> },
    { label: "Monthly Revenue", value: "RM 45,000", icon: <MoneyIcon /> },
  ];
  // Demo - only show drivers that have signed in (e.g., one)
  const drivers = [
    {
      initials: "SA",
      name: "Siti Aminah",
      email: "siti@email.com",
      users: 3,
      rating: 4.8,
      status: "Active"
    }
  ];

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 0 }}>
      {/* MODALS */}
      {showDetails && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:10,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:32,width:350,maxWidth:"90%",position:"relative"}}>
            <button onClick={()=>setShowDetails(false)} style={{position:"absolute",right:20,top:15,background:"none",border:"none",fontSize:24,color:"#bbb"}}>×</button>
            <div style={{fontWeight:"bold",fontSize:20,marginBottom:20,color:"#2563eb"}}>Driver Details</div>
            <div style={{marginBottom:24}}>
              <div style={{fontWeight:"bold"}}>Siti Aminah</div>
              <div>Email: <span style={{color:"#888"}}>siti@email.com</span></div>
              <div>Assigned Users: <span style={{color:"#444"}}>3</span></div>
              <div>Rating: <span style={{color:"#fb923c"}}>4.8</span></div>
              <div>Status: <span style={{color:"#16a34a"}}>Active</span></div>
            </div>
            <button onClick={()=>setShowDetails(false)} style={{width:"100%",background:"#2563eb",color:"#fff",padding:"12px 0",borderRadius:8,fontWeight:"bold",border:"none"}}>Close</button>
          </div>
        </div>
      )}
      {showManage && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:10,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:12,padding:32,width:350,maxWidth:"90%",position:"relative"}}>
            <button onClick={()=>setShowManage(false)} style={{position:"absolute",right:20,top:15,background:"none",border:"none",fontSize:24,color:"#bbb"}}>×</button>
            <div style={{fontWeight:"bold",fontSize:20,marginBottom:20,color:"#fb923c"}}>Manage Driver</div>
            <div style={{marginBottom:24}}>
              <div style={{marginBottom:12}}>Actions for <span style={{fontWeight:"bold"}}>Siti Aminah</span>:</div>
              <button disabled style={{width:"100%",background:"#f1f5f9",color:"#aaa",padding:"10px 0",borderRadius:8,marginBottom:6,border:"none"}}>Assign User (Demo Only)</button>
              <button disabled style={{width:"100%",background:"#f1f5f9",color:"#aaa",padding:"10px 0",borderRadius:8,border:"none"}}>Suspend Driver (Demo Only)</button>
            </div>
            <button onClick={()=>setShowManage(false)} style={{width:"100%",background:"#fb923c",color:"#fff",padding:"12px 0",borderRadius:8,fontWeight:"bold",border:"none"}}>Close</button>
          </div>
        </div>
      )}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 0"}}>
        {/* HEADER */}
        <h2 style={{fontWeight:"bold",fontSize:32,margin:"32px 0 32px 40px",color:"#111",letterSpacing:"-1px"}}>Company Administrator Dashboard</h2>
        {/* STATS */}
        <div style={{display:"flex",gap:24,marginBottom:40,justifyContent:"flex-start",flexWrap:"wrap",marginLeft:40}}>
          {stats.map((s,i) => (
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
                marginBottom:8
              }}
            >
              <div style={{fontSize:15,color:"#888",marginBottom:8,display:"flex",alignItems:"center",gap:9}}>{s.label}</div>
              <div style={{fontWeight:"bold",fontSize:28,color:"#111",letterSpacing:"-1px",marginBottom:8}}>{s.value}</div>
              <div style={{position:"absolute",right:30,top:24}}>{s.icon}</div>
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
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>ASSIGNED USERS</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>RATING</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>STATUS</th>
                <th style={{padding:"16px 0 12px 0",fontWeight:500}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d, i) => (
                <tr key={i} style={{borderTop:"1px solid #f0f0f0",background:"#fff"}}>
                  <td style={{padding:"18px 0 14px 48px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",color:"#2563eb",fontSize:15}}>{d.initials}</div>
                    <div>
                      <div style={{fontWeight:"bold",fontSize:15,color:"#222"}}>{d.name}</div>
                      <div style={{color:"#888",fontSize:13}}>{d.email}</div>
                    </div>
                  </td>
                  <td style={{padding:"18px 0 14px 0",fontSize:15,color:"#333"}}>{d.users} users</td>
                  <td style={{padding:"18px 0 14px 0",display:"flex",alignItems:"center",gap:4,fontSize:15}}>
                    <svg width={18} height={18} fill="#fbbf24" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {d.rating}
                  </td>
                  <td style={{padding:"18px 0 14px 0"}}>
                    <span style={{background:"#bbf7d0",color:"#16a34a",padding:"3px 18px",borderRadius:16,fontSize:14,fontWeight:500}}>Active</span>
                  </td>
                  <td style={{padding:"18px 0 14px 0"}}>
                    <button
                      onClick={()=>setShowDetails(true)}
                      style={{color:"#2563eb",background:"none",border:"none",fontWeight:500,fontSize:15,cursor:"pointer",marginRight:20}}
                    >View Details</button>
                    <button
                      onClick={()=>setShowManage(true)}
                      style={{color:"#fb923c",background:"none",border:"none",fontWeight:500,fontSize:15,cursor:"pointer"}}
                    >Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}