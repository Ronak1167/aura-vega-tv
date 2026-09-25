import React, { useState, useEffect } from 'react'
import { Sparkles, Film, ShieldAlert, Cpu, CloudSun, Clock, Wifi } from 'lucide-react'
import { useFocusable } from '../engine/useFocusable'

export type TabId = 'ambient' | 'consensus' | 'doorbell' | 'vega_friction'

interface GlanceBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export const GlanceBar: React.FC<GlanceBarProps> = ({ activeTab, onTabChange }) => {
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      )
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Focusable Nav Tabs
  const tabAmbient = useFocusable<HTMLButtonElement>({
    id: 'tab-ambient',
    group: 'nav-tabs',
    priority: 1,
    onSelect: () => onTabChange('ambient')
  })

  const tabConsensus = useFocusable<HTMLButtonElement>({
    id: 'tab-consensus',
    group: 'nav-tabs',
    priority: 2,
    autoFocus: true, // Default landing focus
    onSelect: () => onTabChange('consensus')
  })

  const tabDoorbell = useFocusable<HTMLButtonElement>({
    id: 'tab-doorbell',
    group: 'nav-tabs',
    priority: 3,
    onSelect: () => onTabChange('doorbell')
  })

  const tabFriction = useFocusable<HTMLButtonElement>({
    id: 'tab-friction',
    group: 'nav-tabs',
    priority: 4,
    onSelect: () => onTabChange('vega_friction')
  })

  return (
    <header className="glance-bar-container">
      {/* Top Telemetry & Clock Section */}
      <div className="glance-top-row">
        <div className="brand-section">
          <div className="brand-badge">
            <span className="brand-dot" />
            <span className="brand-title">AURA VEGA</span>
            <span className="brand-chip">FIRE TV OS</span>
          </div>
          <div className="weather-telemetry">
            <CloudSun size={24} className="text-amber" />
            <span className="weather-temp">72°F</span>
            <span className="weather-desc">Golden Living Room • Clear</span>
          </div>
        </div>

        <div className="clock-section">
          <div className="digital-clock">
            <Clock size={22} className="text-cyan clock-icon" />
            <span className="time-display">{timeStr}</span>
          </div>
          <span className="date-display">{dateStr}</span>
        </div>
      </div>

      {/* Main 10-Foot Focusable Navigation Bar */}
      <nav className="glance-nav-row tv-glass-card">
        <div className="nav-buttons-group">
          <button
            ref={tabAmbient.ref}
            onClick={() => onTabChange('ambient')}
            className={`nav-tab-btn ${activeTab === 'ambient' ? 'active-tab' : ''}`}
          >
            <Sparkles size={24} />
            <span>Ambient Canvas</span>
          </button>

          <button
            ref={tabConsensus.ref}
            onClick={() => onTabChange('consensus')}
            className={`nav-tab-btn ${activeTab === 'consensus' ? 'active-tab' : ''}`}
          >
            <Film size={24} />
            <span>Couch Consensus</span>
            <span className="mini-pill">AI Curated</span>
          </button>

          <button
            ref={tabDoorbell.ref}
            onClick={() => onTabChange('doorbell')}
            className={`nav-tab-btn ${activeTab === 'doorbell' ? 'active-tab' : ''}`}
          >
            <ShieldAlert size={24} />
            <span>Front Door Glance</span>
            <span className="pulse-alert-dot" />
          </button>

          <button
            ref={tabFriction.ref}
            onClick={() => onTabChange('vega_friction')}
            className={`nav-tab-btn ${activeTab === 'vega_friction' ? 'active-tab' : ''}`}
          >
            <Cpu size={24} />
            <span>Vega OS DX Log</span>
            <span className="mini-pill amber">Amazon Judges</span>
          </button>
        </div>

        {/* Remote D-pad Keyboard Navigation Hint */}
        <div className="remote-hint-pill">
          <span className="key-icon">◄ ►</span>
          <span className="hint-label">D-Pad</span>
          <span className="key-icon">OK</span>
          <span className="hint-label">Select</span>
        </div>
      </nav>

      <style>{`
        .glance-bar-container {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }

        .glance-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 18px;
          border-radius: 100px;
        }

        .brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--tv-accent-cyan);
          box-shadow: 0 0 12px var(--tv-accent-cyan);
          animation: brand-pulse 2s infinite;
        }

        @keyframes brand-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        .brand-title {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-md);
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #FFFFFF;
        }

        .brand-chip {
          background: rgba(255, 153, 0, 0.25);
          color: var(--tv-accent-amber);
          border: 1px solid rgba(255, 153, 0, 0.5);
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .weather-telemetry {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: var(--tv-text-sm);
          color: var(--tv-text-secondary);
        }

        .weather-temp {
          font-size: var(--tv-text-md);
          font-weight: 700;
          color: #FFFFFF;
        }

        .text-amber {
          color: var(--tv-accent-amber);
        }

        .text-cyan {
          color: var(--tv-accent-cyan);
        }

        .clock-section {
          display: flex;
          align-items: baseline;
          gap: 18px;
        }

        .digital-clock {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-xl);
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.02em;
        }

        .date-display {
          font-size: var(--tv-text-sm);
          font-weight: 500;
          color: var(--tv-text-secondary);
        }

        .glance-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 18px;
        }

        .nav-buttons-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 28px;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid transparent;
          border-radius: 14px;
          color: var(--tv-text-secondary);
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-md);
          font-weight: 600;
          transition: all var(--tv-duration-focus) var(--tv-ease-smooth);
        }

        .nav-tab-btn.active-tab {
          background: rgba(0, 242, 254, 0.12);
          border-color: rgba(0, 242, 254, 0.4);
          color: #FFFFFF;
        }

        .mini-pill {
          padding: 2px 8px;
          background: rgba(0, 242, 254, 0.2);
          color: var(--tv-accent-cyan);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .mini-pill.amber {
          background: rgba(255, 153, 0, 0.25);
          color: var(--tv-accent-amber);
        }

        .pulse-alert-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--tv-accent-rose);
          box-shadow: 0 0 10px var(--tv-accent-rose);
        }

        .remote-hint-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.35);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: var(--tv-text-xs);
          color: var(--tv-text-muted);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .key-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .hint-label {
          margin-right: 6px;
        }
      `}</style>
    </header>
  )
}
