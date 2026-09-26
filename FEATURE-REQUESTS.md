# Feature Requests & Product Roadmap

**Application**: Aura Vega TV (`com.auravega.tv`)  
**Sprint**: 4 — Submission Readiness  
**Scope**: High-signal feature improvements for both the Aura Vega TV product itself and the Amazon Vega OS platform SDK.

---

## Section A: Aura Vega TV Product Roadmap

### A-001 — Alexa Voice Voter Selection
**Priority**: High  
**Rationale**: Toggling active household viewers via a Fire TV remote is smooth, but voice is the most natural input for a living room.  
**Proposed Behaviour**: Alexa integration allows "Alexa, add Partner" or "Alexa, we're watching tonight" to automatically populate the active voter list based on identified voice profiles.  
**Technical Approach**: Alexa Skills Kit custom intent + Vega OS intent service receiver.

---

### A-002 — Watch History Cross-Device Sync
**Priority**: High  
**Rationale**: The current catalog scoring cannot prevent recommending a title someone in the household has already watched (separately or on a different device/platform).  
**Proposed Behaviour**: A lightweight async sync layer (backed by Amazon DynamoDB or Cognito-linked profile) marks titles as `watched`, reducing their affinity score by 50% and injecting a neutral explainability note.  
**Technical Approach**: AWS Amplify DataStore or direct DynamoDB sync with Fire TV account token.

---

### A-003 — Live Streaming Platform Deep-Linking
**Priority**: High  
**Rationale**: Currently, "Watch Now" launches the native Vega W3C VideoPlayer with open-license sample MP4 streams. Real value requires deep-linking into the actual streaming apps (Amazon Prime Video, Netflix, Max) using their platform URIs.  
**Proposed Behaviour**: The catalog maps each title to a platform URI scheme (e.g. `https://www.primevideo.com/detail/[titleID]`). "Watch Now" resolves the URI via Vega OS `Linking.openURL()` or a registered intent, opening the title in the respective app.  
**Technical Approach**: Vega OS external app launching via Kepler's `react-native-kepler` Linking module.

---

### A-004 — Smart Evening Mode & Idle Screensaver
**Priority**: Medium  
**Rationale**: Aura's Ambient Canvas runs continuously, but has no low-power idle strategy for reducing power draw during extended idle periods (e.g. 3+ hours of no interaction).  
**Proposed Behaviour**: After 45 minutes of inactivity, the particle density reduces to 10% and the background canvas dims to 20% luminance. After 90 minutes, it transitions to a WLED-style minimal single-colour mode.  
**Technical Approach**: Background heartbeat timer in the headless service triggering a context ambient state change.

---

### A-005 — Contextual Soonest Available Broadcast
**Priority**: Medium  
**Rationale**: "Watch Now" assumes a title is always available on the listed platform. In practice, licensing rotates.  
**Proposed Behaviour**: Catalog entries are augmented with expiry metadata. Items expiring in < 7 days receive a `⏰ Leaving Soon` badge in the carousel, increasing urgency weight in the scoring formula by +10.  
**Technical Approach**: Curated date metadata fields in `media-catalog.json` updated on a monthly cadence.

---

### A-006 — Multi-Language Caption Support
**Priority**: Medium  
**Rationale**: `CaptionOverlay.tsx` currently renders a single English caption cue. Living room households are often multilingual.  
**Proposed Behaviour**: The video player reads caption track metadata from the W3C `VideoPlayer`'s text tracks API and exposes a language picker in the TV Settings screen.  
**Technical Approach**: Extend `@amazon-devices/react-native-w3cmedia` text track API integration and add the language picker to `SettingsScreen.tsx`.

---

### A-007 — Real-Time Open TV API Catalog Refresh
**Priority**: Low  
**Rationale**: Current catalog is a 12-item curated static JSON. A production deployment should dynamically refresh the catalogue from an external catalog service (e.g. JustWatch API, TMDB, or an Amazon-hosted catalog endpoint).  
**Proposed Behaviour**: The headless background service fetches updated catalog items once daily, merges them into local AsyncStorage, and notifies the UI via Vega's inter-process event bridge.  
**Technical Approach**: Headless `fetch()` + AsyncStorage catalog versioning inside `ContentPersonalizationHeadlessService.ts`.

---

## Section B: Amazon Vega OS Platform Feature Requests

### B-001 — Cross-Platform Vega Virtual Device (VVD)
**Priority**: Critical  
**Rationale**: There is currently no simulator or emulator for Windows or macOS developers. The `run-vega` CLI command is explicitly marked as unimplemented. This is the single largest barrier preventing Vega from reaching the broad developer community.  
**Request**: Release an official cross-platform desktop Vega Virtual Device compatible with Windows, macOS, and Linux that mirrors the physical Vega OS experience including D-pad input simulation, Kepler runtime, and video surface rendering.

---

### B-002 — `@amazon-devices/kepler-media-controls` Pre-Built OSD Package
**Priority**: High  
**Rationale**: Every application building a video player needs to re-implement the same OSD controls: play/pause button, seek bar, time display, back navigation, and caption toggle.  
**Request**: Release an official TV-optimized `@amazon-devices/kepler-media-controls` package that provides opinionated but customizable 10-foot OSD control components pre-wired to the `VideoPlayer` API.

---

### B-003 — Official Jest Mock Exports for All TurboModules
**Priority**: High  
**Rationale**: `@amazon-devices/kepler-a11y-settings-interface-turbo` (and likely all TurboModules) are unavailable in headless Jest environments, requiring developers to author custom mocks.  
**Request**: Add a standard `moduleNameMapper` configuration and `__mocks__` export to all `@amazon-devices/*-turbo` packages, similar to how React Native's official packages provide `./__mocks__/react-native.js`.

---

### B-004 — Windows Build Support for `kepler-cli-platform`
**Priority**: High  
**Rationale**: Two critical bugs block all Windows Vega development out-of-the-box (see FL-001 and FL-002 in `FRICTION-LOG.md`). Windows is the dominant developer OS globally and Vega should be a first-class citizen there.  
**Request**: Ship Windows-compatible versions of Metro plugin invocations and a properly integrated `win64-bin/hermesc.exe` binary resolution path inside `kepler-cli-platform`.

---

### B-005 — Carousel v2 Empty State Support
**Priority**: Medium  
**Rationale**: When a carousel's data adapter returns `getItemCount() === 0`, the component renders an invisible empty container with no built-in placeholder, leading to broken-looking UI without additional defensive rendering.  
**Request**: Add an optional `emptyComponent?: React.ReactNode` prop to `Carousel` that renders a TV-appropriate empty-state message or visual when no items are available.

---

### B-006 — Vega OS Deep-Linking Intent Documentation
**Priority**: Medium  
**Rationale**: There are no documented examples of launching an external app or content URI from a Vega OS application via intent.  
**Request**: Publish official documentation and a sample showing how to use Kepler's `Linking.openURL()` to deep-link into other Vega OS apps, including the expected URI schema for Amazon Video, Prime Video, and other first-party platforms.
