# PRD — Product Requirements Document
**Project:** Aura Vega TV
**Version:** 2.0.0 (post-audit, RN rebuild)
**Platform:** Amazon Vega OS (React Native for Vega)
**Track:** Fire TV — Open Source Mini Challenge
**Last Updated:** 2026-09-25

---

## 1. EXECUTIVE SUMMARY

Aura Vega TV is a purpose-built living room ambient hub and co-viewing decision engine for Amazon Fire TV running Vega OS. It solves three universally recognized frictions of smart TV ownership:

1. **Decision Fatigue** — Families spend 20+ minutes deciding what to watch. Couch Consensus eliminates this with a rapid swipe-to-match voting system.
2. **Dead Screen Time** — TVs sit dark and unused most of the day. The Ambient Canvas turns the TV into a living room art piece with dynamic daylight and weather responsiveness.
3. **Living Room Blindness** — The TV is the biggest screen in the home but remains isolated from household context. The Glance Bar and Doorbell PiP bring front-door alerts, deliveries, and smart home state onto the main screen non-intrusively.

---

## 2. JUDGING CRITERIA ALIGNMENT

| Criterion | Weight | How We Win |
|---|---|---|
| Tech Implementation | 25% | Native React Native for Vega. Native Cartesian focus with TVFocusGuideView. W3C MSE/EME media. Valid manifest.toml with headless service. Official Vega SDK build chain. |
| Design | 25% | Strict 10-foot UI. 5% overscan margins. OLED dark palette. Kepler Carousel. Accessibility-compliant focus indicators (physical + scale). |
| Potential Impact | 25% | Addresses decision fatigue (universal UX problem). Monetizable via Alexa integration, Prime Video deep links, and Amazon smart home services. |
| Quality of Idea | 25% | Novel synthesis: ambient computing + co-viewing consensus + household IoT telemetry. First-party Vega OS showcase of all three simultaneously. |

---

## 3. PRODUCT OBJECTIVES

### Must-Have (P0 — Required for Submission)
- P0.1: App boots on Vega OS Emulator (VVD) within cold start KPI of 1.5s Time-to-First-Frame
- P0.2: Full D-Pad navigation reaches every interactive element with correct Cartesian focus
- P0.3: Ambient Canvas displays with animated daylight cycle (no crashes, no blank frames)
- P0.4: Couch Consensus deck is navigable and produces a winner result
- P0.5: Glance Bar shows clock and at least one live or simulated widget
- P0.6: manifest.toml with valid package ID, os.version, needs, wants, offers sections
- P0.7: Headless service registered and declared in manifest
- P0.8: Build succeeds via `npm run build:release` through Vega SDK
- P0.9: App packaged as genuine .vpkg via kepler CLI

### Should-Have (P1 — Strong Submission)
- P1.1: Doorbell PiP overlay with simulated camera snapshot and notification
- P1.2: Video trailer playback via W3C MSE VideoPlayer in Couch Consensus
- P1.3: Sound feedback on D-Pad navigation (RN audio API)
- P1.4: Weather widget with real or simulated data
- P1.5: Accessibility: closed caption settings bridge from OS
- P1.6: Smooth ambient particle animation via Animated/Reanimated (not Canvas)
- P1.7: VEGA-DX-FRICTION-LOG.md with genuine toolchain friction discoveries

### Nice-to-Have (P2 — Bonus Points)
- P2.1: Matter Casting integration (multi-screen handoff)
- P2.2: Alexa voice command hook (BACK key → Alexa launch)
- P2.3: Real TMDB API for actual media titles
- P2.4: Persistent user preferences via Vega storage API
- P2.5: Confetti animation on Couch Consensus match

---

## 4. USER PERSONAS

### Persona A: "The Decider" (Primary)
- Adult 25-45 years, shares TV with partner or family
- Pain: 15-30 minutes of "what do you want to watch?" every evening
- Gain: Couch Consensus converges to a shared pick in under 60 seconds via D-Pad swiping

### Persona B: "The Ambient User"
- Home office worker who uses the TV as background ambiance
- Pain: TV auto-powers off, plays screensavers with no personal relevance
- Gain: Ambient Canvas responds to local daylight, weather, and personal mood

