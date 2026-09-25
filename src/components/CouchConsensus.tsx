import React, { useState } from 'react'
import { ThumbsUp, X, Play, Star, Flame, CheckCircle, Eye, Sparkles, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useFocusable } from '../engine/useFocusable'
import { soundEffects } from '../engine/sound-effects'

export interface MediaItem {
  id: string
  title: string
  year: number
  rating: string
  runtime: string
  imdbScore: number
  rottenTomatoes: number
  mood: string
  synopsis: string
  streamingPlatform: 'Prime Video' | 'Netflix' | 'Max'
  backdropUrl: string
}

const SAMPLE_MEDIA: MediaItem[] = [
  {
    id: 'media-interstellar',
    title: 'Interstellar: The IMAX Cut',
    year: 2014,
    rating: 'PG-13',
    runtime: '2h 49m',
    imdbScore: 8.7,
    rottenTomatoes: 87,
    mood: 'Cosmic & Mind-Bending',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival across the dying stars.',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'media-dune2',
    title: 'Dune: Part Two',
    year: 2024,
    rating: 'PG-13',
    runtime: '2h 46m',
    imdbScore: 8.6,
    rottenTomatoes: 92,
    mood: 'Epic Sci-Fi Spectacle',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his noble house.',
    streamingPlatform: 'Max',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'media-blade-runner',
    title: 'Blade Runner 2049',
    year: 2017,
    rating: 'R',
    runtime: '2h 44m',
    imdbScore: 8.0,
    rottenTomatoes: 88,
    mood: 'Atmospheric Neo-Noir',
    synopsis: 'Young Blade Runner K unearths a long-buried secret that leads him to track down former Blade Runner Rick Deckard.',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'media-arrival',
    title: 'Arrival',
    year: 2016,
    rating: 'PG-13',
    runtime: '1h 56m',
    imdbScore: 7.9,
    rottenTomatoes: 94,
    mood: 'Intelligent First Contact',
    synopsis: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1600&q=80'
  }
]

