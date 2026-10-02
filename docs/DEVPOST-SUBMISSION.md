# Devpost Submission — Aura Vega TV

**Hackathon**: Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary Track**: Fire TV — Amazon Vega OS  
**Mini-Challenge**: None (Not Claimed)  
**Application Title**: Aura Vega TV — Living Room Ambient Hub & Co-Viewing Consensus Engine  
**Tagline**: Eliminate the 20-minute "what should we watch?" decision fatigue on Fire TV with an explainable multi-viewer consensus engine and instant playback.

---

## Elevator Pitch

Every evening, couples, roommates, and families spend 20 minutes aimlessly browsing through fragmented streaming apps before settling on something mediocre or giving up entirely. **Aura Vega TV** solves this living room stalemate. Built natively on Amazon’s next-generation **Vega OS** for Fire TV, Aura blends ambient circadian home presence with a deterministic **Couch Consensus** engine. In seconds, it aggregates multi-viewer preferences, evaluates critical ratings, factors in real-world environmental context (time, weather, bedtime limits), and delivers an explainable, unanimous recommendation that streams immediately with one click.

---

## The Problem: Living Room Decision Fatigue

The living room television is inherently a shared, multi-person device, but current streaming apps treat it as a single-user smartphone on a wall.
1. **The 20-Minute Stalemate**: Co-viewers spend 15–25 minutes endlessly scrolling through carousels.
2. **Polarized Preferences**: Viewer A wants Sci-Fi, Viewer B wants Comedy, and someone has an absolute veto on Horror. Current recommendation systems cannot reconcile conflicting group constraints.
3. **Black-Box AI Skepticism**: Generic "Top Picks for You" lists don't explain *why* something was recommended, leading to endless debate and skepticism.
4. **Energy Waste & Screen Burn**: Idle TVs either sit on high-power stagnant menus or black screens, wasting the living room's central visual surface.

---

## The Solution: Aura Vega TV

Aura Vega transforms the living room TV into an intelligent, ambient command hub:
- **Circadian Ambient Mode**: When not watching, Aura serves as a low-power, atmospheric living canvas featuring time-of-day circadian light cycles (Dawn, Daylight, Sunset, Cosmic Midnight), real-time weather glance, and household presence badges.
- **Couch Consensus Engine**: With a click of the Fire TV remote, viewers toggle active household members. The deterministic scoring engine analyzes preferences, checks vetoes, scores critical acclaim (Rotten Tomatoes & IMDb), and applies environmental context.
- **Explainable "Why This?" Intelligence**: Viewers see plain-English explanations in under 5 seconds (e.g., *"Unanimous match across all active viewers • Fits late-night 2-hour window • 94% Rotten Tomatoes"*).
- **Zero-Friction Playback**: A single press of **Select** launches full-screen streaming via Vega's native W3C hardware media player.

---

## Key Features

1. **Deterministic Multi-Factor Scoring Engine**:
   - $S_{\text{total}} = 0.35 \cdot \text{Affinity} + 0.25 \cdot \text{Quality} + 0.25 \cdot \text{Context} + 0.15 \cdot \text{Runtime} - \text{Penalty}$
   - Handles multi-viewer consensus, explicit vetoes, and tie-breaking without cloud latency.
2. **Native 10-Foot TV Experience**:
   - Custom 2D spatial navigation with 3px cyan focus rings (`#00E5FF`) and 1.05 scale transforms.
   - Smooth horizontal shelf scrolling powered by `@amazon-devices/vega-carousel` v2.
3. **Hardware Video Player with Closed Captions**:
   - Full-screen `KeplerVideoSurfaceView` and `VideoPlayer` pipeline via `@amazon-devices/react-native-w3cmedia`.
   - Native closed caption integration compliant with Vega OS accessibility standards.
4. **Headless Background Personalization**:
   - Headless background service (`service.js`) running under `react_native_kepler_4` pre-computes recommendations while the TV is idle.
5. **Static Hermes Bytecode Performance**:
   - Compiles directly to Static Hermes bytecode v96, eliminating JIT compilation overhead for sub-second cold starts.

---

## How We Built It (Technical Implementation)

- **Target OS**: Amazon Vega OS SDK 0.24 (Kepler platform).
- **Core Runtime**: React Native 0.83 on Vega OS with dual application targets:
  - UI Target: `com.amazon.kepler.runtime.react_native_kepler_4` (`index.js`)
  - Headless Target: `com.amazon.kepler.runtime.react_native_kepler_4` (`service.js` under process group `main_and_service`)
