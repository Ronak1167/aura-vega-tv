# SYSTEM DESIGN — Detailed System Design
**Project:** Aura Vega TV
**Version:** 1.0.0
**Last Updated:** 2026-09-25

---

## 1. SYSTEM OVERVIEW

Aura Vega TV is a single-device app that runs entirely on the Fire TV device with Vega OS. There is no cloud backend, no user account, and no external API required for V1. All computation is local. Network access (optional) is used only for weather data and trailer streaming.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VEGA OS DEVICE (Fire TV)                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AURA VEGA TV APP (.vpkg)                                           │   │
│  │                                                                     │   │
│  │  ┌──────────────────┐      ┌─────────────────────────────────────┐ │   │
│  │  │  Headless Service│      │  Foreground App                     │ │   │
│  │  │  (background JS  │◄────►│  (React Native for Vega)            │ │   │
│  │  │   thread)        │      │                                     │ │   │
│  │  │                  │      │  ┌───────────┐   ┌───────────────┐  │ │   │
│  │  │  • WeatherFetch   │      │  │AmbientScr │   │ConsensusScr   │  │ │   │
│  │  │  • DoorbellSim    │      │  │           │   │               │  │ │   │
│  │  │  • CacheWarm      │      │  │• Canvas   │   │• MediaDeck    │  │ │   │
│  │  └──────────────────┘      │  │• GlanceBar│   │• DetailModal  │  │ │   │
│  │           │                 │  │• PiP      │   │• TrailerPlay  │  │ │   │
│  │     DeviceEventEmitter      │  └───────────┘   └───────────────┘  │ │   │
│  │           │                 │         │                │           │ │   │
│  │           │                 │  ┌──────▼──────────────▼──────────┐ │ │   │
│  │           └─────────────────►  │     AppProvider (Contexts)      │ │ │   │
│  │                             │  │  ConsensusContext               │ │ │   │
│  │                             │  │  WeatherContext                 │ │ │   │
│  │                             │  │  AlertContext                   │ │ │   │
│  │                             │  └────────────────────────────────┘ │ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  VEGA OS SYSTEM SERVICES (shared libraries)                         │   │
│  │  • React + React Native runtime (system-provided)                   │   │
│  │  • FocusManager (Cartesian D-Pad routing)                           │   │
│  │  • MediaServer (com.amazon.media.server)                            │   │
│  │  • DRM services                                                     │   │
│  │  • A11y settings (kepler-a11y-settings-interface-turbo)             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LOCAL STORAGE (AsyncStorage)                                       │   │
│  │  @aura/weather_cache | @aura/consensus_shortlist | @aura/user_prefs │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
              │                                          │
              ▼                                          ▼
    ┌─────────────────┐                    ┌─────────────────────┐
    │  Open-Meteo API │                    │  CDN / Static MP4   │
    │  (Weather V2)   │                    │  Trailer Files      │
    │  (V1: simulated)│                    │  (V1: bundled/local)│
    └─────────────────┘                    └─────────────────────┘
```

---

## 2. STARTUP SEQUENCE

```
T=0ms    App process starts (Vega OS launches .vpkg)
T=0ms    Headless Service starts (separate JS thread)
T=0ms    index.js: enableScreens(), enableFreeze()
T=0ms    index.js: registerRootComponent(App)

T=~50ms  HeadlessService: checks AsyncStorage for weather cache
         If cache valid (< 30 min): emits aura.weather_update immediately
         If stale: initiates background weather fetch

T=~100ms Foreground App: AppProvider mounts (ConsensusContext, WeatherContext, AlertContext)
T=~100ms NavigationContainer renders with initial route: AmbientScreen
T=~200ms AmbientScreen renders (GlanceBar + AmbientCanvas)
T=~200ms >>> TIME-TO-FIRST-FRAME target: < 1500ms <<<
T=~500ms AmbientCanvas particle animation starts
T=~800ms ConsensusScreen lazy-loaded in background (not visible)
T=~1000ms Weather data available (from cache) → WeatherWidget updates
T=~8000ms >>> TIME-TO-FULLY-DRAWN target: < 8000ms <<<
```

---

## 3. VOTING SESSION LIFECYCLE

```
USER ENTERS CONSENSUS SCREEN
          │
          ▼
     [ConsensusContext dispatches START_SESSION]
     deck = shuffled MediaCatalog
     phase = 'voting'
          │
          ▼
     [MediaDeck renders Carousel with first card focused]
          │
     ┌────┴──────────────────────────────┐
     │                                   │
  D-Pad RIGHT                       D-Pad LEFT
  [SHORTLIST action]                [SKIP action]
  shortlisted.push(id)              skipped.push(id)
  currentIndex++                    currentIndex++
     │                                   │
     └────────────┬──────────────────────┘
                  │
                  ▼
         Check: shortlisted.length >= consensusThreshold (3)?
                  │
            YES ──┤         NO
                  │          └── Next card focused
                  ▼
         [SET_WINNER action]
         winner = shortlisted items → pick first (or most-voted)
         phase = 'consensus'
                  │
                  ▼
         [WinnerModal renders]
         Focus: "Watch Now" button
                  │
          ┌───────┴──────────┐
          │                  │
     Watch Now           Try Another
          │                  │
          ▼                  ▼
  [TrailerPlayer]    [RESET action]
                     deck reshuffled
                     phase = 'voting'