export const CouchConsensus: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shortlisted, setShortlisted] = useState<MediaItem[]>([])
  const [winner, setWinner] = useState<MediaItem | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)

  const currentItem = SAMPLE_MEDIA[currentIndex % SAMPLE_MEDIA.length]

  const handleShortlist = () => {
    soundEffects.playSuccessChime()
    if (!shortlisted.some(item => item.id === currentItem.id)) {
      const updated = [...shortlisted, currentItem]
      setShortlisted(updated)
      if (updated.length >= 2) {
        // Trigger consensus victory
        setWinner(currentItem)
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        })
      }
    }
    setCurrentIndex(prev => prev + 1)
  }

  const handleSkip = () => {
    soundEffects.playBack()
    setCurrentIndex(prev => prev + 1)
  }

  const handleLockIn = (item: MediaItem) => {
    soundEffects.playSuccessChime()
    setWinner(item)
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    })
  }

  // 10-Foot Focusable Action Buttons
  const btnSkip = useFocusable<HTMLButtonElement>({
    id: 'btn-skip',
    group: 'consensus-actions',
    priority: 1,
    onSelect: handleSkip
  })

  const btnTrailer = useFocusable<HTMLButtonElement>({
    id: 'btn-trailer',
    group: 'consensus-actions',
    priority: 2,
    onSelect: () => setShowTrailer(true)
  })

  const btnLove = useFocusable<HTMLButtonElement>({
    id: 'btn-love',
    group: 'consensus-actions',
    priority: 3,
    onSelect: handleShortlist
  })

  const btnCloseWinner = useFocusable<HTMLButtonElement>({
    id: 'btn-close-winner',
    group: 'modal-actions',
    priority: 1,
    onSelect: () => setWinner(null)
  })

  return (
    <div className="consensus-screen tv-animate-in">
      {/* Dynamic Cinematic Hero Card */}
      <div 
        className="consensus-hero-card tv-glass-card"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(7, 9, 14, 0.95) 30%, rgba(7, 9, 14, 0.4) 100%), url(${currentItem.backdropUrl})`
        }}
      >
        <div className="hero-content">
          <div className="hero-badges">
            <span className="tv-badge badge-amber">{currentItem.streamingPlatform}</span>
            <span className="tv-badge badge-cyan">{currentItem.mood}</span>
            <span className="tv-badge">{currentItem.year}</span>
            <span className="tv-badge">{currentItem.runtime}</span>
          </div>

          <h1 className="hero-title">{currentItem.title}</h1>

          <div className="hero-ratings">
            <div className="rating-pill">
              <Star size={20} className="text-amber" fill="#FF9900" />
              <span className="rating-val">{currentItem.imdbScore}</span>
              <span className="rating-lbl">IMDb</span>
            </div>
            <div className="rating-pill">
              <Flame size={20} className="text-rose" fill="#F43F5E" />
              <span className="rating-val">{currentItem.rottenTomatoes}%</span>
              <span className="rating-lbl">Fresh</span>
            </div>
          </div>

          <p className="hero-synopsis">{currentItem.synopsis}</p>

          {/* 10-Foot Focusable Action Remote Bar */}
          <div className="action-buttons-row">
            <button ref={btnSkip.ref} className="action-tv-btn btn-pass" onClick={handleSkip}>
              <X size={28} />
              <span>Pass [◄ Left]</span>
            </button>

            <button ref={btnTrailer.ref} className="action-tv-btn btn-preview" onClick={() => setShowTrailer(true)}>
              <Play size={28} />
              <span>Preview Trailer</span>
            </button>

            <button ref={btnLove.ref} className="action-tv-btn btn-shortlist" onClick={handleShortlist}>
              <ThumbsUp size={28} />
              <span>Vote Yes [► Right]</span>
            </button>
          </div>
        </div>

        {/* Shortlist Sidebar (Live Couch Voting Status) */}
        <div className="shortlist-sidebar tv-glass-card-elevated">
          <div className="sidebar-header">
            <Sparkles size={22} className="text-cyan" />
            <h3>Couch Shortlist</h3>
            <span className="consensus-count-pill">{shortlisted.length} Votes</span>
          </div>

          {shortlisted.length === 0 ? (
            <div className="empty-shortlist">
              <p>No votes locked yet.</p>
              <span className="sub-instruction">Use ◄ / ► on Fire TV Remote to vote together.</span>
            </div>
          ) : (
            <div className="shortlisted-items-list">
              {shortlisted.map((item) => (
                <div key={item.id} className="shortlisted-item-row" onClick={() => handleLockIn(item)}>
                  <div className="shortlisted-info">
                    <span className="s-title">{item.title}</span>
                    <span className="s-meta">{item.runtime} • {item.streamingPlatform}</span>
                  </div>
                  <CheckCircle size={22} className="text-emerald" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WINNER CONSENSUS CELEBRATION MODAL */}
      {winner && (
        <div className="tv-modal-backdrop">
          <div className="consensus-winner-card tv-glass-card-elevated">
            <div className="trophy-glow">
              <Trophy size={68} className="text-amber" />
            </div>
            <span className="tv-badge badge-amber">Couch Consensus Reached!</span>
            <h2 className="winner-title">{winner.title}</h2>
            <p className="winner-details">
              Ready to stream on <strong className="text-amber">{winner.streamingPlatform}</strong> in 4K UHD.
            </p>

            <div className="winner-actions-row">
              <button ref={btnCloseWinner.ref} className="action-tv-btn btn-shortlist" onClick={() => setWinner(null)}>
                <Play size={26} fill="#000" />
                <span>Launch Stream Now [OK]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAILER MODAL */}
      {showTrailer && (
        <div className="tv-modal-backdrop" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal-content tv-glass-card">
            <div className="trailer-header">
              <h3>{currentItem.title} — Official Preview</h3>
              <button className="close-btn" onClick={() => setShowTrailer(false)}>Press [BACK] to Exit</button>
            </div>
            <div className="trailer-video-box">
              <div className="simulated-trailer-banner" style={{ backgroundImage: `url(${currentItem.backdropUrl})` }}>
                <div className="playback-pulse">
                  <Play size={72} className="text-cyan pulse" />
                  <span>Simulating Vega 4K Hardware-Accelerated Playback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .consensus-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .consensus-hero-card {
          flex: 1;
          display: flex;
          justify-content: space-between;
          background-size: cover;
          background-position: center;
          padding: 44px 52px;
          border-radius: 28px;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 60%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
        }

        .hero-badges {
          display: flex;
          gap: 12px;
        }

        .hero-title {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-2xl);
          font-weight: 800;
          line-height: 1.1;
          color: #FFFFFF;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
        }

        .hero-ratings {
          display: flex;
          gap: 20px;
        }

        .rating-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.45);
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rating-val {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-md);
          font-weight: 700;
          color: #FFFFFF;
        }

        .rating-lbl {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-secondary);
        }

        .hero-synopsis {
          font-size: var(--tv-text-md);
          line-height: 1.6;
          color: var(--tv-text-secondary);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
        }

        .action-buttons-row {
          display: flex;
          gap: 20px;
          margin-top: 14px;
        }

        .action-tv-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 32px;
          border-radius: 16px;
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-md);
          font-weight: 700;
          border: 2px solid transparent;
          transition: all var(--tv-duration-focus) var(--tv-ease-smooth);
        }

        .btn-pass {
          background: rgba(244, 63, 94, 0.18);
          color: #FF8BA7;
          border-color: rgba(244, 63, 94, 0.4);
        }

        .btn-preview {
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .btn-shortlist {
          background: var(--tv-accent-cyan);
          color: #07090E;
          border-color: var(--tv-accent-cyan);
          box-shadow: 0 4px 20px rgba(0, 242, 254, 0.4);
        }

        .shortlist-sidebar {
          width: 380px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding-bottom: 16px;
        }

        .sidebar-header h3 {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-lg);
          font-weight: 700;
        }

        .consensus-count-pill {
          background: rgba(0, 242, 254, 0.2);
          color: var(--tv-accent-cyan);
          padding: 4px 12px;
          border-radius: 100px;
          font-weight: 700;
          font-size: var(--tv-text-xs);
        }

        .empty-shortlist {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          color: var(--tv-text-muted);
        }

        .sub-instruction {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-secondary);
        }

        .shortlisted-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shortlisted-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }

        .s-title {
          display: block;
          font-weight: 700;
          font-size: var(--tv-text-sm);
        }

        .s-meta {
          font-size: var(--tv-text-xs);
          color: var(--tv-text-secondary);
        }

        .text-emerald {
          color: var(--tv-accent-emerald);
        }

        .tv-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .consensus-winner-card {
          width: 650px;
          padding: 50px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .trophy-glow {
          animation: trophy-bounce 1s infinite alternate;
        }

        @keyframes trophy-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }

        .winner-title {
          font-family: var(--tv-font-display);
          font-size: var(--tv-text-2xl);
          font-weight: 800;
        }

        .winner-details {
          font-size: var(--tv-text-md);
          color: var(--tv-text-secondary);
        }

        .trailer-modal-content {
          width: 85vw;
          height: 80vh;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .trailer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600;
        }

        .trailer-video-box {
          flex: 1;
          border-radius: 18px;
          overflow: hidden;
        }

        .simulated-trailer-banner {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .playback-pulse {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          background: rgba(0, 0, 0, 0.7);
          padding: 30px 50px;
          border-radius: 20px;
          border: 1px solid rgba(0, 242, 254, 0.3);
        }
      `}</style>
    </div>
  )
}
