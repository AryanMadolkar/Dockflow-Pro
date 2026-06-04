import React, { useState } from 'react';
import { 
  Ship, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Info,
  X,
  Compass
} from 'lucide-react';
import type { PortCall, Berth } from '../types';

interface BerthPlannerProps {
  portCalls: PortCall[];
  berths: Berth[];
  onAssignBerth: (portCallId: string, berthId: string | undefined) => void;
}

const BerthPlanner: React.FC<BerthPlannerProps> = ({ portCalls, berths, onAssignBerth }) => {
  const [selectedBerthId, setSelectedBerthId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTargetCallId, setModalTargetCallId] = useState<string>('');

  // Find vessels that are NOT departed
  const activePortCalls = portCalls.filter(pc => pc.status !== 'Departed');

  const handleOpenAssign = (berthId: string) => {
    setSelectedBerthId(berthId);
    // Find first vessel that isn't already at this berth
    const firstAvailable = activePortCalls.find(pc => pc.berthId !== berthId);
    setModalTargetCallId(firstAvailable ? firstAvailable.id : '');
    setShowModal(true);
  };

  const handleSaveAssignment = () => {
    if (!selectedBerthId) return;
    // If selecting "unassign" (Anchorage), we pass undefined, otherwise target Call Id
    if (modalTargetCallId === 'anchorage') {
      // Find what vessel is currently at selectedBerthId and unassign it
      const currentCall = activePortCalls.find(pc => pc.berthId === selectedBerthId);
      if (currentCall) {
        onAssignBerth(currentCall.id, undefined);
      }
    } else {
      // Assign the selected vessel
      onAssignBerth(modalTargetCallId, selectedBerthId);
    }
    setShowModal(false);
    setSelectedBerthId(null);
  };

  const handleUnberth = (portCallId: string) => {
    onAssignBerth(portCallId, undefined);
  };

  return (
    <div className="berth-planner-layout">
      {/* Overview stats bar */}
      <section className="glass-panel planner-control-bar">
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Berths</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '2px' }}>{berths.length}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Occupied Berths</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '2px', color: 'var(--teal-glow)' }}>
              {berths.filter(b => b.occupiedVesselId).length}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Vessels at Anchorage</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '2px', color: 'var(--yellow-warning)' }}>
              {activePortCalls.filter(pc => !pc.berthId).length}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} className="teal-glow" />
          <span>Vessels automatically cross-reference draft limits & length bounds in real-time.</span>
        </div>
      </section>

      {/* Berths Grid List */}
      <section className="berths-grid">
        {berths.map(berth => {
          // Find vessel occupying this berth (if any)
          const occupiedCall = activePortCalls.find(pc => pc.berthId === berth.id);
          
          // Safety Calculations
          let hasViolation = false;
          let violationMsg = '';
          let loaRatio = 0;

          if (occupiedCall) {
            const ship = occupiedCall.vessel;
            loaRatio = Math.min(Math.round((ship.loa / berth.length) * 100), 100);
            
            // Check draft (Grounding danger!)
            if (ship.draft > berth.depth) {
              hasViolation = true;
              violationMsg = `CRITICAL DRAFT VIOLATION: Vessel draft (${ship.draft}m) exceeds berth depth (${berth.depth}m). Immediate risk of grounding!`;
            }
            // Check length
            else if (ship.loa > berth.length) {
              hasViolation = true;
              violationMsg = `LENGTH OVERFLOW WARNING: Vessel LOA (${ship.loa}m) exceeds maximum berth capacity (${berth.length}m).`;
            }
          }

          return (
            <div className="glass-panel berth-card" key={berth.id}>
              {/* Berth Header */}
              <div className="berth-info-row">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} className={occupiedCall ? 'teal-glow' : 'text-muted'} />
                    {berth.name}
                    <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({berth.terminal})
                    </span>
                  </h3>
                </div>
                
                <div className="berth-meta-labels">
                  <div>Max Length: <span className="berth-meta-val">{berth.length}m</span></div>
                  <div>Max Depth: <span className="berth-meta-val">{berth.depth}m</span></div>
                </div>
              </div>

              {/* Violation Banner */}
              {hasViolation && (
                <div className="berth-violation-banner">
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{violationMsg}</span>
                </div>
              )}

              {/* Visual Slot */}
              <div className={`berth-visual-slot wharf-bulkhead ${occupiedCall ? 'occupied' : ''}`}>
                <div className="wharf-bollard" style={{ left: '10%' }}></div>
                <div className="wharf-bollard" style={{ left: '30%' }}></div>
                <div className="wharf-bollard" style={{ left: '50%' }}></div>
                <div className="wharf-bollard" style={{ left: '70%' }}></div>
                <div className="wharf-bollard" style={{ left: '90%' }}></div>
                <div className="fender-pad" style={{ left: '20%' }}></div>
                <div className="fender-pad" style={{ left: '40%' }}></div>
                <div className="fender-pad" style={{ left: '60%' }}></div>
                <div className="fender-pad" style={{ left: '80%' }}></div>
                {occupiedCall ? (
                  <div className="berth-ship-silhouette" style={{ width: `${loaRatio}%` }}>
                    <div className="ship-info-text">
                      <div className="ship-title">
                        {occupiedCall.vessel.name}
                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '12px' }}>
                          IMO {occupiedCall.vessel.imo} • {occupiedCall.vessel.type}
                        </span>
                      </div>
                      <div className="ship-details">
                        LOA: {occupiedCall.vessel.loa}m • Flag: {occupiedCall.vessel.flag} • Cargo: {occupiedCall.cargoType}
                      </div>
                    </div>

                    <div className="ship-draft-display">
                      <div style={{ color: occupiedCall.vessel.draft > berth.depth ? 'var(--red-alert)' : 'var(--green-emerald)' }}>
                        Draft: {occupiedCall.vessel.draft}m
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Berth Depth: {berth.depth}m
                      </div>
                    </div>

                    <div className="ship-indicator-bow"></div>

                    {/* Actions on berthed ship */}
                    <div style={{ position: 'absolute', right: '12px', top: '8px', display: 'flex', gap: '8px' }}>
                      <button 
                        className="action-btn"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenAssign(berth.id)}
                      >
                        Reassign
                      </button>
                      <button 
                        className="action-btn"
                        style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'var(--red-dim)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--red-alert)' }}
                        onClick={() => handleUnberth(occupiedCall.id)}
                      >
                        Unberth
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="berth-empty-msg">
                    <Compass size={16} />
                    <span>No Vessel Berthed</span>
                    <button 
                      className="action-btn"
                      style={{ padding: '4px 12px', fontSize: '0.75rem', marginLeft: '12px' }}
                      onClick={() => handleOpenAssign(berth.id)}
                    >
                      <Plus size={12} style={{ marginRight: '4px' }} /> Assign Vessel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Anchorage Watchlist (Vessels waiting for berth) */}
      <section className="glass-panel" style={{ padding: '20px', marginTop: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Ship size={18} className="text-muted" />
          Anchorages & Waiting List
        </h3>
        <table className="vessel-table">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>Flag / Type</th>
              <th>LOA / Beam</th>
              <th>Arrival Draft</th>
              <th>Arrival Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activePortCalls.filter(pc => !pc.berthId).map(pc => (
              <tr key={pc.id}>
                <td style={{ fontWeight: 600 }}>{pc.vessel.name}</td>
                <td>{pc.vessel.flag} • {pc.vessel.type}</td>
                <td>{pc.vessel.loa}m x {pc.vessel.beam}m</td>
                <td>{pc.vessel.draft}m</td>
                <td>
                  <span className={`status-badge ${pc.status.toLowerCase().replace(' ', '-')}`}>
                    {pc.status}
                  </span>
                </td>
                <td>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        onAssignBerth(pc.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    style={{
                      background: 'rgba(6,9,19,0.6)',
                      border: '1px solid var(--card-border)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Dock Vessel...</option>
                    {berths.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Max LOA {b.length}m, Draft {b.depth}m)
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {activePortCalls.filter(pc => !pc.berthId).length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-dim)' }}>
                  <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom', color: 'var(--green-emerald)' }} />
                  Outer anchorage clear. All vessels are currently berthed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Assignment Modal Popover */}
      {showModal && selectedBerthId && (
        <>
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
          <div className="berth-selector-modal glass-panel">
            <div className="modal-header">
              <h3>Assign Vessel to {berths.find(b => b.id === selectedBerthId)?.name}</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Select Vessel</label>
                <select 
                  className="form-control"
                  value={modalTargetCallId}
                  onChange={(e) => setModalTargetCallId(e.target.value)}
                >
                  <option value="anchorage">-- Clear Berth (Move to Anchorage) --</option>
                  {activePortCalls.map(pc => (
                    <option key={pc.id} value={pc.id}>
                      {pc.vessel.name} (Draft: {pc.vessel.draft}m, LOA: {pc.vessel.loa}m)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Warning inside modal! */}
              {(() => {
                const targetBerth = berths.find(b => b.id === selectedBerthId);
                const targetCall = activePortCalls.find(pc => pc.id === modalTargetCallId);
                if (targetBerth && targetCall) {
                  const bDepth = targetBerth.depth;
                  const bLength = targetBerth.length;
                  const sDraft = targetCall.vessel.draft;
                  const sLOA = targetCall.vessel.loa;

                  const draftViolated = sDraft > bDepth;
                  const lengthViolated = sLOA > bLength;

                  if (draftViolated || lengthViolated) {
                    return (
                      <div 
                        className="berth-violation-banner" 
                        style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.08)' }}
                      >
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Safety Violation Flagged:</strong>
                          {draftViolated && <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>• Vessel draft of {sDraft}m exceeds berth depth of {bDepth}m. High risk of grounding!</div>}
                          {lengthViolated && <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>• Vessel length of {sLOA}m exceeds berth capacity of {bLength}m.</div>}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        className="d-flex align-center gap-8" 
                        style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--green-emerald)', padding: '10px 16px', borderRadius: '6px', fontSize: '0.85rem' }}
                      >
                        <CheckCircle size={16} />
                        <span>Vessel parameters satisfy all berth safety criteria. Safe to dock.</span>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="action-btn" onClick={handleSaveAssignment}>Confirm Assignment</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BerthPlanner;
