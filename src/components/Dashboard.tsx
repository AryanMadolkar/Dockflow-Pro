import { useState } from 'react';
import { 
  Ship, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  Wind, 
  Navigation,
  Search,
  History,
  Calculator
} from 'lucide-react';
import type { PortCall, Berth } from '../types';

interface DashboardProps {
  portCalls: PortCall[];
  berths: Berth[];
  onViewDetails: (id: string, view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ portCalls, berths, onViewDetails }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate Metrics
  const vesselsInPort = portCalls.filter(pc => pc.status !== 'Departed' && pc.status !== 'In Transit').length;
  const occupiedBerths = berths.filter(b => b.occupiedVesselId).length;
  const activeOps = portCalls.reduce((acc, pc) => {
    const activeServices = pc.services.filter(s => s.status === 'Active' || s.status === 'Mobilizing').length;
    return acc + activeServices;
  }, 0);
  const activeDelays = portCalls.reduce((acc, pc) => {
    const delays = pc.sofEvents.filter(e => e.isDelay).length;
    // Simple filter to show active delay items
    return acc + delays;
  }, 0);

  // Filter Port Calls
  const filteredPortCalls = portCalls.filter(pc => {
    const matchesSearch = pc.vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pc.cargoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pc.vessel.imo.includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'arrivals') return pc.status === 'In Transit' || pc.status === 'Anchored' || pc.status === 'Berthing';
    if (filter === 'cargo') return pc.status === 'Working Cargo';
    if (filter === 'departures') return pc.status === 'Departing' || pc.status === 'Departed';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Key Metrics Grid */}
      <section className="metrics-grid">
        <div className="container-card metric-card teal">
          <div className="metric-info">
            <h3>Vessels in Port</h3>
            <div className="metric-value">{vesselsInPort} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ {portCalls.length - 1} active</span></div>
          </div>
          <div className="metric-icon-wrapper">
            <Ship size={24} />
          </div>
        </div>

        <div className="container-card metric-card blue">
          <div className="metric-info">
            <h3>Berth Occupancy</h3>
            <div className="metric-value">{occupiedBerths} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ {berths.length} berths</span></div>
          </div>
          <div className="metric-icon-wrapper">
            <MapPin size={24} />
          </div>
        </div>

        <div className="container-card metric-card orange">
          <div className="metric-info">
            <h3>Active Services</h3>
            <div className="metric-value">{activeOps} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>ongoing</span></div>
          </div>
          <div className="metric-icon-wrapper">
            <Activity size={24} />
          </div>
        </div>

        <div className="container-card metric-card red">
          <div className="metric-info">
            <h3>Active Delays</h3>
            <div className="metric-value">{activeDelays} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>logged</span></div>
          </div>
          <div className="metric-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
        </div>
      </section>

