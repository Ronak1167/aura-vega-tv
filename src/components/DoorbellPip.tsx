import React, { useState } from 'react'
import { ShieldCheck, Bell, Lightbulb, Lock, Unlock, VolumeX, Volume2, Camera, UserCheck } from 'lucide-react'
import { useFocusable } from '../engine/useFocusable'
import { soundEffects } from '../engine/sound-effects'

export const DoorbellPip: React.FC = () => {
  const [lightsOn, setLightsOn] = useState(true)
  const [doorLocked, setDoorLocked] = useState(true)
  const [chimeMuted, setChimeMuted] = useState(false)
  const [cameraView, setCameraView] = useState<'porch' | 'driveway'>('porch')

  const toggleLights = () => {
    soundEffects.playSelect()
    setLightsOn(prev => !prev)
  }

  const toggleLock = () => {
    soundEffects.playSelect()
    setDoorLocked(prev => !prev)
  }

  const toggleChime = () => {
    soundEffects.playSelect()
    setChimeMuted(prev => !prev)
  }

  const toggleCamera = () => {
    soundEffects.playFocusMove()
    setCameraView(prev => prev === 'porch' ? 'driveway' : 'porch')
  }

  const btnCamera = useFocusable<HTMLButtonElement>({
    id: 'btn-camera-toggle',
    group: 'iot-actions',
    priority: 1,
    onSelect: toggleCamera
  })

  const btnLights = useFocusable<HTMLButtonElement>({
    id: 'btn-lights-toggle',
    group: 'iot-actions',
    priority: 2,
    onSelect: toggleLights
  })

  const btnLock = useFocusable<HTMLButtonElement>({
    id: 'btn-lock-toggle',
    group: 'iot-actions',
    priority: 3,
    onSelect: toggleLock
  })

  const btnMute = useFocusable<HTMLButtonElement>({
    id: 'btn-mute-toggle',
    group: 'iot-actions',
    priority: 4,
    onSelect: toggleChime
  })

  return (
    <div className="doorbell-screen tv-animate-in">
      <div className="doorbell-layout">
        {/* Left Side: Live 10-Foot Front Door Camera Feed */}
        <div className="camera-feed-container tv-glass-card">
          <div className="camera-header-row">
            <div className="feed-title">
              <Camera size={24} className="text-cyan" />
              <span>{cameraView === 'porch' ? 'Front Porch — Ring Video Pro' : 'Driveway North — Floodlight Cam'}</span>
            </div>
            <div className="feed-live-tag">
              <span className="live-dot" />
              <span>LIVE 1080P</span>
            </div>
          </div>

          <div 
            className="camera-snapshot-box"
            style={{
              backgroundImage: cameraView === 'porch' 
                ? 'url(https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80)'
                : 'url(https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80)'
            }}
          >
            {/* Event Overlay */}
            <div className="event-pill-overlay tv-glass-card-elevated">
              <UserCheck size={24} className="text-emerald" />
              <div>
                <span className="event-title">Person Detected at Front Porch</span>
                <span className="event-time">Amazon Courier • 2 mins ago • Package Placed</span>
              </div>
            </div>
          </div>

          <div className="camera-footer-row">
            <button ref={btnCamera.ref} className="action-tv-btn feed-switch-btn" onClick={toggleCamera}>
              <Camera size={22} />
              <span>Switch to {cameraView === 'porch' ? 'Driveway' : 'Front Porch'}</span>
            </button>
            <span className="tv-text-xs text-muted">Cloud Stream Latency: 42ms via WebRTC</span>
          </div>
        </div>

        {/* Right Side: Household Living Room Quick Controls */}
        <div className="household-controls-sidebar tv-glass-card-elevated">
          <div className="controls-header">
            <ShieldCheck size={26} className="text-cyan" />
            <div>
              <h3>Home Perimeter</h3>
              <span className="subhead">Living Room & Front Door Telemetry</span>
            </div>
          </div>

          <div className="toggles-grid">
            <button 
              ref={btnLights.ref} 
              className={`toggle-card ${lightsOn ? 'active-green' : ''}`}
              onClick={toggleLights}
            >
              <Lightbulb size={32} />
              <div className="toggle-text">
                <span className="t-name">Porch Lights</span>
                <span className="t-status">{lightsOn ? 'ON (Warm White)' : 'OFF'}</span>
              </div>
            </button>

            <button 
              ref={btnLock.ref} 
              className={`toggle-card ${doorLocked ? 'active-cyan' : 'active-amber'}`}
              onClick={toggleLock}
            >
              {doorLocked ? <Lock size={32} /> : <Unlock size={32} />}
              <div className="toggle-text">
                <span className="t-name">Smart Deadbolt</span>
                <span className="t-status">{doorLocked ? 'LOCKED' : 'UNLOCKED'}</span>
              </div>
            </button>

            <button 
              ref={btnMute.ref} 
              className={`toggle-card ${chimeMuted ? 'active-rose' : ''}`}
              onClick={toggleChime}
            >
              {chimeMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
              <div className="toggle-text">
                <span className="t-name">TV Chimes</span>
                <span className="t-status">{chimeMuted ? 'DO NOT DISTURB' : 'AUDIBLE'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .doorbell-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .doorbell-layout {
          flex: 1;
          display: flex;
          gap: 28px;
        }

        .camera-feed-container {
          flex: 1;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: 24px;
        }

        .camera-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feed-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-lg);
          font-weight: 700;
        }

        .feed-live-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(244, 63, 94, 0.2);
          border: 1px solid rgba(244, 63, 94, 0.4);
          border-radius: 100px;
          color: var(--tv-accent-rose);
          font-weight: 800;
          font-size: var(--tv-text-xs);
          letter-spacing: 0.08em;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--tv-accent-rose);
          animation: brand-pulse 1.5s infinite;
        }

        .camera-snapshot-box {
          flex: 1;
          border-radius: 20px;
          background-size: cover;
          background-position: center;
          position: relative;
          padding: 24px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .event-pill-overlay {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-radius: 18px;
          background: rgba(11, 14, 23, 0.9);
        }

        .event-title {
          display: block;
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-md);
          font-weight: 700;
        }

        .event-time {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-secondary);
        }

        .camera-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feed-switch-btn {
          padding: 12px 24px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .household-controls-sidebar {
          width: 420px;
          padding: 34px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          border-radius: 24px;
        }

        .controls-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .controls-header h3 {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-lg);
          font-weight: 700;
        }

        .subhead {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-muted);
        }

        .toggles-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .toggle-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 22px 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          color: #FFFFFF;
          cursor: pointer;
          transition: all var(--tv-duration-focus) var(--tv-ease-smooth);
          text-align: left;
        }

        .toggle-text .t-name {
          display: block;
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-md);
          font-weight: 700;
        }

        .toggle-text .t-status {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-secondary);
        }

        .active-green {
          background: rgba(16, 185, 129, 0.15) !important;
          border-color: rgba(16, 185, 129, 0.4) !important;
          color: var(--tv-accent-emerald) !important;
        }

        .active-cyan {
          background: rgba(0, 242, 254, 0.15) !important;
          border-color: rgba(0, 242, 254, 0.4) !important;
          color: var(--tv-accent-cyan) !important;
        }

        .active-amber {
          background: rgba(255, 153, 0, 0.15) !important;
          border-color: rgba(255, 153, 0, 0.4) !important;
          color: var(--tv-accent-amber) !important;
        }

        .active-rose {
          background: rgba(244, 63, 94, 0.15) !important;
          border-color: rgba(244, 63, 94, 0.4) !important;
          color: var(--tv-accent-rose) !important;
        }
      `}</style>
    </div>
  )
}
