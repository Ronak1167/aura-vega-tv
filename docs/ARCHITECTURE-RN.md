# ARCHITECTURE — System Architecture
**Project:** Aura Vega TV
**Version:** 2.0.0 (post-audit, React Native for Vega)
**Last Updated:** 2026-09-25

---

## 1. PLATFORM ARCHITECTURE

Aura Vega TV runs on Vega OS using React Native for Vega. The OS provides React, React Native, and core system services as shared libraries. The app only bundles feature code.

```
VEGA OS
├── System Services (OS-provided)
│   ├── FocusManager (Cartesian D-Pad routing)
│   ├── MediaServer (com.amazon.media.server)
│   ├── DRM (com.amazon.drm.key, com.amazon.drm.crypto)
│   ├── Audio (system audio service)
│   └── A11y (kepler-a11y-settings-interface-turbo)
├── Shared Libraries (system-provided, NOT bundled)
│   ├── react (React 19)
│   └── react-native (RN 0.83 / Static Hermes)
└── App Container (.vpkg)
    ├── JS Bundle (Metro-bundled, Hermes bytecode)
    ├── manifest.toml
    ├── assets/
    └── Headless Service JS module
```

---

## 2. APPLICATION DIRECTORY STRUCTURE

```
aura-vega-tv/
├── manifest.toml                     # Vega OS app manifest (REQUIRED)
├── package.json                      # RN dependencies (NO react/react-native as deps)
├── babel.config.js                   # Babel with @babel/plugin-transform-react-jsx
├── metro.config.js                   # Metro bundler config
├── tsconfig.json                     # TypeScript (strict mode)
├── index.js                          # RN app entry point (not index.html)
│
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Root NavigationContainer + enableScreens
│   │   ├── RootNavigator.tsx         # Stack navigator (Ambient, Consensus, Settings)
│   │   └── AppProvider.tsx           # Global context providers
│   │
│   ├── screens/
│   │   ├── AmbientScreen/            # Main living room ambient view
│   │   │   ├── AmbientScreen.tsx
│   │   │   ├── AmbientCanvas.tsx     # Animated gradient + particle system
│   │   │   ├── GlanceBar.tsx         # Top widget bar (clock, weather, alerts)
│   │   │   └── DoorbellPip.tsx       # PiP overlay for front-door events
│   │   │
│   │   ├── ConsensusScreen/          # Couch Consensus voting flow
│   │   │   ├── ConsensusScreen.tsx
│   │   │   ├── MediaDeck.tsx         # Kepler Carousel of media cards
│   │   │   ├── MediaCard.tsx         # Single focusable TV media card
│   │   │   ├── DetailModal.tsx       # Expanded media detail overlay
│   │   │   ├── WinnerModal.tsx       # Consensus winner reveal
│   │   │   └── TrailerPlayer.tsx     # W3C MSE VideoPlayer wrapper
│   │   │
│   │   └── SettingsScreen/           # App settings (optional P2)
│   │       └── SettingsScreen.tsx
│   │
│   ├── services/
│   │   ├── HeadlessService.ts        # Required by Vega OS; background sync
│   │   ├── WeatherService.ts         # Weather data fetch (simulated or API)
│   │   └── MediaDataService.ts       # Media catalog (static JSON or TMDB)
│   │
│   ├── engine/
│   │   ├── FocusEngine.ts            # Thin wrapper over Vega FocusManager
│   │   └── remote-keys.ts            # Fire TV remote keycode constants
│   │
│   ├── components/
│   │   ├── FocusableCard.tsx         # Reusable TV card with onFocus/onBlur handlers
│   │   ├── FocusGuide.tsx            # TVFocusGuideView wrapper
│   │   ├── SoundFeedback.tsx         # RN audio feedback on navigation events
│   │   └── AmbientParticle.tsx       # Single Animated particle node
│   │
│   ├── context/
│   │   ├── ConsensusContext.tsx      # Voting state (shortlist, skipped, winner)
│   │   ├── WeatherContext.tsx        # Weather telemetry state
│   │   └── AlertContext.tsx          # Doorbell / household alerts state
│   │
│   ├── styles/
│   │   ├── tokens.ts                 # Design system constants (colors, spacing, typography)
│   │   └── tv-layout.ts              # 10-foot safe zone helpers, overscan padding
│   │
│   ├── data/
│   │   └── media-catalog.json        # Curated media titles for Couch Consensus
│   │
│   └── utils/
│       ├── time-of-day.ts            # Map local time to ambient theme
│       └── format.ts                 # Date, time, temperature formatters
│
├── assets/
│   ├── image/
│   │   └── app-icon.png              # 512x512 PNG (required by manifest)
│   └── fonts/                        # Custom fonts if used
│
├── docker/
│   ├── Dockerfile.vega               # Ubuntu 24.04 + Vega SDK + Node 20
│   └── docker-compose.yml            # Mount source, expose Metro port 8081
│
└── docs/                             # All 16 foundation documents
```

---

## 3. NAVIGATION ARCHITECTURE

