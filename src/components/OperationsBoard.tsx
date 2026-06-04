import { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Play, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import type { PortCall, ServiceTask } from '../types';

interface OperationsBoardProps {
  portCall: PortCall;
  onUpdateServiceStatus: (
    portCallId: string, 
    serviceId: string, 
    newStatus: 'Scheduled' | 'Mobilizing' | 'Active' | 'Completed' | 'Delayed',
    notes?: string
  ) => void;
}

const OperationsBoard: React.FC<OperationsBoardProps> = ({ portCall, onUpdateServiceStatus }) => {
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const columns: { id: ServiceTask['status']; title: string; color: string }[] = [
    { id: 'Scheduled', title: 'Scheduled', color: 'var(--text-dim)' },
    { id: 'Mobilizing', title: 'Mobilizing', color: 'var(--orange-safety)' },
    { id: 'Active', title: 'Active', color: 'var(--teal-glow)' },
    { id: 'Completed', title: 'Completed', color: 'var(--green-emerald)' }
  ];

  // Helper to filter tasks by status column
  const getTasksByStatus = (status: ServiceTask['status']) => {
    // If task is 'Delayed', let's display it in the 'Scheduled' column for action
    if (status === 'Scheduled') {
      return portCall.services.filter(s => s.status === 'Scheduled' || s.status === 'Delayed');
    }
    return portCall.services.filter(s => s.status === status);
  };

  const handleCardClick = (task: ServiceTask) => {
    setSelectedTask(task);
    setNoteText(task.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedTask) return;
    onUpdateServiceStatus(portCall.id, selectedTask.id, selectedTask.status, noteText);
    setSelectedTask(prev => prev ? { ...prev, notes: noteText } : null);
  };

  const formatTaskTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Vessel Banner */}
      <section className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AnchorIcon type={portCall.vessel.type} />
            {portCall.vessel.name} Service Registry
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Flag: {portCall.vessel.flag} • Max Draft: {portCall.vessel.maxDraft}m • Cargo: {portCall.cargoQty.toLocaleString()}t {portCall.cargoType}
          </p>
        </div>
        
        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
          <div>Current Berth: <strong style={{ color: 'var(--teal-glow)' }}>{portCall.berthId ? 'Berth Occupied' : 'Outer Anchorage'}</strong></div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Operational Status: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{portCall.status}</span></div>
        </div>
      </section>

      {/* Kanban Board */}
      <section className="ops-board-layout">
        {columns.map(col => {
          const colTasks = getTasksByStatus(col.id);

          return (
            <div className="ops-column" key={col.id}>
              <div className="ops-column-header">
                <span className="ops-column-title" style={{ color: col.color }}>{col.title}</span>
                <span className="ops-task-count">{colTasks.length}</span>
              </div>

              <div className="ops-cards-container">
                {colTasks.map(task => (
                  <div 
                    className="glass-panel ops-task-card" 
                    key={task.id}
                    onClick={() => handleCardClick(task)}
                    style={{
                      borderLeft: `3px solid ${task.status === 'Delayed' ? 'var(--red-alert)' : col.color}`,
                      background: selectedTask?.id === task.id ? 'rgba(255,255,255,0.06)' : 'var(--card-bg)'
                    }}
                  >
                    <div className="ops-task-title">{task.name}</div>
                    
                    <div className="ops-task-meta">
                      <div className="d-flex align-center gap-8">
                        <Clock size={12} />
                        <span>{formatTaskTime(task.scheduledTime)}</span>
                      </div>
                      <div className="d-flex align-center gap-8">
                        <User size={12} />
                        <span>{task.assignedOperator}</span>
                      </div>
                    </div>

                    {task.status === 'Delayed' && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--red-alert)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <AlertTriangle size={12} />
                        <span>DELAYED</span>
                      </div>
                    )}

                    {/* Quick advance actions */}
                    <div className="ops-task-btn-row" onClick={(e) => e.stopPropagation()}>
                      {task.status === 'Scheduled' && (
                        <>
                          <button 
                            className="action-btn"
                            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                            onClick={() => onUpdateServiceStatus(portCall.id, task.id, 'Mobilizing')}
                          >
                            Mobilize
                          </button>
                          <button 
                            className="action-btn"
                            style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--red-dim)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--red-alert)' }}
                            onClick={() => onUpdateServiceStatus(portCall.id, task.id, 'Delayed')}
                          >
                            Delay
                          </button>
                        </>
                      )}
                      
                      {task.status === 'Delayed' && (
                        <button 
                          className="action-btn"
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => onUpdateServiceStatus(portCall.id, task.id, 'Mobilizing')}
                        >
                          Mobilize
                        </button>
                      )}

                      {task.status === 'Mobilizing' && (
                        <button 
                          className="action-btn"
                          style={{ padding: '2px 6px', fontSize: '0.7rem', color: 'var(--teal-glow)' }}
                          onClick={() => onUpdateServiceStatus(portCall.id, task.id, 'Active')}
                        >
                          <Play size={10} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> Commence
                        </button>
                      )}

                      {task.status === 'Active' && (
                        <button 
                          className="action-btn"
                          style={{ padding: '2px 6px', fontSize: '0.7rem', color: 'var(--green-emerald)', borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.1)' }}
                          onClick={() => onUpdateServiceStatus(portCall.id, task.id, 'Completed')}
                        >
                          <Check size={10} style={{ marginRight: '2px', verticalAlign: 'middle' }} /> Complete
                        </button>
                      )}

                      {task.status === 'Completed' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--green-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} /> Finished
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Selected Task Details & Notes logger */}
      {selectedTask && (
        <section className="glass-panel" style={{ padding: '20px' }}>
          <div className="d-flex justify-between align-center" style={{ marginBottom: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Service Workspace</span>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
                {selectedTask.name}
              </h3>
            </div>
            
            <button 
              className="cancel-btn" 
              style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
              onClick={() => setSelectedTask(null)}
            >
              Close Editor
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span className="text-muted">Operator:</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedTask.assignedOperator}</div>
              </div>
              <div>
                <span className="text-muted">Scheduled Time:</span>
                <div style={{ fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {new Date(selectedTask.scheduledTime).toUTCString().replace('GMT', 'UTC')}
                </div>
              </div>
              {selectedTask.actualStartTime && (
                <div>
                  <span className="text-muted">Commenced:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-mono)', color: 'var(--teal-glow)' }}>
                    {new Date(selectedTask.actualStartTime).toUTCString().replace('GMT', 'UTC')}
                  </div>
                </div>
              )}
              {selectedTask.actualEndTime && (
                <div>
                  <span className="text-muted">Completed:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-mono)', color: 'var(--green-emerald)' }}>
                    {new Date(selectedTask.actualEndTime).toUTCString().replace('GMT', 'UTC')}
                  </div>
                </div>
              )}
            </div>

            {/* Note form */}
            <div className="form-group">
              <label htmlFor="task-notes">Operational Log & Stevedoring Notes</label>
              <textarea 
                id="task-notes"
                className="form-control"
                style={{ minHeight: '80px', resize: 'vertical', width: '100%' }}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log delay reasons, tugboat names, bunker discharge rates, or mooring line patterns..."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button 
                  className="action-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={handleSaveNotes}
                >
                  <FileText size={12} /> Save Log Details
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Helper Icon selector
const AnchorIcon: React.FC<{ type: string }> = ({ type }) => {
  return <span title={type}><CheckCircle size={18} className="teal-glow" /></span>;
};

export default OperationsBoard;
