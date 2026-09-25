# API CONTRACTS — Internal Service and Data Interfaces
**Project:** Aura Vega TV
**Version:** 1.0.0
**Last Updated:** 2026-09-25

---

## 1. WEATHER SERVICE API

### Interface: `WeatherService`
**File:** `src/services/WeatherService.ts`

```typescript
export interface WeatherServiceResponse {
  temperature: number         // Celsius
  feelsLike: number           // Celsius
  humidity: number            // Percentage 0-100
  condition: WeatherCondition
  conditionLabel: string
  windSpeed: number           // km/h
  airQualityIndex: number     // 0-500 (AQI standard)
  timestamp: Date
}

export interface WeatherService {
  fetchCurrent(location?: string): Promise<WeatherServiceResponse>
  simulateCurrent(overrides?: Partial<WeatherServiceResponse>): WeatherServiceResponse
}
```

**Implementation Strategy (V1 Hackathon):**
- V1: `simulateCurrent()` — returns seeded fake data based on time-of-day
- V2 (post-hackathon): `fetchCurrent()` using Open-Meteo free API (no key required)
- Refresh interval: 30 minutes (triggered by HeadlessService timer)
- Cache: stored in AsyncStorage with TTL check on app foreground

**Simulated Data Spec:**
- Morning (07:00-12:00): Sunny, 22°C, 45% humidity
- Afternoon (12:00-17:00): Partly Cloudy, 28°C, 35% humidity
- Evening (17:00-21:00): Clear, 20°C, 55% humidity
- Night (21:00-07:00): Clear Night, 15°C, 65% humidity
- Override: any condition can be forced via `simulateCurrent({ condition: 'rainy' })`

---

## 2. MEDIA DATA SERVICE API

### Interface: `MediaDataService`
**File:** `src/services/MediaDataService.ts`

```typescript
export interface MediaDataService {
  getCatalog(): Promise<MediaItem[]>
  getCatalogByMood(mood: MoodCategory): Promise<MediaItem[]>
  getItemById(id: string): Promise<MediaItem | null>
  shuffleDeck(items: MediaItem[]): MediaItem[]
}
```

**Implementation Strategy:**
- V1: Static JSON (`src/data/media-catalog.json`) — no network call
- V2 (post-hackathon): TMDB API integration
- `getCatalog()`: Loads from bundled JSON, returns all items
- `getCatalogByMood()`: Filters by `item.mood === mood`
- `shuffleDeck()`: Fisher-Yates shuffle for random card order per session

---

## 3. HEADLESS SERVICE API

### Internal Contract
**File:** `src/services/HeadlessService.ts`

The headless service is a standalone module that runs on a separate JS context (as declared in `manifest.toml`). Communication with the foreground app is via `DeviceEventEmitter`.

```typescript
// Events the headless service EMITS:
const EVENTS = {
  WEATHER_UPDATE: 'aura.weather_update',
  DOORBELL_ALERT: 'aura.doorbell_alert',
  CACHE_READY: 'aura.cache_ready',
} as const

// Payloads
interface WeatherUpdatePayload {
  event: 'aura.weather_update'
  data: WeatherServiceResponse
}

interface DoorbellAlertPayload {
  event: 'aura.doorbell_alert'
  alert: Alert
}

// Foreground app subscribes:
DeviceEventEmitter.addListener(EVENTS.WEATHER_UPDATE, (payload: WeatherUpdatePayload) => {
  dispatch({ type: 'FETCH_SUCCESS', data: payload.data })
})
```

**Headless Service Responsibilities:**
1. On start: pre-fetch weather, store in AsyncStorage
2. Every 30 minutes: re-fetch weather, emit `WEATHER_UPDATE`
3. Every 10 seconds (demo mode): randomly trigger doorbell simulation, emit `DOORBELL_ALERT`
4. On stop: clear all timers, flush pending writes

**Note:** In V1 (hackathon), doorbell alerts are simulated on a random timer. In V2, this would connect to Ring/Alexa smart home events via Vega OS system intents.

---

## 4. FOCUS ENGINE API

### Interface: `FocusEngine`
**File:** `src/engine/FocusEngine.ts`

A thin abstraction layer over Vega's native `FocusManager` and `TVFocusGuideView`.

```typescript
import { findNodeHandle } from 'react-native'
// TVFocusGuideView and FocusManager are provided by Vega OS RN runtime

export const FocusEngine = {
  // Programmatically move focus to a ref
  focusRef(ref: React.RefObject<any>): void {
    const handle = findNodeHandle(ref.current)
    if (handle) {
      // @ts-ignore — FocusManager is Vega-system-provided, not typed
      FocusManager.focus(handle)
    }
  },

  // Focus the first child of a container
  focusFirst(containerRef: React.RefObject<any>): void {
    // Implementation uses TVFocusGuideView destinations pattern
  }
}
```

**Usage Pattern:**
```typescript
// When DetailModal opens:
useEffect(() => {
  if (isVisible) {
    FocusEngine.focusRef(watchTrailerButtonRef)
  }
}, [isVisible])
```

---

## 5. REMOTE KEYS API

### Keycode Constants
**File:** `src/engine/remote-keys.ts`

```typescript
export const RemoteKeys = {
  DPAD_UP:      'up',
  DPAD_DOWN:    'down',
  DPAD_LEFT:    'left',
  DPAD_RIGHT:   'right',
  DPAD_CENTER:  'select',
  BACK:         'back',
  PLAY_PAUSE:   'playPause',
  MENU:         'menu',
  HOME:         'home',
} as const

// Vega OS fires TV remote events via TVEventHandler
// Usage in components:
import { TVEventHandler } from 'react-native'

const handler = new TVEventHandler()
handler.enable(componentRef, (cmp, evt) => {
  switch (evt.eventType) {
    case RemoteKeys.DPAD_LEFT:  onSkip(); break
    case RemoteKeys.DPAD_RIGHT: onShortlist(); break
    case RemoteKeys.DPAD_UP:    onOpenDetail(); break
    case RemoteKeys.BACK:       onBack(); break
  }
})
// Always disable in componentWillUnmount / useEffect cleanup
handler.disable()
```

---

## 6. DEVICEMEMITTER CHANNEL REGISTRY

All event channel names are registered here to prevent naming collisions.

| Channel | Direction | Payload | Frequency |
|---|---|---|---|
| `aura.weather_update` | Headless → Foreground | WeatherUpdatePayload | Every 30 minutes |
| `aura.doorbell_alert` | Headless → Foreground | DoorbellAlertPayload | On event (random in V1) |
| `aura.cache_ready` | Headless → Foreground | { status: 'ready' } | Once at startup |

---

## 7. ASYNCSTORAGE KEY REGISTRY

| Key | Type | Description | TTL |
|---|---|---|---|
| `@aura/weather_cache` | WeatherServiceResponse | Last successful weather response | 30 minutes |
| `@aura/consensus_shortlist` | string[] | Shortlisted media IDs | Session (cleared on new session) |
| `@aura/user_prefs` | UserPreferences | Mood preference, particle override | Persistent |

---

*All internal contracts must be honored across module boundaries.*
*Changing a contract requires updating this document and all downstream consumers.*
