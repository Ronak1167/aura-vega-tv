# COMPONENT CATALOG
**Project:** Aura Vega TV
**Version:** 1.0.0
**Platform:** React Native for Vega
**Last Updated:** 2026-09-25

---

## COMPONENT REGISTRY

---

### COMP-001: AmbientCanvas
**File:** `src/screens/AmbientScreen/AmbientCanvas.tsx`
**Purpose:** Full-screen animated background that transitions through time-of-day gradient themes and renders ambient particle simulations.

**Props:**
```typescript
interface AmbientCanvasProps {
  theme: TimeOfDayTheme
  isActive: boolean             // Pause animation when screen is unfocused
}
```

**Behavior:**
- Renders a full-screen LinearGradient (using react-native-linear-gradient or RN Animated View)
- Animates gradient colors on theme change using Animated.Value interpolation
- Spawns 20-40 particle nodes (AmbientParticle components) floating across the screen
- Pauses all animations when `isActive` is false (performance — no animation when off-screen)
- Theme transitions: 2-second crossfade

**Performance Notes:**
- All particle transform/opacity animations: `useNativeDriver: true`
- Color interpolation: JS driver (unavoidable) — only triggers on theme change, not per-frame
- Particle count: 20 for 1080p, 30 for 4K (capped by device capability query)

**Does NOT contain any focusable elements.**

---

### COMP-002: GlanceBar
**File:** `src/screens/AmbientScreen/GlanceBar.tsx`
**Purpose:** Always-visible top bar with clock, weather, and alert widgets. Every widget is independently focusable.

**Props:**
```typescript
interface GlanceBarProps {
  weather: WeatherState
  alerts: AlertState
  onWidgetSelect?: (widgetId: string) => void
}
```

**Focus Nodes (Cartesian):**
- F1: ClockWidget (position: left)
- F2: WeatherWidget (position: center-left)
- F3: AlertWidget (position: center-right)
- F4: SettingsWidget (position: right, P2)

**Sub-Components:**
- `ClockWidget` — updates every second via setInterval in useEffect
- `WeatherWidget` — temperature + condition icon from WeatherContext
- `AlertWidget` — unread count badge + latest alert label
- `SettingsWidget` — opens SettingsScreen (P2)

**Dimensions:** height 80dp, full screen width, 80dp horizontal padding.

---

### COMP-003: DoorbellPip
**File:** `src/screens/AmbientScreen/DoorbellPip.tsx`
**Purpose:** Slide-in picture-in-picture overlay for doorbell and household alert events.

**Props:**
```typescript
interface DoorbellPipProps {
  alert: Alert | null
  isVisible: boolean
  onDismiss: () => void
  onExpand: () => void
}
```

**Behavior:**
- Position: absolute, top-right corner (within safe area)
- Slides in from right edge using Animated translateX
- Auto-dismisses after 4 seconds via useEffect timeout
- D-Pad SELECT: calls onExpand()
- D-Pad BACK: calls onDismiss()
- Shows: camera ID label, event type, timestamp, snapshot placeholder

**Focus:** Single focusable Pressable wrapping the entire PiP card. Focus is NOT trapped.

**Dimensions:** 320dp width x 180dp height (16:9).

---

### COMP-004: MediaDeck (Kepler Carousel)
**File:** `src/screens/ConsensusScreen/MediaDeck.tsx`
**Purpose:** Horizontally scrolling deck of media cards using Kepler Carousel with built-in focus management.

**Props:**
```typescript
interface MediaDeckProps {
  items: MediaItem[]
  currentIndex: number
  onShortlist: (id: string) => void
  onSkip: (id: string) => void
  onOpenDetail: (item: MediaItem) => void
}
```

**Carousel Configuration:**
```typescript
// Kepler Carousel — NOT FlatList
<Carousel
  orientation="horizontal"
  itemDimensions={CARD_DIMENSIONS}
  getItemForIndex={(index) => <MediaCard item={items[index]} ... />}
  keyProvider={(index) => items[index].id}
  focusIndicator="floating"
/>
```

**D-Pad Overrides (registered via TVEventHandler or onKeyDown):**
- LEFT: skip current card
- RIGHT: shortlist current card
- UP: open DetailModal for current card
- SELECT: open DetailModal

---

### COMP-005: MediaCard
**File:** `src/screens/ConsensusScreen/MediaCard.tsx`
**Purpose:** Single TV-optimized media card showing poster, title, and rating. Animates on focus.

**Props:**
```typescript
interface MediaCardProps {
  item: MediaItem
  isFocused: boolean
  onShortlist: () => void
  onSkip: () => void
  onOpenDetail: () => void
}
```

**Dimensions:** 200dp x 300dp (2:3 portrait poster).

