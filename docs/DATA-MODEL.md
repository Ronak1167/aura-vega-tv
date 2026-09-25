# DATA MODEL — Data Structures and State
**Project:** Aura Vega TV
**Version:** 1.0.0
**Last Updated:** 2026-09-25

---

## 1. MEDIA CATALOG

### MediaItem
```typescript
interface MediaItem {
  id: string                    // Unique ID (e.g., "tt0120737" for TMDB/IMDB ref)
  title: string                 // Display title
  year: number                  // Release year
  runtime: number               // Runtime in minutes
  genre: string[]               // Genre tags
  mood: MoodCategory            // Primary mood classification
  synopsis: string              // 2-3 sentence description
  posterUrl: string             // Image URL (static asset or CDN)
  backdropUrl: string           // Wide backdrop for detail view
  trailerUrl: string | null     // MP4 URL for MSE VideoPlayer (null if unavailable)
  rating: number                // Rotten Tomatoes / IMDB score 0-100
  ratingSource: 'RT' | 'IMDB'
  streamingProviders: StreamingProvider[]
  imdbId?: string               // Optional external ID
}

type MoodCategory =
  | 'thrillers'
  | 'comedy'
  | 'scifi'
  | 'family'
  | 'romance'
  | 'documentary'
  | 'action'
  | 'horror'

interface StreamingProvider {
  name: string                  // "Prime Video", "Netflix", "Disney+"
  logoUrl: string               // Provider badge image
  deepLinkUrl?: string          // Future: direct launch URL
}
```

### MediaCatalog (src/data/media-catalog.json)
```typescript
interface MediaCatalog {
  version: string               // "1.0.0"
  lastUpdated: string           // ISO date string
  items: MediaItem[]
}
```

---

## 2. CONSENSUS STATE

```typescript
// ConsensusContext.tsx
interface ConsensusState {
  deck: MediaItem[]             // Full media catalog for current session
  shortlisted: string[]         // IDs of cards voted RIGHT (shortlisted)
  skipped: string[]             // IDs of cards voted LEFT (skipped)
  currentIndex: number          // Index of currently focused card in deck
  winner: MediaItem | null      // Set when consensus threshold reached
  phase: ConsensusPhase
  consensusThreshold: number    // Default: 3 (configurable)
}

type ConsensusPhase =
  | 'idle'      // No active voting session
  | 'voting'    // User is swiping cards
  | 'consensus' // Threshold reached, showing winner modal
  | 'watching'  // Trailer/video playing

type ConsensusAction =
  | { type: 'START_SESSION'; deck: MediaItem[] }
  | { type: 'SHORTLIST'; id: string }
  | { type: 'SKIP'; id: string }
  | { type: 'SET_WINNER'; item: MediaItem }
  | { type: 'RESET' }
  | { type: 'SET_PHASE'; phase: ConsensusPhase }
```

---

## 3. WEATHER STATE

```typescript
// WeatherContext.tsx
interface WeatherState {
  temperature: number | null    // Celsius
  feelsLike: number | null      // Celsius
  humidity: number | null       // Percentage 0-100
  condition: WeatherCondition | null
  conditionLabel: string | null // "Partly Cloudy", "Sunny", etc.
  windSpeed: number | null      // km/h
  airQualityIndex: number | null
  lastFetched: Date | null
  isLoading: boolean
  error: string | null
}

type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy'

type WeatherAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: Partial<WeatherState> }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'SIMULATE'; data: Partial<WeatherState> }
```

---

## 4. ALERT / DOORBELL STATE

```typescript
// AlertContext.tsx
interface Alert {
  id: string
  type: AlertType
  timestamp: Date
  label: string                 // "Motion Detected", "Package Arrived", "Doorbell Ring"
  cameraId: CameraId
  snapshotUrl: string | null    // Base64 or URL to camera frame
  isRead: boolean
}

type AlertType =
  | 'doorbell'
  | 'motion'
  | 'package_detected'
  | 'delivery_arrived'
  | 'smart_home'

type CameraId =
  | 'front_door'
  | 'driveway'
  | 'backyard'
  | 'living_room'

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  latestAlert: Alert | null
  isPipVisible: boolean         // Whether DoorbellPip overlay is shown
}

type AlertAction =
  | { type: 'ADD_ALERT'; alert: Alert }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'SHOW_PIP'; alertId: string }
  | { type: 'HIDE_PIP' }
  | { type: 'DISMISS_ALERT'; id: string }
```

---

## 5. AMBIENT / TIME-OF-DAY STATE

```typescript
// Computed from system time — not persisted in context
interface TimeOfDayTheme {
  phase: DayPhase
  gradientStart: string         // Hex color
  gradientEnd: string           // Hex color
  particleColor: string         // Hex color
  particleType: ParticleType
  ambientLabel: string          // "Good Morning", "Good Evening", etc.
}

type DayPhase =
  | 'dawn'          // 05:00 - 07:00
  | 'morning'       // 07:00 - 12:00
  | 'afternoon'     // 12:00 - 17:00
  | 'golden_hour'   // 17:00 - 19:00
  | 'twilight'      // 19:00 - 21:00
  | 'night'         // 21:00 - 05:00

type ParticleType =
  | 'stardust'      // Default night
  | 'sunbeams'      // Morning
  | 'dust_motes'    // Afternoon
  | 'embers'        // Golden hour
  | 'snowflakes'    // Optional winter seasonal
```

---

## 6. HEADLESS SERVICE STATE

The headless service communicates with the foreground app via `DeviceEventEmitter`.

### Events Emitted by Headless Service
```typescript
// Foreground listens via:
// DeviceEventEmitter.addListener('weather_update', handler)
// DeviceEventEmitter.addListener('doorbell_alert', handler)

interface WeatherUpdateEvent {
  type: 'weather_update'
  data: Partial<WeatherState>
}

interface DoorbellAlertEvent {
  type: 'doorbell_alert'
  alert: Alert
}
```

---

## 7. PERSISTENCE

### What is Persisted (AsyncStorage)
- `consensus_shortlist` — IDs of shortlisted items across sessions
- `weather_cache` — Last weather response with timestamp
- `user_preferences` — Preferred mood category, particle type override (P2)

### What is NOT Persisted
- In-progress voting session (resets on app restart)
- Alert read/unread state (only current session)
- Trailer playback position

---

## 8. MEDIA CATALOG SCHEMA (JSON)

Example entry in `src/data/media-catalog.json`:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-09-25",
  "items": [
    {
      "id": "mc001",
      "title": "The Midnight Algorithm",
      "year": 2024,
      "runtime": 112,
      "genre": ["Thriller", "Tech"],
      "mood": "thrillers",
      "synopsis": "A rogue AI begins predicting crimes 48 hours before they happen. One detective must decide whether to trust the machine or trust her instincts.",
      "posterUrl": "asset://posters/midnight-algorithm.jpg",
      "backdropUrl": "asset://backdrops/midnight-algorithm-wide.jpg",
      "trailerUrl": "https://cdn.auravega.tv/trailers/midnight-algorithm-720.mp4",
      "rating": 87,
      "ratingSource": "RT",
      "streamingProviders": [
        { "name": "Prime Video", "logoUrl": "asset://providers/prime.png" }
      ]
    }
  ]
}
```

---

*This document defines all data contracts.*
*Any addition or modification to data shapes requires updating this document before implementation.*
