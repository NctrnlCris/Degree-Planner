import React, { useState } from 'react';
import { useDegreeStatus } from './useDegreeStatus';
import { GrCheckmark } from "react-icons/gr";
import { GrInProgress } from "react-icons/gr";
import { GrCircleAlert } from "react-icons/gr";
import { GrDocumentUpload } from "react-icons/gr";

function App() {
    // 1. Get reactive state and the update function from your hook
    const { creditStore, listStore, updateDashboard } = useDegreeStatus();
    const [isUploading, setIsUploading] = useState(false);

    // 2. DEFINE YOUR VARIABLES HERE (This fixes the "Cannot find name" errors)
    // We use optional chaining and empty fallbacks to prevent crashes
    const completedList = listStore["complete"]?.missing || listStore["completed"]?.missing || [];
    const inProgressList = listStore["inprogress"]?.missing || listStore["in-progress"]?.missing || [];
    const stillNeedingList = listStore["missing"]?.missing || listStore["still-needing"]?.missing || [];
    
    const allKeys = Object.keys(creditStore).filter(Boolean);
    const requirements = allKeys.filter(key => key !== "Total Credits");

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
      
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
      
        try {
          const response = await fetch('/api/upload', { 
            method: 'POST',
            body: formData,
          });
      
          if (response.ok) {
            const result = await response.json();
            
            // This tells the hook to update the stores, which triggers the UI refresh
            updateDashboard(result); 
            
            alert("Transcript parsed! Data updated.");
          } else {
            const err = await response.json().catch(() => ({}));
            alert("Server error: " + (err.error || response.statusText));
          }
        } catch (error) {
          console.error("Connection to Python backend failed:", error);
          alert("Could not connect to the Python backend. Is Flask running?");
        } finally {
          setIsUploading(false);
        }
    };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
    
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        background: 'linear-gradient(90deg, #000B72 50%, #2F4AAC 100%)',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontFamily: 'Roboto', fontWeight: 600 }}>UBC On Track</h2>
        <div style={{ 
          border: '2px dashed #cbd5e1', 
          borderRadius: '12px', 
          padding: '10px 20px', 
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}>
          <label style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>
            
            <GrDocumentUpload />
            {isUploading ? "Processing..." : "Upload Transcript"}

            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".xlsx, .xls, .csv" />
          </label>
        </div>
      </header>

      {/* Horizontal Scrolling Requirement Rings */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#64748b', textTransform: 'uppercase' }}>Requirement Progress</h3>
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '20px', 
          paddingBottom: '15px', 
          scrollSnapType: 'x mandatory' 
        }}>
          {requirements
            .filter(name => {
              const d = creditStore[name];
              return d && typeof d.required === 'number' && d.required > 0;
            })
            .map(name => {
              const data = creditStore[name];
              const required = data.required || 1;
              const done = ((data.completed || 0) / required) * 100;
              const ip = ((data.inProgress || 0) / required) * 100;
              return (
                <div key={name} style={{ 
                  flex: '0 0 380px', 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  scrollSnapAlign: 'start' 
                }}>
                  <div style={{ 
                    width: '85px', 
                    height: '85px', 
                    borderRadius: '50%', 
                    marginRight: '20px', 
                    flexShrink: 0,
                    background: `conic-gradient(#10b981 0% ${done}%, #E6BD39 ${done}% ${done + ip}%, #e2e8f0 ${done + ip}% 100%)` 
                  }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{name}</h4>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                      <span style={{ fontWeight: 'bold', color: '#0EDB0A' }}>{data.completed ?? 0}</span>
                      <span style={{ color: '#94a3b8' }}> / {data.required}</span> Credits
                    </div>
                    {(data.inProgress ?? 0) > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#E6BD39', fontWeight: 500, marginTop: '2px' }}>
                        + {data.inProgress} In Progress
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Grid of Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <CompleteCard title="Completed" color="#0EDB0A" list={completedList} />
        <InProgressCard title="In Progress" color="#E6BD39" list={inProgressList} />
        <StillNeedingCard title="Still Needing" color="#E63939" list={stillNeedingList} />
      </div>
    </div>
  );
}

const CompleteCard = ({ title, color, list }: any) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', borderTop: `4px solid ${color}` }}>
    <h3 style={{ color: color, margin: '0 0 0 0' }}> <GrCheckmark /> {title}</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {list.map((c: string, index: number) => (
        <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
          {c}
        </li>
      ))}
    </ul>
  </div>
);

const InProgressCard = ({ title, color, list }: any) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', borderTop: `4px solid ${color}` }}>
    <h3 style={{ color: color, margin: '0 0 0 0' }}> <img src="/images/complete.svg" alt="" /> <GrInProgress /> {title}</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {list.map((c: string, index: number) => (
        <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
          {c}
        </li>
      ))}
    </ul>
  </div>
);

const StillNeedingCard = ({ title, color, list }: any) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', borderTop: `4px solid ${color}` }}>
    <h3 style={{ color: color, margin: '0 0 0 0' }}> <img src="/images/complete.svg" alt="" /> <GrCircleAlert /> {title}</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {list.map((c: string, index: number) => (
        <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
          {c}
        </li>
      ))}
    </ul>
  </div>
);

export default App;