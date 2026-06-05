import { useState, useEffect } from 'react';
import { 
  Anchor, 
  LayoutDashboard, 
  MapPin, 
  Clock, 
  ListTodo, 
  History, 
  Calculator,
  Ship
} from 'lucide-react';
import type { PortCall, Berth } from './types';

// Component Imports
import Dashboard from './components/Dashboard';
import BerthPlanner from './components/BerthPlanner';
import Timeline from './components/Timeline';
import OperationsBoard from './components/OperationsBoard';
import StatementOfFacts from './components/StatementOfFacts';
import LaytimeCalculator from './components/LaytimeCalculator';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [portCalls, setPortCalls] = useState<PortCall[]>([]);
  const [berths, setBerths] = useState<Berth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPortCallId, setSelectedPortCallId] = useState<string>('pc-1');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toISOString());

  const fetchAllData = async () => {
    try {
      const [pcRes, bRes] = await Promise.all([
        fetch('http://localhost:3001/api/portcalls'),
        fetch('http://localhost:3001/api/berths')
      ]);
      if (!pcRes.ok || !bRes.ok) throw new Error('Failed to fetch data');
      
      const pcData = await pcRes.json();
      const bData = await bRes.json();
      
      setPortCalls(pcData);
      setBerths(bData);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch from backend REST API
  useEffect(() => {
    fetchAllData();
  }, []);

  // Keep simulated time updated
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedPortCall = portCalls.find(pc => pc.id === selectedPortCallId) || portCalls[0];

  // Global State Handlers
  const handleAddSOFEvent = async (portCallId: string, description: string, category: any, laytimeImpact: any, loggedBy: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/portcalls/${portCallId}/sof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, loggedBy, laytimeImpact })
      });
      if (!response.ok) throw new Error('Failed to add SOF event');
      const newEvent = await response.json();
      
      setPortCalls(prev => prev.map(pc => {
        if (pc.id !== portCallId) return pc;
        return {
          ...pc,
          sofEvents: [newEvent, ...pc.sofEvents]
        };
      }));
    } catch (error) {
      console.error('Error adding SOF event:', error);
      alert('Error communicating with backend. Action not persisted.');
    }
  };

  const handleDeleteSOFEvent = async (portCallId: string, eventId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/portcalls/${portCallId}/sof/${eventId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete SOF event');
      
      setPortCalls(prev => prev.map(pc => {
        if (pc.id !== portCallId) return pc;
        return {
          ...pc,
          sofEvents: pc.sofEvents.filter(e => e.id !== eventId)
        };
      }));
    } catch (error) {
      console.error('Error deleting SOF event:', error);
      alert('Error communicating with backend. Action not persisted.');
    }
  };

  const handleUpdateServiceStatus = async (portCallId: string, serviceId: string, newStatus: any, notes?: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/portcalls/${portCallId}/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes })
      });
      if (!response.ok) throw new Error('Failed to update service status');
      const updatedService = await response.json();
      
      setPortCalls(prev => prev.map(pc => {
        if (pc.id !== portCallId) return pc;
        return {
          ...pc,
          services: pc.services.map(s => s.id === serviceId ? updatedService : s)
        };
      }));
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Error communicating with backend. Action not persisted.');
    }
  };

  const handleAssignBerth = async (portCallId: string, newBerthId: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/api/portcalls/${portCallId}/assign-berth`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ berthId: newBerthId || null })
      });
      if (!response.ok) throw new Error('Failed to assign berth');
      
      setPortCalls(prev => prev.map(pc => {
        if (pc.id === portCallId) {
          return { ...pc, berthId: newBerthId };
        }
        return pc;
      }));

      setBerths(prev => prev.map(b => {
        if (b.occupiedVesselId === portCallId && b.id !== newBerthId) {
          return { ...b, occupiedVesselId: undefined };
        }
        if (b.id === newBerthId) {
          return { ...b, occupiedVesselId: portCallId };
        }
        return b;
      }));
    } catch (error) {
      console.error('Error assigning berth:', error);
      alert('Error communicating with backend. Action not persisted.');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all port calls and berths to initial demo states?')) return;
    try {
      const response = await fetch('http://localhost:3001/api/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reset database');
      await fetchAllData();
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Error communicating with backend.');
    }
  };

  const formatHeaderTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="beacon" style={{ display: 'inline-block', width: '20px', height: '20px', marginBottom: '16px' }}></div>
          <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>Loading DockFlow Pro Systems...</h2>
        </div>
      </div>
    );
  }

  if (portCalls.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="beacon" style={{ margin: '0 auto 16px auto', background: 'var(--red-alert)', boxShadow: '0 0 12px var(--red-alert)' }}></div>
          <h2 style={{ color: 'var(--red-alert)', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>Database Connection Offline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            The port operations backend database is currently unreachable. Make sure the server on port 3001 is active.
          </p>
          <button 
            className="action-btn" 
            onClick={() => {
              setLoading(true);
              fetchAllData();
            }}
            style={{ width: '100%', padding: '10px' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Anchor size={22} className="teal-glow" />
            <span>DOCKFLOW PRO</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Operations Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'berth' ? 'active' : ''}`}
            onClick={() => setActiveTab('berth')}
          >
            <MapPin size={18} />
            <span>Berth Planner</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <Clock size={18} />
            <span>Service Timeline</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'ops-board' ? 'active' : ''}`}
            onClick={() => setActiveTab('ops-board')}
          >
            <ListTodo size={18} />
            <span>Operations Board</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'sof' ? 'active' : ''}`}
            onClick={() => setActiveTab('sof')}
          >
            <History size={18} />
            <span>Statement of Facts</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={18} />
            <span>Laytime & Demurrage</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div>Agent Session Active</div>
          <div style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>UTC 2026-06-04</div>
          <button 
            onClick={handleResetData}
            style={{
              marginTop: '12px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--red-alert)',
              fontSize: '0.75rem',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Mock Data
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="app-main">
        {/* Universal Top Header */}
        <header className="app-header">
          <div className="header-title-wrapper">
            <h1>
              {activeTab === 'dashboard' && 'Port Overview'}
              {activeTab === 'berth' && 'Interactive Berth Planner'}
              {activeTab === 'timeline' && 'Port Service Gantt Timeline'}
              {activeTab === 'ops-board' && 'Service Orchestration Board'}
              {activeTab === 'sof' && 'Statement of Facts Log'}
              {activeTab === 'calculator' && 'Laytime & Demurrage Calculator'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Real-time harbor occupancy, vessel states, and weather conditions.'}
              {activeTab === 'berth' && 'Manage marine terminal occupancy and verify vessel berth safety rules.'}
              {activeTab === 'timeline' && 'Visual scheduling and overlap detection of harbor tugs, pilots, and bunkering.'}
              {activeTab === 'ops-board' && `Task routing and status dispatcher for ${selectedPortCall?.vessel?.name || 'Vessel'}.`}
              {activeTab === 'sof' && `Record critical port-call event timestamps for ${selectedPortCall?.vessel?.name || 'Vessel'}.`}
              {activeTab === 'calculator' && `Compile demurrage statements for ${selectedPortCall?.vessel?.name || 'Vessel'} using logged SOF.`}
            </p>
          </div>

          <div className="header-meta">
            {/* Active Vessel Selector for detail pages */}
            {['ops-board', 'sof', 'calculator'].includes(activeTab) && selectedPortCall && (
              <div className="d-flex align-center gap-8" style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <Ship size={16} className="text-muted" />
                <select 
                  value={selectedPortCallId} 
                  onChange={(e) => setSelectedPortCallId(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    outline: 'none',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  {portCalls.map(pc => (
                    <option key={pc.id} value={pc.id} style={{ background: 'var(--bg-main)' }}>
                      {pc.vessel?.name || 'Vessel'} ({pc.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="telemetry-hud">
              <div className="hud-item">
                <span style={{ color: 'var(--text-dim)' }}>PORT:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>51.924° N, 4.477° E</span>
              </div>
              <div className="hud-divider"></div>
              <div className="hud-item">
                <span style={{ color: 'var(--text-dim)' }}>VHF:</span>
                <span style={{ color: 'var(--teal-glow)', fontWeight: 600 }}>CH 12</span>
              </div>
              <div className="hud-divider"></div>
              <div className="hud-item">
                <span style={{ color: 'var(--text-dim)' }}>TIDE:</span>
                <span style={{ color: 'var(--green-emerald)', fontWeight: 600 }}>+1.4m Flood</span>
              </div>
            </div>

            <div className="live-status">
              <span className="beacon"></span>
              <span>LIVE: {formatHeaderTime(currentTime)}</span>
            </div>
          </div>
        </header>

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            portCalls={portCalls} 
            berths={berths} 
            onViewDetails={(id, view) => {
              setSelectedPortCallId(id);
              setActiveTab(view);
            }} 
          />
        )}
        
        {activeTab === 'berth' && (
          <BerthPlanner 
            portCalls={portCalls} 
            berths={berths} 
            onAssignBerth={handleAssignBerth} 
          />
        )}
        
        {activeTab === 'timeline' && (
          <Timeline 
            portCalls={portCalls} 
          />
        )}
        
        {activeTab === 'ops-board' && selectedPortCall && (
          <OperationsBoard 
            key={selectedPortCall.id}
            portCall={selectedPortCall} 
            onUpdateServiceStatus={handleUpdateServiceStatus} 
          />
        )}
        
        {activeTab === 'sof' && selectedPortCall && (
          <StatementOfFacts 
            key={selectedPortCall.id}
            portCall={selectedPortCall} 
            onAddSOFEvent={handleAddSOFEvent}
            onDeleteSOFEvent={handleDeleteSOFEvent}
          />
        )}
        
        {activeTab === 'calculator' && selectedPortCall && (
          <LaytimeCalculator 
            key={selectedPortCall.id}
            portCall={selectedPortCall} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