- **Manifest Architecture**: Strict `manifest.toml` declaring permissions, capabilities, categories, and dual runtime configurations.
- **Build Pipeline**: Metro v0.83 with Kepler compatibility configuration, emitting standalone JS bundles, source maps, and compiled Static Hermes bytecode.
- **Test Engineering**: 12 automated Jest test suites with 74 unit tests verifying scoring math across 7 distinct conflict scenarios (unanimous, conflicting, veto, tie, context shift, bedtime window, and zero-match fallback) and 15 adversarial QA edge-case boundary tests.

---

## Amazon Technologies & SDKs Integrated

| Technology | Implementation in Aura Vega TV |
| :--- | :--- |
| **Vega OS SDK 0.24** | Manifest architecture (`manifest.toml`) and native platform packaging. |
| **`@amazon-devices/react-native-kepler`** | Vega React Native runtime platform. |
| **`@amazon-devices/react-native-w3cmedia`** | Native hardware `KeplerVideoSurfaceView` and headless `VideoPlayer`. |
| **`@amazon-devices/vega-carousel`** | TV Carousel v2 with `CarouselItemDataAdapter`. |
| **`@amazon-devices/kepler-cli-platform`** | Metro bundler plugin and Static Hermes compiler. |
| **`@amazon-devices/kepler-a11y-settings-interface-turbo`** | System accessibility and closed caption styling TurboModule bridge. |

---

## Challenges We Overcame

1. **Path-with-Spaces Windows Metro Bug**:
   - Discovered that `@amazon-devices/kepler-compatibility-metro-config/dist/src/utils.js` failed to execute Metro plugins when user paths contain spaces (e.g. `C:\Users\Ronak Jain`). Diagnosed the root cause and patched the command invocation with proper quoting and `node` prefix.
2. **Windows Hermes Compiler Missing Binary**:
   - The default `@amazon-devices/kepler-cli-platform` threw `Unsupported host OS: win32` during Hermes compilation. We resolved this by linking `hermesc.exe` from `hermes-compiler/hermesc/win64-bin`, enabling native Windows bytecode generation.
3. **Carousel v2 Typing Incompatibilities**:
   - Migrated from legacy FlatList to the official Vega Carousel v2, resolving TypeScript constraints by implementing `CarouselItemDataAdapter<MediaItem, string>` with strict key extraction.

---

## Accomplishments We're Proud Of

- **100% Deterministic & Honest**: We built a genuine multi-viewer consensus engine with zero fabricated metrics, zero fake AI wrappers, and zero hallucinations.
- **Rigorous Scenario Testing**: 74 automated tests across 12 test suites verifying complex living room dynamics, including majority vetoes, tie-breaking, and late-night bedtime constraints.
- **Production-Grade Release Pipeline**: Clean Metro release bundling, Static Hermes bytecode compilation, native Vega SDK VPT packaging, and zero-warning TypeScript verification.

---

## What's Next for Aura Vega TV

1. **Household Voice Profiles**: Allowing Alexa voice integration on Fire TV remotes to recognize individual voices and automatically set active co-viewers.
2. **Watch History Sync**: Real-time cross-device sync to prevent recommending movies someone has already watched.
3. **Live Streaming Deep-Linking**: Direct catalog deep-linking into Amazon Prime Video, Netflix, and Max apps via Vega OS intent URIs.

---

## Repository & Open-Source Links

- **Repository**: [https://github.com/Ronak1167/aura-vega-tv](https://github.com/Ronak1167/aura-vega-tv)
- **License**: MIT Open Source License
- **Documentation**: Full architecture, API contracts, design system, and scenario validations available in `/docs`.
- **Submission Deadline**: October 23, 2026 at 12:00 PM PDT / 2:00 PM CDT / 3:00 PM EDT (Oct 24, 2026 at 12:30 AM IST)
- **Demo Video**: *[REQUIRED — Upload ≤3-minute YouTube or Vimeo public video and paste link here before submitting]*

---

## Track & Mini-Challenge Eligibility Notes

- **Primary Track**: Fire TV — Amazon Vega OS
- **Mini-Challenge**: None (Not Claimed)
- **Eligibility Rationale**: The Open Source mini-challenge requires an *additional*, distinct open-source contribution during the hackathon window beyond the primary project repository itself. To adhere strictly to competition guidelines and avoid any ambiguity or disqualification risk, we submit solely to the primary Fire TV track.