```

---

## 4. DOORBELL PIP SEQUENCE

```
HeadlessService (background)
    │
    │ (every N seconds in demo, or on real event in V2)
    ▼
DeviceEventEmitter.emit('aura.doorbell_alert', { alert: Alert })

Foreground App (AlertContext listener)
    │
    ▼
dispatch({ type: 'ADD_ALERT', alert })
dispatch({ type: 'SHOW_PIP', alertId: alert.id })
    │
    ▼
AlertContext.isPipVisible = true
    │
    ▼
DoorbellPip renders (Animated.Value translateX: screen width → 0)
    │
    ├── 4 seconds elapse → dispatch({ type: 'HIDE_PIP' }) → dismiss
    │
    └── D-Pad SELECT → onExpand() (future: open full camera view)
        D-Pad BACK → onDismiss() → dispatch({ type: 'HIDE_PIP' })
```

---

## 5. MEDIA PLAYBACK SEQUENCE

```
User: SELECT on "Watch Trailer"
    │
    ▼
TrailerPlayer renders with isVisible=true, url=item.trailerUrl
    │
    ▼
VideoPlayer (from @amazon-devices/react-native-w3cmedia) mounts
    │
    ▼
<VideoPlayer
  ref={videoRef}
  src={url}             ← URL mode (MP4) or MSE mode (DASH)
  autoPlay={true}
  onError={handleError}
  style={styles.fullScreen}
/>
    │
    ▼
Video loads → KPIViz measures Time-to-First-Video-Frame
    │
    ├── D-Pad SELECT: videoRef.current.paused ? play() : pause()
    │
    └── D-Pad BACK:
            videoRef.current.pause()
            // Reset src to release DRM license and media resources
            TrailerPlayer.isVisible = false
            Focus returns to WinnerModal / DetailModal

// CRITICAL: cleanup in useEffect return
useEffect(() => {
  return () => {
    videoRef.current?.pause()
    videoRef.current?.removeAttribute?.('src')
  }
}, [])
```

---

## 6. ACCESSIBILITY FLOW

```
App starts
    │
    ▼
GlanceBar mounts
    │
    ▼
import { useA11ySettings } from '@amazon-devices/kepler-a11y-settings-interface-turbo'
captionSettings = useA11ySettings('captions')
audioDescPref = useA11ySettings('audioDescription')
    │
    ▼
TrailerPlayer:
  if (audioDescPref.preferred) {
    // Select audio description track from MSE manifest
    videoRef.current.selectAudioTrack('audio_description')
  }
    │
    ▼
Caption overlay:
  if (captionSettings.enabled) {
    // Render WebVTT captions with captionSettings.style applied
  }
```

---

## 7. ERROR HANDLING

| Error | Detection | Recovery |
|---|---|---|
| Weather fetch failure | catch in WeatherService.fetchCurrent() | Use cached data; emit error state; widget shows last known |
| Trailer load failure | VideoPlayer onError with MEDIA_ERR_* codes | Show fallback UI "Trailer Unavailable" with detail text |
| Media catalog missing | try/catch in MediaDataService.getCatalog() | Show empty Consensus with error message and retry button |
| Headless service crash | Vega OS auto-restarts headless services | App continues with stale cached data |
| Focus lost (no focused element) | FocusManager returns null current focus | FocusEngine.focusFirst(rootRef) called from useEffect |
| PiP appears with null alert | Guard in DoorbellPip: if (!alert) return null | PiP simply doesn't render |

---

*System Design is the implementation blueprint for all engineers.*
*Sequence diagrams represent the authoritative flow — implementation must match.*
