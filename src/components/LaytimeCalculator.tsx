import React, { useState, useMemo, useEffect } from 'react';
import { 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Info
} from 'lucide-react';
import type { PortCall, SOFEvent } from '../types';

interface LaytimeCalculatorProps {
  portCall: PortCall;
}

const formatForInput = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '';
  return dateTimeStr.replace('Z', '').split('.')[0].slice(0, 16);
};

const LaytimeCalculator: React.FC<LaytimeCalculatorProps> = ({ portCall }) => {
  // Input settings
  const [allowedHours, setAllowedHours] = useState<number>(72); // 3 days default
  const [demurrageRate, setDemurrageRate] = useState<number>(15000); // $15,000 / day
  const [despatchRate, setDespatchRate] = useState<number>(7500); // $7,500 / day (usually 50% of demurrage)

  // Find natural start/end of laytime based on SOF
  const defaultTimes = useMemo(() => {
    // Sort events chronologically (ascending for math)
    const sorted = [...portCall.sofEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const startEvent = sorted.find(e => e.description.toLowerCase().includes('commenced') || e.description.toLowerCase().includes('commence'));
    const endEvent = [...sorted].reverse().find(e => e.description.toLowerCase().includes('completed') || e.description.toLowerCase().includes('complete'));

    return {
      start: startEvent ? startEvent.timestamp : portCall.ata ? portCall.ata : '2026-06-02T13:00:00Z',
      end: endEvent ? endEvent.timestamp : portCall.atd ? portCall.atd : '2026-06-04T18:00:00Z'
    };
  }, [portCall]);

  const [startTime, setStartTime] = useState<string>(defaultTimes.start);
  const [endTime, setEndTime] = useState<string>(defaultTimes.end);

  // Sync state if defaultTimes change (e.g. when switching vessels)
  useEffect(() => {
    setStartTime(defaultTimes.start);
    setEndTime(defaultTimes.end);
  }, [defaultTimes]);

  // Filter events within laytime window
  const relevantEvents = useMemo(() => {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    // Get events in window, sort chronologically
    let events = portCall.sofEvents
      .filter(e => {
        const t = new Date(e.timestamp).getTime();
        return t >= startMs && t <= endMs;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Inject virtual start and end boundary events if they don't exist exactly
    const hasExactStart = events.some(e => new Date(e.timestamp).getTime() === startMs);
    const hasExactEnd = events.some(e => new Date(e.timestamp).getTime() === endMs);

    if (!hasExactStart) {
      events.unshift({
        id: 'virtual-start',
        timestamp: startTime,
        description: 'Laytime Commences (Calculation Boundary)',
        category: 'Administrative',
        loggedBy: 'Calculator',
        laytimeImpact: 'Full'
      });
    }

    if (!hasExactEnd) {
      events.push({
        id: 'virtual-end',
        timestamp: endTime,
        description: 'Cargo Operations Completed (Calculation Boundary)',
        category: 'Cargo',
        loggedBy: 'Calculator',
        laytimeImpact: 'Full'
      });
    }

    return events;
  }, [portCall.sofEvents, startTime, endTime]);

  // Main Laytime Math
  const calculationResult = useMemo(() => {
    let totalElapsedMs = 0;
    let totalCountedMs = 0;
    const items: Array<{
      event: SOFEvent;
      durationHours: number;
      factor: number;
      countedHours: number;
      accumulatedHours: number;
      nextTime: string;
    }> = [];

    for (let i = 0; i < relevantEvents.length - 1; i++) {
      const current = relevantEvents[i];
      const next = relevantEvents[i + 1];

      const currentMs = new Date(current.timestamp).getTime();
      const nextMs = new Date(next.timestamp).getTime();
      const durationMs = nextMs - currentMs;
      const durationHours = durationMs / (1000 * 60 * 60);

      // Factor
      let factor = 1.0;
      if (current.laytimeImpact === 'Half') factor = 0.5;
      if (current.laytimeImpact === 'Excluded') factor = 0.0;

      const countedHours = durationHours * factor;
      totalElapsedMs += durationMs;
      totalCountedMs += (durationHours * factor) * 1000 * 60 * 60;

      items.push({
        event: current,
        durationHours,
        factor,
        countedHours,
        accumulatedHours: totalCountedMs / (1000 * 60 * 60),
        nextTime: next.timestamp
      });
    }

    const elapsedHours = totalElapsedMs / (1000 * 60 * 60);
    const countedHours = totalCountedMs / (1000 * 60 * 60);
    const balanceHours = allowedHours - countedHours;
    
    // Demurrage or Despatch
    const isDemurrage = balanceHours < 0;
    const balanceDays = Math.abs(balanceHours) / 24;
    const financialRate = isDemurrage ? demurrageRate : despatchRate;
    const totalAmount = balanceDays * financialRate;

    return {
      items,
      elapsedHours,
      countedHours,
      balanceHours,
      isDemurrage,
      totalAmount
    };
  }, [relevantEvents, allowedHours, demurrageRate, despatchRate]);

  // UI formatting helper
  const formatHoursToDaysStr = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const handlePrint = () => {
    window.print();
  };

  const laytimePercentage = Math.min(Math.round((calculationResult.countedHours / allowedHours) * 100), 150);

  return (
    <div className="laytime-layout">
      {/* Settings Grid */}
      <section className="glass-panel calculator-settings-panel">
        <div className="form-group">
          <label htmlFor="allowed-laytime">Allowed Laytime (Hours)</label>
          <div className="d-flex align-center gap-8">
            <input 
              id="allowed-laytime"
              type="number" 
              className="form-control w-100" 
              value={allowedHours}
              onChange={(e) => setAllowedHours(Number(e.target.value))}
            />
            <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
              = {Math.round((allowedHours / 24) * 10) / 10} Days
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="demurrage-rate">Demurrage Rate ($ / Day)</label>
          <input 
            id="demurrage-rate"
            type="number" 
            className="form-control" 
            value={demurrageRate}
            onChange={(e) => setDemurrageRate(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="despatch-rate">Despatch Rate ($ / Day)</label>
          <input 
            id="despatch-rate"
            type="number" 
            className="form-control" 
            value={despatchRate}
            onChange={(e) => setDespatchRate(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calc-start">Laytime Start Boundary</label>
          <input 
            id="calc-start"
            type="datetime-local" 
            className="form-control" 
            value={formatForInput(startTime)}
            onChange={(e) => setStartTime(e.target.value ? e.target.value + 'Z' : '')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calc-end">Laytime End Boundary</label>
          <input 
            id="calc-end"
            type="datetime-local" 
            className="form-control" 
            value={formatForInput(endTime)}
            onChange={(e) => setEndTime(e.target.value ? e.target.value + 'Z' : '')}
          />
        </div>
      </section>

      {/* Main Results Board */}
      <div className="calculator-results-grid">
        {/* Left: Statement of Facts breakdowns */}
        <section className="glass-panel results-table-panel">
          <div className="table-header">
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)' }}>Laytime Calculation Sheet</h3>
            <button 
              className="action-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handlePrint}
            >
              <Printer size={14} /> Print Statement
            </button>
          </div>

          <table className="laytime-statement-table">
            <thead>
              <tr>
                <th>Event Date / Time</th>
                <th>Description</th>
                <th>Duration</th>
                <th>Factor</th>
                <th>Counted</th>
                <th>Accumulated Used</th>
              </tr>
            </thead>
            <tbody>
              {calculationResult.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {new Date(item.event.timestamp).toUTCString().replace('GMT', 'UTC').replace('2026 ', '')}
                  </td>
                  <td>{item.event.description}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.durationHours.toFixed(2)}h</td>
                  <td>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        color: item.factor === 1 ? 'var(--text-main)' : item.factor === 0.5 ? 'var(--orange-safety)' : 'var(--red-alert)',
                        fontWeight: 600
                      }}
                    >
                      {item.factor * 100}%
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.countedHours.toFixed(2)}h</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {formatHoursToDaysStr(item.accumulatedHours)}
                  </td>
                </tr>
              ))}
              {calculationResult.items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                    No events log captured inside selected laytime window boundaries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Right: Calculations Totals and balance sheets */}
        <section className="glass-panel results-summary-panel">
          <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Laytime Balance Sheet</h3>
          
          {/* Progress bar */}
          <div className="laytime-progress-section">
            <div className="laytime-progress-nums">
              <span>Laytime Used: {calculationResult.countedHours.toFixed(1)} hrs</span>
              <span>Allowed: {allowedHours} hrs</span>
            </div>
            <div className="laytime-progress-bar">
              <div 
                className={`laytime-progress-fill ${calculationResult.isDemurrage ? 'demurrage' : ''}`}
                style={{ width: `${laytimePercentage}%` }}
              ></div>
            </div>
            <div style={{ fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
              {laytimePercentage}% Capacity Consumed
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div className="summary-stat-box">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Port Elapsed Time</div>
              <div className="stat-val" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatHoursToDaysStr(calculationResult.elapsedHours)}
              </div>
            </div>

            <div className="summary-stat-box">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Laytime Counted</div>
              <div className="stat-val" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatHoursToDaysStr(calculationResult.countedHours)}
              </div>
            </div>

            <div className={`summary-stat-box ${calculationResult.isDemurrage ? 'demurrage' : 'despatch'}`}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {calculationResult.isDemurrage ? 'Demurrage Balance (Excess)' : 'Despatch Balance (Saved)'}
              </div>
              <div className="stat-val" style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {calculationResult.isDemurrage ? (
                  <TrendingUp size={22} className="red-alert" />
                ) : (
                  <TrendingDown size={22} className="green-emerald" />
                )}
                {formatHoursToDaysStr(Math.abs(calculationResult.balanceHours))}
              </div>
            </div>

            {/* Financial Settlement */}
            <div 
              style={{ 
                background: calculationResult.isDemurrage ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${calculationResult.isDemurrage ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Estimated Financial Liability
              </span>
              <h2 
                style={{ 
                  fontSize: '2rem', 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  marginTop: '8px', 
                  color: calculationResult.isDemurrage ? 'var(--red-alert)' : 'var(--green-emerald)'
                }}
              >
                ${calculationResult.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {calculationResult.isDemurrage 
                  ? 'Payable by Charterers to Shipowners (Demurrage)' 
                  : 'Payable by Shipowners to Charterers (Despatch)'}
              </p>
            </div>
          </div>

          <div className="d-flex align-center gap-8 mt-16" style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>Allowed hours, demurrage/despatch multipliers are customizable above. Laytime recalculates automatically on input.</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LaytimeCalculator;