**Focus Behavior:**
- onFocus: scale to 1.08, show 3dp cyan border, elevate to shadow level 2
- onBlur: scale to 1.0, remove border, remove shadow
- All via Animated.Value with useNativeDriver: true

**Accessibility:**
- accessibilityLabel: `{item.title}, {item.year}, rated {item.rating}%`
- accessibilityRole: 'button'
- Focus indicator: border (3dp) + scale — not color only (Vega a11y requirement)

---

### COMP-006: DetailModal
**File:** `src/screens/ConsensusScreen/DetailModal.tsx`
**Purpose:** Full detail overlay for a selected media item. Shows backdrop, synopsis, rating, streaming providers, trailer button.

**Props:**
```typescript
interface DetailModalProps {
  item: MediaItem
  isVisible: boolean
  onClose: () => void
  onWatchTrailer: (url: string) => void
  onShortlist: () => void
}
```

**Focus Behavior:**
- Modal opens: FocusManager.focus(watchTrailerRef)
- Focus trapped inside modal (TVFocusGuideView)
- D-Pad BACK: onClose()
- Focus nodes: [Watch Trailer] [Shortlist] [Close]

**Layout:**
- Backdrop image: full-width, 260dp tall, with bottom gradient overlay
- Metadata: title (36sp/bold), year + runtime + genre chips
- Synopsis: 18sp, max 4 lines
- Provider badges: horizontal Carousel of logos
- Action buttons: Watch Trailer (primary), Shortlist / Remove, Close

---

### COMP-007: WinnerModal
**File:** `src/screens/ConsensusScreen/WinnerModal.tsx`
**Purpose:** Congratulations overlay when Couch Consensus threshold is reached.

**Props:**
```typescript
interface WinnerModalProps {
  winner: MediaItem
  shortlistCount: number
  isVisible: boolean
  onWatchNow: () => void
  onTryAnother: () => void
}
```

**Focus Nodes:** [Watch Now] (default focus), [Try Another]
**Focus:** Trapped inside modal. D-Pad BACK = Try Another.

---

### COMP-008: TrailerPlayer
**File:** `src/screens/ConsensusScreen/TrailerPlayer.tsx`
**Purpose:** Full-screen video player using W3C MSE VideoPlayer from @amazon-devices/react-native-w3cmedia.

**Props:**
```typescript
interface TrailerPlayerProps {
  url: string
  isVisible: boolean
  onClose: () => void
}
```

**Implementation:**
```typescript
import { VideoPlayer } from '@amazon-devices/react-native-w3cmedia'

// Cleanup on unmount is CRITICAL
useEffect(() => {
  return () => {
    videoRef.current?.pause()
    // Reset src to release media resources
  }
}, [])
```

**Focus:** Single focusable surface. D-Pad BACK: pause and close. D-Pad SELECT: play/pause toggle.
**Error Handling:** MEDIA_ERR_NETWORK, MEDIA_ERR_DECODE, MEDIA_ERR_SRC_NOT_SUPPORTED — show fallback UI.

---

### COMP-009: FocusableCard (Shared)
**File:** `src/components/FocusableCard.tsx`
**Purpose:** Reusable Pressable wrapper that implements the standard Vega focus indicator pattern.

**Props:**
```typescript
interface FocusableCardProps {
  children: React.ReactNode
  onSelect?: () => void
  onFocusChange?: (isFocused: boolean) => void
  style?: ViewStyle
  accessibilityLabel: string
}
```

**Pattern:**
- Uses `onFocus` and `onBlur` props of `Pressable`
- Manages local Animated.Value for scale and border opacity
- Passes `isFocused` to children via context or render prop
- Ensures `useNativeDriver: true` for all animated values

---

### COMP-010: FocusGuide (Shared)
**File:** `src/components/FocusGuide.tsx`
**Purpose:** Thin wrapper over TVFocusGuideView to declare explicit focus zones.

**Props:**
```typescript
interface FocusGuideProps {
  destinations?: React.RefObject<any>[]
  children: React.ReactNode
  style?: ViewStyle
}
```

---

### COMP-011: AmbientParticle (Shared)
**File:** `src/components/AmbientParticle.tsx`
**Purpose:** Single animated floating particle in the ambient canvas.

**Props:**
```typescript
interface AmbientParticleProps {
  color: string
  startX: number
  startY: number
  size: number        // 2-8dp
  duration: number    // 6000-12000ms random
}
```

**Animation:** Animated.loop with sequence: fade in → drift to random end position → fade out → restart.
All animations: `useNativeDriver: true`.

---

*Component Catalog is the implementation blueprint.*
*Every component listed here maps to exactly one file in src/*
*No undocumented components may be added without updating this catalog.*
