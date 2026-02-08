import React, { useState } from 'react';
import { creditStore, listStore } from './useDegreeStatus';

function App() {
  const [isUploading, setIsUploading] = useState(false);

  const totalCredits = creditStore["Total Credits"];
  const completedList = listStore["completed"]?.missing || [];
  const inProgressList = listStore["in-progress"]?.missing || [];
  const stillNeedingList = listStore["still-needing"]?.missing || [];
  const requirements = Object.keys(creditStore).filter(key => key !== "Total Credits");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', { 
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
        alert("Transcript parsed! Data updated.");
      }
    } catch (error) {
      console.error("Connection to Python backend failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        background: 'white',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        {}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Total Progress</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCredits?.completed || 0} / {totalCredits?.required || 120}</span>
            <div style={{ flex: 1, maxWidth: '300px', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${((totalCredits?.completed || 0) / (totalCredits?.required || 120)) * 100}%`, 
                height: '100%', background: '#3b82f6', transition: 'width 1s ease' 
              }} />
            </div>
          </div>
        </div>

        {}
        <div style={{ 
          border: '2px dashed #cbd5e1', 
          borderRadius: '12px', 
          padding: '10px 20px', 
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}>
          <label style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {isUploading ? "Processing..." : "↑ Upload Transcript"}
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.json" />
          </label>
        </div>
      </header>

      {}
<section style={{ marginBottom: '40px' }}>
  <div style={{ 
    display: 'flex', 
    overflowX: 'auto', 
    gap: '20px', 
    paddingBottom: '15px', 
    scrollSnapType: 'x mandatory' 
  }}>
    {requirements.map(name => {
      const data = creditStore[name];
      const done = (data.completed / data.required) * 100;
      const ip = (data.inProgress / data.required) * 100;
      
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
          {}
          <div style={{ 
            width: '85px', 
            height: '85px', 
            borderRadius: '50%', 
            marginRight: '20px', 
            flexShrink: 0,
            background: `conic-gradient(#10b981 0% ${done}%, #f59e0b ${done}% ${done + ip}%, #e2e8f0 ${done + ip}% 100%)` 
          }} />
          
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{name}</h4>
            
            {}
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>{data.completed}</span>
              <span style={{ color: '#94a3b8' }}> / {data.required}</span> Credits
            </div>

            {}
            {data.inProgress > 0 && (
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 500, marginTop: '2px' }}>
                + {data.inProgress} In Progress
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
</section>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Card title="Completed" color="#059669" list={completedList} icon="✅" />
        <Card title="In Progress" color="#d97706" list={inProgressList} icon="⏳" />
        <Card title="Still Needing" color="#dc2626" list={stillNeedingList} icon="🚩" />
      </div>
    </div>
  );
}

const Card = ({ title, color, list, icon }: any) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', borderTop: `4px solid ${color}` }}>
    <h3 style={{ color: color, margin: '0 0 15px 0' }}>{icon} {title}</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {list.map((c: string) => <li key={c} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>{c}</li>)}
    </ul>
  </div>
);

export default App;