```
App Entry (index.js)
└── enableScreens() + enableFreeze()
└── NavigationContainer (@amazon-devices/react-navigation__native)
    └── RootStack (createStackNavigator from @amazon-devices/react-navigation__stack)
        ├── AmbientScreen (initial route)
        │   └── DoorbellPip (overlay, not a screen route)
        ├── ConsensusScreen
        │   ├── DetailModal (modal presentation)
        │   └── TrailerPlayer (full-screen modal)
        └── SettingsScreen (P2)
```

---

## 4. FOCUS MANAGEMENT ARCHITECTURE

Vega OS uses **Cartesian focus management** at the native layer. Focus moves based on weighted distance calculations from the currently focused element's center point.

### Rules
- `Button`, `Pressable`, `TouchableOpacity`, `TouchableHighlight` — focusable by default
- `View`, `Text`, `Image` — NOT focusable by default; set `focusable={true}` explicitly
- Focus indicators MUST include physical changes (border width, scale transform) — color/opacity alone fails a11y
- Use `TVFocusGuideView` to define explicit focus zones and constrain D-Pad movement
- Use `FocusManager.focus(ref)` for programmatic focus (e.g., after modal opens)

### Focus Zone Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  GlanceBar Focus Zone (TVFocusGuideView)                                │
│  [Clock Widget] [Weather Widget] [Alerts Widget]                        │
├─────────────────────────────────────────────────────────────────────────┤
│  Content Focus Zone (TVFocusGuideView)                                  │
│  [Ambient Canvas — no focusable children]                               │
│  [Consensus Deck — Kepler Carousel with MediaCards]                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Bottom Nav Focus Zone (TVFocusGuideView) [P2]                          │
│  [Ambient] [Consensus] [Settings]                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. MEDIA ARCHITECTURE

### Video Playback Stack
```
ConsensusScreen → TrailerPlayer
└── VideoPlayer (from @amazon-devices/react-native-w3cmedia)
    ├── URL Mode: MP4 flat file (simple trailers)
    └── MSE Mode: DASH/HLS stream with Shaka Player integration
        └── DRM: requires com.amazon.drm.key + com.amazon.drm.crypto in manifest [wants]
```

### manifest.toml Media Declarations
```toml
[wants]
"com.amazon.media.server" = { version = "*" }
"com.amazon.drm.key" = { version = "*" }
"com.amazon.drm.crypto" = { version = "*" }
```

---

## 6. HEADLESS SERVICE ARCHITECTURE

Vega OS requires a headless service for content personalization and background operations.

### Service Responsibilities
- Pre-fetch weather data every 30 minutes
- Check for simulated doorbell events (polling)
- Cache media catalog data for fast launch
- Report telemetry to OS (app health)

### manifest.toml Service Declaration
```toml
[offers]
"com.auravega.tv.headless" = { version = "1.0" }
```

### Implementation
- `src/services/HeadlessService.ts` — runs on a separate JS thread
- Communicates with foreground app via React Native DeviceEventEmitter

---

## 7. STATE MANAGEMENT

### Context Hierarchy
```
AppProvider
├── WeatherContext    (weather state + refresh interval)
├── AlertContext      (doorbell events, delivery status)
└── ConsensusContext  (shortlist, skipped, winner, votingActive)
```

### Key State Shapes

WeatherState:
- temperature (number | null)
- condition (string | null)
- humidity (number | null)
- lastFetched (Date | null)

AlertState:
- alerts (Alert[])
- unreadCount (number)
- latestAlert (Alert | null)

ConsensusState:
- deck (MediaItem[])
- shortlisted (string[])
- skipped (string[])
- winner (MediaItem | null)
- phase: 'voting' | 'consensus' | 'winner'

---

## 8. PERFORMANCE ARCHITECTURE

All KPI targets from official Vega documentation:

| KPI | Target | Implementation |
|---|---|---|
| Cold start TTFF | less than 1.5s | Lazy load ConsensusScreen; Ambient loads first |
| Warm start TTFF | less than 0.5s | enableFreeze() freezes offscreen screens |
| TTFD cold | less than 8s | Defer weather API call until after first paint |
| Foreground memory | less than 400 MiB | Image downsampling, cache eviction |
| Background memory | less than 150 MiB | Headless service: no UI, no image cache |
| UI Fluidity | greater than 99% | All animations: useNativeDriver: true |
| Focus response | less than 200ms | Native FocusManager, no JS bridge for focus |

---

## 9. BUILD ARCHITECTURE

### Development Build Flow
```
1. Start Docker container (Ubuntu 24.04 + Vega SDK)
2. npm start (Metro Bundler on port 8081)
3. kepler device port-forward --port 8081 --forward false
4. kepler device install-app --dir . (debug build)
5. kepler device launch-app --dir .
6. Fast Refresh active for .tsx file saves
```

### Release Build Flow
```
1. npm run build:release
2. Vega SDK packages as genuine .vpkg
3. kepler device install-app --dir . (installs .vpkg)
4. KPI measurement: vega exec perf kpi-visualizer
```

---

*This document supersedes the original ARCHITECTURE.md.*
*The original ARCHITECTURE.md (Vite/React) is preserved for reference only — it is invalid for Vega OS.*
