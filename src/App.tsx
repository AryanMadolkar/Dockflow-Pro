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
import { mockPortCalls, mockBerths } from './utils/mockData';

// Component Imports
import Dashboard from './components/Dashboard';
import BerthPlanner from './components/BerthPlanner';
import Timeline from './components/Timeline';
import OperationsBoard from './components/OperationsBoard';
import StatementOfFacts from './components/StatementOfFacts';
import LaytimeCalculator from './components/LaytimeCalculator';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [portCalls, setPortCalls] = useState<PortCall[]>(() => {
    const local = localStorage.getItem('portcall_pro_calls');
    return local ? JSON.parse(local) : mockPortCalls;
  });
  const [berths, setBerths] = useState<Berth[]>(() => {
    const local = localStorage.getItem('portcall_pro_berths');
    return local ? JSON.parse(local) : mockBerths;
  });
  const [selectedPortCallId, setSelectedPortCallId] = useState<string>('pc-1');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toISOString());

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('portcall_pro_calls', JSON.stringify(portCalls));
  }, [portCalls]);

  useEffect(() => {
    localStorage.setItem('portcall_pro_berths', JSON.stringify(berths));
  }, [berths]);

  // Keep simulated time updated
  useEffect(() => {
    const interval = setInterval(() => {
      // Small drift to show active system, or keep current time
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedPortCall = portCalls.find(pc => pc.id === selectedPortCallId) || portCalls[0];

  // Global State Handlers
  const handleAddSOFEvent = (portCallId: string, description: string, category: any, laytimeImpact: any, loggedBy: string) => {
    setPortCalls(prev => prev.map(pc => {
      if (pc.id !== portCallId) return pc;
      const newEvent = {
        id: `sof-${portCallId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        description,
        category,
        loggedBy,
        isDelay: category === 'Delay',
        delayReason: category === 'Delay' ? description : undefined,
        laytimeImpact
      };
      return {
        ...pc,
        sofEvents: [newEvent, ...pc.sofEvents]
      };
    }));
  };

  const handleDeleteSOFEvent = (portCallId: string, eventId: string) => {
    setPortCalls(prev => prev.map(pc => {
      if (pc.id !== portCallId) return pc;
      return {
        ...pc,
        sofEvents: pc.sofEvents.filter(e => e.id !== eventId)
      };
    }));
  };

  const handleUpdateServiceStatus = (portCallId: string, serviceId: string, newStatus: any, notes?: string) => {
    setPortCalls(prev => prev.map(pc => {
      if (pc.id !== portCallId) return pc;
      const updatedServices = pc.services.map(s => {
        if (s.id !== serviceId) return s;
        const now = new Date().toISOString();
        return {
          ...s,
          status: newStatus,
          actualStartTime: newStatus === 'Active' && !s.actualStartTime ? now : s.actualStartTime,
          actualEndTime: newStatus === 'Completed' && !s.actualEndTime ? now : s.actualEndTime,
          notes: notes !== undefined ? notes : s.notes
        };
      });
      return {
        ...pc,
        services: updatedServices
      };
    }));
  };

  const handleAssignBerth = (portCallId: string, newBerthId: string | undefined) => {
    // 1. Update PortCalls
    setPortCalls(prev => prev.map(pc => {
      if (pc.id === portCallId) {
        return { ...pc, berthId: newBerthId };
      }
      return pc;
    }));

    // 2. Update Berths occupation state
    setBerths(prev => prev.map(b => {
      // Free old berth
      if (b.occupiedVesselId === portCallId && b.id !== newBerthId) {
        return { ...b, occupiedVesselId: undefined };
      }
      // Occupy new berth
      if (b.id === newBerthId) {
        return { ...b, occupiedVesselId: portCallId };
      }
      return b;
    }));
  };

  const handleResetData = () => {
    localStorage.removeItem('portcall_pro_calls');
    localStorage.removeItem('portcall_pro_berths');
    setPortCalls(mockPortCalls);
    setBerths(mockBerths);
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
              {activeTab === 'ops-board' && `Task routing and status dispatcher for ${selectedPortCall.vessel.name}.`}
              {activeTab === 'sof' && `Record critical port-call event timestamps for ${selectedPortCall.vessel.name}.`}
              {activeTab === 'calculator' && `Compile demurrage statements for ${selectedPortCall.vessel.name} using logged SOF.`}
            </p>
          </div>

          <div className="header-meta">
            {/* Active Vessel Selector for detail pages */}
            {['ops-board', 'sof', 'calculator'].includes(activeTab) && (
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
                      {pc.vessel.name} ({pc.status})
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
        
        {activeTab === 'ops-board' && (
          <OperationsBoard 
            key={selectedPortCall.id}
            portCall={selectedPortCall} 
            onUpdateServiceStatus={handleUpdateServiceStatus} 
          />
        )}
        
        {activeTab === 'sof' && (
          <StatementOfFacts 
            key={selectedPortCall.id}
            portCall={selectedPortCall} 
            onAddSOFEvent={handleAddSOFEvent}
            onDeleteSOFEvent={handleDeleteSOFEvent}
          />
        )}
        
        {activeTab === 'calculator' && (
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
