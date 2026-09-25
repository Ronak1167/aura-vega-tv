# 3-Minute Hackathon Demo Scenario — Aura Vega TV

**Project:** Aura Vega TV (`com.auravega.tv`)  
**Track:** Amazon Developer Hackathon 2026 — Fire TV / Vega OS  
**Evaluation Target:** 3 Minutes (Pitch & Live Walkthrough)  
**Execution Type:** 100% Deterministic (Remote D-Pad Navigation)  

---

## 1. Demo Arc Timeline

```
0:00 ─── 0:30 ─── The Problem & Ambient Living Room Hub
0:30 ─── 1:15 ─── Couch Consensus & Group Preference Matching
1:15 ─── 2:00 ─── Scoring Engine & "Why This?" Explainability
2:00 ─── 2:40 ─── Seamless W3C Video Playback & 10-ft Controls
2:40 ─── 3:00 ─── Vega Platform Architecture & Technical Differentiation
```

---

## 2. Step-by-Step Script & D-Pad Actions

### Scene 1: The Problem & The Ambient Canvas (0:00 – 0:30)
- **Visual:** TV launches into `AmbientScreen`. Dynamic daylight gradient, subtle floating particles, large typographic clock, live weather telemetry (`Seattle, WA • 68°F • Rainy`), and the Glance Bar.
- **Narrative:**
  > *"Every evening, families sit in front of the TV and spend 20 minutes scrolling through menus asking 'what do you want to watch?' Meanwhile, smart TVs sit dark and useless most of the day. Aura Vega TV turns the TV into an intelligent ambient living room hub that actively solves co-viewing decision fatigue."*
- **Action:** D-Pad RIGHT to the `🎬 Start Co-Viewing` CTA &rarr; Press `SELECT`.

---

### Scene 2: Multi-Viewer Consensus & D-Pad Browsing (0:30 – 1:15)
- **Visual:** Transitions smoothly into `ConsensusScreen`.
  - Top header highlights: `COUCH CONSENSUS • 2 Voters Active (Ronak & Family)`.
  - Active weather context: `Rainy Evening • Seattle, WA`.
  - Mood selector pills: `All`, `Sci-Fi`, `Blockbuster`, `Drama`, etc.
  - Horizontal Vega Carousel displaying media cards with real-time match badges: `94% MATCH`, `89% MATCH`, etc.
- **Narrative:**
  > *"Instead of endless tile grids, Couch Consensus surfaces curated options scored across both active viewers. Ronak loves Sci-Fi and Action; Family enjoys Sci-Fi and Blockbusters. Cards immediately display an intelligent match percentage."*
- **Action:**
  - D-Pad RIGHT through cards: notice `94% MATCH` on *Interstellar* and *Dune: Part Two*.
  - Press `SELECT` on *Interstellar*: opens `DetailModal` showing cast, 4K HDR tags, and synopsis.
  - Press `SELECT` on `Add to Shortlist` &rarr; Tally updates to `Shortlisted: 1 / 3`.
  - Shortlist *Dune: Part Two* and *Arrival* (or press `⚡ Evaluate Consensus Now`).

---

### Scene 3: The Scoring Climax & "Why This?" Explainability (1:15 – 2:00)
- **Visual:** `WinnerModal` animates onto the screen with golden glow and trophy banner.
  - Winner: **Interstellar: The IMAX Cut** (or Arrival based on runtime context).
  - Badge: `94% CONSENSUS MATCH`.
  - **"WHY AURA RECOMMENDED THIS" Panel:**
    - `✓ Unanimous match: All 2 viewers enjoy this genre`
    - `✓ Atmospheric cozy vibe matches today's overcast weather`
    - `✓ Ideal prime-time evening feature`
    - `✓ Critical favorite (87% Rotten Tomatoes • 8.7 IMDb)`
    - Sub-score breakdown cards: `Affinity 95%`, `Quality 87%`, `Context 90%`, `Runtime 88%`.
- **Narrative:**
  > *"Aura doesn't just guess or pick a random movie. Our deterministic Scoring Engine calculated voter affinity across both viewers, factored in today's rainy evening context, verified runtime compatibility, and presents the exact mathematical reasoning to the household."*
- **Action:** Primary TV focus is automatically on `[▶ Watch Now (Prime Video)]`. Press `SELECT`.

---

### Scene 4: Native W3C Video Playback & TV Controls (2:00 – 2:40)
- **Visual:** Launches full-screen `VideoPlayerScreen` powered by `KeplerVideoSurfaceView` and `@amazon-devices/react-native-w3cmedia`.
  - Video streams smoothly.
  - Pressing D-Pad brings up the TV On-Screen Display (OSD): scrubber timeline, ±10s seek buttons, play/pause indicator.
  - Accessibility closed captions render with styles bridged from the Vega OS accessibility TurboModule.
- **Narrative:**
  > *"Decision immediately turns into consumption. Playback is rendered via Vega's native W3C Video Surface view with hardware-accelerated decoding. Controls are completely tailored for 10-foot remote interaction, and captions automatically follow system accessibility settings."*
- **Action:**
  - Press D-Pad RIGHT/LEFT to seek ±10 seconds.
  - Press D-Pad SELECT to toggle Pause/Play.
  - Wait 4 seconds &rarr; OSD smoothly auto-hides.
  - Press remote `BACK` button &rarr; Returns cleanly to Consensus / Ambient Hub.

---

### Scene 5: Vega Platform Architecture & Close (2:40 – 3:00)
- **Visual:** Return to Ambient Screen &rarr; Navigate to `Settings` &rarr; Show Vega OS Diagnostics:
  - Package ID: `com.auravega.tv`
  - Engine: Static Hermes (React Native 0.83 Bridgeless)
  - Headless Service: `com.auravega.tv.headless` (Active background pre-computation)
- **Narrative:**
  > *"Under the hood, Aura Vega TV is built specifically for Fire TV running Vega OS. It features a declared headless service in manifest.toml that pre-scores recommendations in the background, official Vega Carousel v2 with anchored focus, and compiles directly into static Hermes bytecode for sub-second startup."*
