import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Info,
  Calendar
} from 'lucide-react';
import type { PortCall, ServiceTask } from '../types';

interface TimelineProps {
  portCalls: PortCall[];
}

const Timeline: React.FC<TimelineProps> = ({ portCalls }) => {
  const [selectedTask, setSelectedTask] = useState<{ task: ServiceTask; vesselName: string } | null>(null);

  // We focus the timeline on "Today" (simulated as June 4, 2026)
  const timelineDateString = '2026-06-04';
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter tasks that occur on our target timeline date
  const getTasksForVessel = (pc: PortCall) => {
    return pc.services.filter(s => {
      const taskDate = s.scheduledTime.split('T')[0];
      return taskDate === timelineDateString;
    });
  };

  // Calculate position and width of Gantt block
  const getGanttStyle = (task: ServiceTask) => {
    const d = new Date(task.scheduledTime);
    const startHour = d.getUTCHours() + d.getUTCMinutes() / 60;
    
    // Estimate durations for visual layout
    let duration = 2.0; // default 2 hours
    if (task.category === 'Tugs') duration = 1.5;
    if (task.category === 'Mooring') duration = 1.0;
    if (task.category === 'Bunkering') duration = 4.0;
    if (task.category === 'Provisioning') duration = 3.0;
    if (task.category === 'Waste') duration = 1.5;

    // If actual start & end times exist, calculate real duration
    if (task.actualStartTime && task.actualEndTime) {
      const start = new Date(task.actualStartTime).getTime();
      const end = new Date(task.actualEndTime).getTime();
      duration = Math.max((end - start) / (1000 * 60 * 60), 0.5);
    } else if (task.actualStartTime) {
      // currently active, take difference from now or scheduled time
      duration = 2.5; 
    }

    const left = startHour * 60; // 60px per hour
    const width = duration * 60;

    return {
      left: `${left}px`,
      width: `${width}px`
    };
  };

  // Check for conflicts: Tugs or Pilots scheduled for different ships at the exact same hour
  const detectConflicts = (): string[] => {
    const conflicts: string[] = [];
    const allServicesWithVessels: { service: ServiceTask; vesselName: string }[] = [];

    portCalls.forEach(pc => {
      pc.services.forEach(s => {
        if (s.scheduledTime.startsWith(timelineDateString) && s.status !== 'Completed') {
          allServicesWithVessels.push({ service: s, vesselName: pc.vessel.name });
        }
      });
    });

    // Compare pairs
    for (let i = 0; i < allServicesWithVessels.length; i++) {
      for (let j = i + 1; j < allServicesWithVessels.length; j++) {
        const a = allServicesWithVessels[i];
        const b = allServicesWithVessels[j];

        // Same category (e.g. Tugs or Pilots) and overlapping times
        if (a.service.category === b.service.category && a.service.category !== 'Provisioning' && a.service.category !== 'Waste') {
          const timeA = new Date(a.service.scheduledTime).getTime();
          const timeB = new Date(b.service.scheduledTime).getTime();
          
          // Let's assume a 2-hour window of conflict
          const timeDifferenceHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

          if (timeDifferenceHours < 1.5) {
            conflicts.push(
              `Operator Conflict Warning: ${a.service.category} service requested for both "${a.vesselName}" (${new Date(a.service.scheduledTime).getUTCHours()}:00) and "${b.vesselName}" (${new Date(b.service.scheduledTime).getUTCHours()}:00). Harbor resources may be overloaded.`
            );
          }
        }
      }
    }

    return conflicts;
  };

  const conflictsList = detectConflicts();

  return (
    <div className="timeline-wrapper glass-panel">
      <div className="table-header" style={{ marginBottom: '12px' }}>
        <div className="d-flex align-center gap-16">
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>June 04, 2026 Gantt Schedule</h2>
          <span 
            className="d-flex align-center gap-8" 
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '4px 10px', 
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            <Calendar size={14} />
            <span>Scale: 24h GMT</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
          <div className="d-flex align-center gap-8">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: 'var(--blue-dim)', border: '1px solid #60a5fa' }}></span>
            <span>Pilotage</span>
          </div>
          <div className="d-flex align-center gap-8">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: 'var(--orange-dim)', border: '1px solid #fb923c' }}></span>
            <span>Tugboats</span>
          </div>
          <div className="d-flex align-center gap-8">
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: 'var(--yellow-dim)', border: '1px solid #fbbf24' }}></span>
            <span>Bunkering</span>
          </div>
        </div>
      </div>

      {/* Conflict Warnings */}
      {conflictsList.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {conflictsList.map((c, idx) => (
            <div className="berth-violation-banner" key={idx} style={{ margin: 0 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Gantt Timeline Container */}
      <div className="timeline-grid-container">
        {/* Timeline Header Row (Hours) */}
        <div className="timeline-header-hours">
          <div className="timeline-header-label-col">Vessel Name</div>
          <div className="timeline-hours-container">
            {hours.map(hour => (
              <div key={hour} className="timeline-hour-slot">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Vessel Rows */}
        {portCalls.filter(pc => pc.status !== 'Departed').map(pc => {
          const vesselTasks = getTasksForVessel(pc);

          return (
            <div key={pc.id} className="timeline-row">
              <div className="timeline-vessel-col">
                <span style={{ color: 'var(--text-main)' }}>{pc.vessel.name}</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                  {pc.vessel.type} • {pc.status}
                </div>
              </div>

              <div className="timeline-blocks-col">
                {/* Horizontal Guide Lines */}
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    style={{
                      position: 'absolute',
                      left: `${hour * 60}px`,
                      width: '1px',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.02)'
                    }}
                  />
                ))}

                {/* Service Task Gantt blocks */}
                {vesselTasks.map(task => {
                  const style = getGanttStyle(task);
                  const categoryClass = task.category.toLowerCase();

                  return (
                    <div 
                      key={task.id}
                      className={`timeline-block ${categoryClass} ${task.category === 'Pilotage' ? 'pilotage' : task.category === 'Tugs' ? 'tugs' : task.category === 'Bunkering' ? 'bunkering' : 'other'}`}
                      style={style}
                      onClick={() => setSelectedTask({ task, vesselName: pc.vessel.name })}
                    >
                      <span style={{ fontWeight: 600 }}>{task.name}</span>
                      <span style={{ opacity: 0.8, fontSize: '0.65rem' }}>({task.status})</span>
                    </div>
                  );
                })}

                {vesselTasks.length === 0 && (
                  <div style={{ position: 'absolute', left: '16px', top: '20px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    No services scheduled on this date
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Card Overlay */}
      {selectedTask && (
        <div 
          className="glass-panel" 
          style={{ 
            marginTop: '24px', 
            padding: '16px 20px', 
            borderLeft: '4px solid var(--teal-glow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Service Detail • {selectedTask.vesselName}
            </div>
            <h4 style={{ fontSize: '1.1rem', margin: '4px 0 8px 0', fontFamily: 'var(--font-display)' }}>
              {selectedTask.task.name}
            </h4>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>Operator: <strong style={{ color: 'var(--text-main)' }}>{selectedTask.task.assignedOperator}</strong></div>
              <div>Scheduled: <strong style={{ color: 'var(--text-main)' }}>{new Date(selectedTask.task.scheduledTime).toUTCString().replace('GMT', 'UTC')}</strong></div>
              <div>Status: <span style={{ textTransform: 'capitalize', color: 'var(--teal-glow)' }}>{selectedTask.task.status}</span></div>
            </div>
            {selectedTask.task.notes && (
              <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-dim)' }}>
                Notes: {selectedTask.task.notes}
              </div>
            )}
          </div>
          
          <button 
            className="action-btn"
            style={{ padding: '6px 12px' }}
            onClick={() => setSelectedTask(null)}
          >
            Dismiss Detail
          </button>
        </div>
      )}

      <div className="d-flex align-center gap-8 mt-16" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <Info size={14} />
        <span>Click any service block on the Gantt chart to inspect assignee, exact timetable, and operational notes.</span>
      </div>
    </div>
  );
};

export default Timeline;