      {/* Main Layout: Table + Sidebar Widgets */}
      <div className="dashboard-layout">
        {/* Left Side: Active Port Calls Table */}
        <section className="glass-panel dashboard-table-wrapper">
          <div className="table-header">
            <div className="d-flex align-center gap-16">
              <h2>Active Port Calls</h2>
              <div 
                className="d-flex align-center gap-8" 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '4px 10px', 
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)'
                }}
              >
                <Search size={14} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search vessel, cargo, IMO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            
            <div className="table-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'arrivals' ? 'active' : ''}`}
                onClick={() => setFilter('arrivals')}
              >
                Arrivals
              </button>
              <button 
                className={`filter-btn ${filter === 'cargo' ? 'active' : ''}`}
                onClick={() => setFilter('cargo')}
              >
                Cargo Ops
              </button>
              <button 
                className={`filter-btn ${filter === 'departures' ? 'active' : ''}`}
                onClick={() => setFilter('departures')}
              >
                Departed
              </button>
            </div>
          </div>

          <table className="vessel-table">
            <thead>
              <tr>
                <th>Vessel / IMO</th>
                <th>Type</th>
                <th>Status</th>
                <th>Berth Location</th>
                <th>Cargo Details</th>
                <th>Operational Progress</th>
                <th>Action Center</th>
              </tr>
            </thead>
            <tbody>
              {filteredPortCalls.map(pc => {
                const occupiedBerth = berths.find(b => b.id === pc.berthId);
                const cargoPercentage = Math.round((pc.cargoLoaded / pc.cargoTarget) * 100);

                return (
                  <tr key={pc.id}>
                    <td>
                      <div className="vessel-name-cell">
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pc.vessel.name}</span>
                        <span className="vessel-flag">{pc.vessel.flag} • IMO {pc.vessel.imo}</span>
                      </div>
                    </td>
                    <td>
                      <span className="vessel-type-badge">{pc.vessel.type}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${pc.status.toLowerCase().replace(' ', '-')}`}>
                        {pc.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-center gap-8" style={{ color: occupiedBerth ? 'var(--teal-glow)' : 'var(--text-muted)' }}>
                        <MapPin size={14} />
                        <span>{occupiedBerth ? occupiedBerth.name : 'Outer Anchorage'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vessel-name-cell">
                        <span>{pc.cargoQty.toLocaleString()} Tons</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pc.cargoType}</span>
                      </div>
                    </td>
                    <td>
                      {pc.status === 'Working Cargo' || pc.status === 'Departed' ? (
                        <div className="cargo-progress-container" title={`Cargo: ${pc.cargoLoaded.toLocaleString()} / ${pc.cargoTarget.toLocaleString()} Tons (${cargoPercentage}%)`}>
                          <div className="cargo-numbers">
                            <span>{cargoPercentage}%</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Hatch 1-5</span>
                          </div>
                          <div className="cargo-hatch-grid">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const hatchFill = Math.max(0, Math.min(100, (cargoPercentage - (i * 20)) * 5));
                              return (
                                <div key={i} className="cargo-hatch-box" title={`Hatch ${i + 1}: ${hatchFill}% loaded`}>
                                  <div className="cargo-hatch-fill" style={{ width: `${hatchFill}%` }}></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : pc.status === 'Berthing' ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--orange-safety)' }}>Tugs Active</span>
                      ) : pc.status === 'Anchored' ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--yellow-warning)' }}>Awaiting Berth Clearance</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pre-arrival</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-8">
                        <button 
                          className="action-btn"
                          title="Orchestrate Services"
                          onClick={() => onViewDetails(pc.id, 'ops-board')}
                        >
                          <Activity size={12} />
                        </button>
                        <button 
                          className="action-btn"
                          title="Statement of Facts Log"
                          style={{ borderColor: 'rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-ocean)' }}
                          onClick={() => onViewDetails(pc.id, 'sof')}
                        >
                          <History size={12} />
                        </button>
                        <button 
                          className="action-btn"
                          title="Laytime Calculations"
                          style={{ borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green-emerald)' }}
                          onClick={() => onViewDetails(pc.id, 'calculator')}
                        >
                          <Calculator size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPortCalls.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                    No vessel records match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Right Side: Environment Widgets */}
        <div className="right-sidebar-widgets">
          {/* Weather Widget */}
          <section className="glass-panel widget-panel">
            <div className="widget-title">
              <Wind size={18} className="teal-glow" />
              <span>Harbor Weather Feed</span>
            </div>
            
            <div className="weather-widget">
              <div className="weather-main">
                <div>
                  <div className="temp-val">19°C</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scattered Clouds</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--orange-safety)', fontSize: '0.85rem', fontWeight: 600 }}>PILOT CAUTION</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Wind &gt; 12 kts</div>
                </div>
              </div>

              <div className="weather-stats">
                <div className="stat-item">
                  <span className="stat-label">Wind Speed</span>
                  <span style={{ fontWeight: 600 }}>14.8 knots ENE</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tidal Current</span>
                  <span style={{ fontWeight: 600 }}>0.8 knots Flood</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Harbor Swell</span>
                  <span style={{ fontWeight: 600 }}>1.1m (Slight)</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Visibility</span>
                  <span style={{ fontWeight: 600 }}>14.0 km (Clear)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Port Advisories Widget */}
          <section className="glass-panel widget-panel" style={{ padding: '0 0 20px 0', overflow: 'hidden' }}>
            <div className="hazard-stripes-bar"></div>
            <div className="widget-title" style={{ padding: '0 20px', marginTop: '16px' }}>
              <Navigation size={18} className="blue-ocean" />
              <span>Port Advisories</span>
            </div>
            
            <div className="advisories-list">
              <div className="advisory-item warning hazard-stripes-bg" style={{ margin: '0 20px 10px 20px' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Draft Limit: South Channel</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px', opacity: 0.9 }}>
                    Due to sand siltation, max allowed draft for South Channel transits is temporarily capped at 13.5m under current tide.
                  </div>
                </div>
              </div>

              <div className="advisory-item info" style={{ margin: '0 20px' }}>
                <Activity size={16} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Dredging Zone: Center Basin</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px', opacity: 0.9 }}>
                    Dredger "Volvox Asia" active. Approach vessels must coordinate via VHF Ch-12.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