### Persona C: "The Household Manager"
- Parent or homeowner who wants home awareness without a separate dashboard
- Pain: Checking phone for doorbell/deliveries while watching TV
- Gain: Glance Bar and Doorbell PiP surface household events on the main screen

---

## 5. FEATURE SPECIFICATIONS

### Module A: Ambient Canvas (AmbientCanvas component)
- Dynamic gradient background that transitions by time-of-day: Dawn, Morning, Afternoon, Golden Hour, Twilight, Night
- Particle simulation layer using React Native Animated API (not Canvas element)
- Large typographic clock readable from 3 meters (font size: minimum 72sp)
- Date display in secondary typography
- Transitions: 3-second crossfade between time-of-day states
- Performance target: maintains 60fps with particle simulation active

### Module B: Glance Bar (GlanceBar component)
- Top bar always visible except during full-screen media playback
- Widgets: Clock (primary), Weather (temperature + condition icon), Delivery tracker (simulated), Notification count
- Each widget is a discrete focusable Pressable for D-Pad traversal
- Widget width: auto-sized; minimum height: 48dp (a11y compliance)
- Data refresh: Weather every 30 minutes (or simulated on a timer)

### Module C: Couch Consensus (CouchConsensus component)
- Media deck of 12-20 curated titles organized by mood categories
- D-Pad RIGHT = Shortlist (add to shared pool)
- D-Pad LEFT = Skip (remove from pool)
- D-Pad UP = Expand (full details: synopsis, rating, runtime, streaming provider)
- D-Pad SELECT = Open detail modal
- Consensus fires when 3+ titles are shortlisted (configurable)
- Winner modal: title, poster, synopsis, runtime, rating, streaming provider badge
- Trailer launch: W3C MSE VideoPlayer opens in full-screen

### Module D: Doorbell PiP (DoorbellPip component)
- Simulated front-door event trigger (button in debug UI or timed auto-trigger for demo)
- Slide-in PiP overlay from top-right, 320x180px at 10-foot safe area
- Camera snapshot placeholder with timestamp and event type label (Motion, Doorbell, Package Detected)
- 4-second auto-dismiss with D-Pad SELECT to expand
- D-Pad BACK to dismiss manually

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Cold start Time-to-First-Frame: less than 1.5 seconds
- Warm start Time-to-First-Frame: less than 0.5 seconds
- Time-to-Fully-Drawn: less than 8 seconds (cold), less than 1.5 seconds (warm)
- Foreground memory: less than 400 MiB
- Background memory (headless service): less than 150 MiB
- UI Fluidity: greater than 99% (no dropped frames under D-Pad navigation)
- D-Pad response latency: less than 200ms from keydown to focus change
- Key press latency during video: less than 100ms

### Accessibility
- All interactive elements: minimum 48x48dp touch target
- Focus indicators: must include physical change (border, scale) — color alone is insufficient
- Caption settings: bridge from Vega OS `@amazon-devices/kepler-a11y-settings-interface-turbo`
- Audio description: read OS preference and adjust media accordingly
- All text: minimum 18sp for body, 24sp for navigation labels, 72sp for clock

### Platform Compliance
- Package ID: `com.auravega.tv` (reverse domain, lowercase, globally unique)
- OS version: min = "1.2", target = "1.2"
- React and React Native: declared as peerDependencies only — NOT bundled
- Build: `npm run build:release` only — no custom bundlers
- Deployment: `kepler device install-app --dir .`

---

## 7. OUT OF SCOPE (V1)

- Real user accounts or authentication
- Real-time multiplayer voting (Couch Consensus is local/simulated multi-user)
- Prime Video or streaming service API integration (legal/time constraint)
- Push notification system (simulated only)
- Physical Alexa device integration (architecture prepared, not implemented)

---

## 8. SUCCESS METRICS (DEMO DAY)

- Judge can navigate entire app with only D-Pad keys (no mouse/touch)
- Couch Consensus produces a winning pick within 90 seconds of demo start
- Doorbell PiP triggers during demo without crashing
- App builds and runs on Vega Virtual Device (VVD) or Fire TV hardware
- VEGA-DX-FRICTION-LOG.md delivers actionable feedback to Amazon toolchain team

---

*This document is the source of truth for all feature decisions.*
*Any implementation that conflicts with this PRD requires a PRD update first.*
