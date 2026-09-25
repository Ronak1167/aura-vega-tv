import React, { useState, useEffect } from 'react'
import { AmbientCanvas, AmbientMood } from './components/AmbientCanvas'
import { GlanceBar, TabId } from './components/GlanceBar'
import { CouchConsensus } from './components/CouchConsensus'
import { DoorbellPip } from './components/DoorbellPip'
import { VegaFrictionModal } from './components/VegaFrictionModal'
import { spatialFocus } from './engine/spatial-focus'
import { useFocusable } from './engine/useFocusable'
import { Sparkles, Maximize2, Moon } from 'lucide-react'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('consensus')
  const [ambientMood, setAmbientMood] = useState<AmbientMood>('aurora')

  useEffect(() => {
    spatialFocus.initGlobalListeners()

    const handleBack = () => {
      // Back button always returns to consensus or ambient
      setActiveTab((current) => (current === 'consensus' ? 'ambient' : 'consensus'))
    }

    window.addEventListener('tv-back-pressed', handleBack)
    return () => window.removeEventListener('tv-back-pressed', handleBack)
  }, [])

  // Mood cycle buttons for ambient screen
  const btnAurora = useFocusable<HTMLButtonElement>({
    id: 'btn-mood-aurora',
    group: 'ambient-controls',
    priority: 1,
    onSelect: () => setAmbientMood('aurora')
  })

  const btnGolden = useFocusable<HTMLButtonElement>({
    id: 'btn-mood-golden',
    group: 'ambient-controls',
    priority: 2,
    onSelect: () => setAmbientMood('golden_hour')
  })

  const btnNebula = useFocusable<HTMLButtonElement>({
    id: 'btn-mood-nebula',
    group: 'ambient-controls',
    priority: 3,
    onSelect: () => setAmbientMood('midnight_nebula')
  })

  const btnDawn = useFocusable<HTMLButtonElement>({
    id: 'btn-mood-dawn',
    group: 'ambient-controls',
    priority: 4,
    onSelect: () => setAmbientMood('dawn')
  })

  return (
    <main className="tv-root-canvas">
      {/* 60FPS Ambient Particle Layer */}
      <AmbientCanvas mood={ambientMood} />

      {/* 10-Foot TV Safe Area Boundary */}
      <div className="tv-safe-container">
        {/* Top Glance Navigation Bar */}
        <GlanceBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dynamic Main Body Content */}
        <div className="tv-main-viewport">
          {activeTab === 'consensus' && <CouchConsensus />}
          {activeTab === 'doorbell' && <DoorbellPip />}
          {activeTab === 'vega_friction' && <VegaFrictionModal />}

          {activeTab === 'ambient' && (
            <div className="ambient-hero-overlay tv-animate-in">
              <div className="ambient-centerpiece">
                <span className="ambient-subhead">AURA LIVING CANVAS • AMBIENT MODE 2.0</span>
                <h1 className="ambient-quote">"The living room is no longer just a screen — it is an atmospheric space."</h1>
                <p className="ambient-author">Engineered for Amazon Vega OS & OLED Displays</p>

                {/* Mood Switcher Pills */}
                <div className="mood-pills-row">
                  <span className="mood-lbl">Select Mood Atmosphere:</span>
                  <button ref={btnAurora.ref} className={`mood-pill ${ambientMood === 'aurora' ? 'active' : ''}`} onClick={() => setAmbientMood('aurora')}>
                    <Sparkles size={18} />
                    <span>Bioluminescent Aurora</span>
                  </button>
                  <button ref={btnGolden.ref} className={`mood-pill ${ambientMood === 'golden_hour' ? 'active' : ''}`} onClick={() => setAmbientMood('golden_hour')}>
                    <Sparkles size={18} />
                    <span>Golden Hour Sun</span>
                  </button>
                  <button ref={btnNebula.ref} className={`mood-pill ${ambientMood === 'midnight_nebula' ? 'active' : ''}`} onClick={() => setAmbientMood('midnight_nebula')}>
                    <Moon size={18} />
                    <span>Midnight Nebula</span>
                  </button>
                  <button ref={btnDawn.ref} className={`mood-pill ${ambientMood === 'dawn' ? 'active' : ''}`} onClick={() => setAmbientMood('dawn')}>
                    <Sparkles size={18} />
                    <span>Morning Dawn</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Remote Control Status Indicator */}
        <footer className="tv-bottom-bar">
          <div className="tv-remote-hint-bar">
            <span>Fire TV Remote:</span>
            <span className="tv-key-cap">▲▼◄►</span>
            <span>D-Pad Spatial Move</span>
            <span className="tv-key-cap">OK / ENTER</span>
            <span>Select</span>
            <span className="tv-key-cap">BACK</span>
            <span>Toggle Ambient</span>
            <span className="tv-key-cap">SPACE</span>
            <span>Trailer Preview</span>
          </div>

          <div className="hardware-target-pill">
            <span className="hardware-dot" />
            <span>Target: Amazon Fire TV (Vega OS Linux vpkg)</span>
          </div>
        </footer>
      </div>

      <style>{`
        .tv-root-canvas {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .tv-main-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 0;
        }

        .ambient-hero-overlay {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .ambient-centerpiece {
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          background: rgba(7, 9, 14, 0.45);
          backdrop-filter: blur(20px);
          padding: 50px 70px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ambient-subhead {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-xs);
          font-weight: 800;
          letter-spacing: 0.25em;
          color: var(--tv-accent-cyan);
        }

        .ambient-quote {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-2xl);
          font-weight: 700;
          line-height: 1.25;
          color: #FFFFFF;
          text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9);
        }

        .ambient-author {
          font-size: var(--tv-text-sm);
          color: var(--tv-text-secondary);
        }

        .mood-pills-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 14px;
        }

        .mood-lbl {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-muted);
        }

        .mood-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          font-size: var(--tv-text-xs);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--tv-duration-focus) var(--tv-ease-smooth);
        }

        .mood-pill.active {
          background: rgba(0, 242, 254, 0.2);
          border-color: var(--tv-accent-cyan);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
        }

        .tv-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
        }

        .hardware-target-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: var(--tv-text-xs);
          color: var(--tv-text-muted);
          background: rgba(0, 0, 0, 0.4);
          padding: 8px 18px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .hardware-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--tv-accent-emerald);
          box-shadow: 0 0 8px var(--tv-accent-emerald);
        }
      `}</style>
    </main>
  )
}
