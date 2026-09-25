# Aura Vega TV — System Specification

**Project:** Aura Vega TV  
**Track:** Fire TV (Amazon Vega OS)  
**Mini-Challenge:** Open Source Mini Challenge  
**Specification Version:** 1.0.0  
**Target Device Profile:** 1080p / 4K UHD Fire TV (10-Foot Lean-Back Interface)  
**Input Mode:** 5-Way Directional D-Pad (Up, Down, Left, Right, Select/Enter, Back, Play/Pause)  

---

## 1. Executive Summary & Value Proposition
Aura Vega TV is a purpose-built living room ambient canvas and contextual co-viewing hub designed for Amazon's next-generation **Vega OS**. 

Most smart TV interfaces treat the television as an oversized tablet with dense, cluttered grids that require exhausting navigation. Aura Vega TV reimagines the living room screen around three core tenets:
1. **The Ambient Canvas:** When not actively watching video, the TV becomes an atmospheric, living information artwork with dynamic daylight cycles, weather telemetry, and glanceable micro-widgets.
2. **Couch Consensus:** Eliminates 20-minute streaming decision fatigue through an intuitive, rapid-convergence movie and show selector engineered specifically for remote-control navigation.
3. **Living Room Telemetry & Glance:** A non-intrusive Picture-in-Picture (PiP) status bar bringing front-door events, delivery updates, and household alerts onto the big screen without disrupting the entertainment experience.

---

## 2. Target Platform & Constraints
- **Operating System:** Amazon Vega OS (Linux microkernel runtime, `.vpkg` package format).
- **Display Resolution:** 1920x1080 reference canvas (scaled dynamically to 3840x2160 for 4K displays).
- **Overscan & TV Safe Area:** 
  - Title Safe Zone: 90% inner boundary (80px horizontal padding, 60px vertical padding).
  - Action Safe Zone: 95% boundary.
  - Zero critical interactive elements placed within the outer 5% overscan margin.
- **Color Space:** High-contrast OLED dark palette (`#0B0E17` base, `#141A29` card surface, `#00E5FF` electric cyan focus halo, `#FF9900` Amazon amber accent).
- **Navigation Latency:** <16ms response time on D-pad key events (60fps spatial focus movement).

---

## 3. Core Feature Modules

### Module A: Spatial D-Pad Focus Engine
* **Spatial Traversal:** Strict Cartesian coordinate navigation (`Up`, `Down`, `Left`, `Right`) mapping adjacent focusable DOM nodes.
* **Focus Indicator:** 3px luminous glow outline with `scale(1.08)` card elevation and smooth bezier transition (`cubic-bezier(0.2, 0.9, 0.3, 1.0)`).
* **Keyboard / Remote Keybindings:**
  * `ArrowUp` / `KeyCode 38` / Remote DPAD_UP: Move focus up
  * `ArrowDown` / `KeyCode 40` / Remote DPAD_DOWN: Move focus down
  * `ArrowLeft` / `KeyCode 37` / Remote DPAD_LEFT: Move focus left
  * `ArrowRight` / `KeyCode 39` / Remote DPAD_RIGHT: Move focus right
  * `Enter` / `KeyCode 13` / Remote DPAD_CENTER: Activate / Select
  * `Escape` / `Backspace` / `KeyCode 27` / Remote BACK: Back navigation / Dismiss modal
  * `Space` / `KeyCode 32` / Remote PLAY_PAUSE: Ambient toggle / Playback control

### Module B: Ambient Living Canvas (Ambient Mode 2.0)
* Dynamic gradient mesh that subtle shifts based on local time of day (Dawn, Daylight, Golden Hour, Twilight, Midnight).
* Ambient Particle Simulation (soft snowfall, rain shimmer, starlight particles, or solar dust).
* Glanceable Clock & Date with large typographic hierarchy readable from 15 feet.
* Real-time Local Weather Telemetry (temperature, humidity, air quality, condition icon).
* Contextual Quote & Art Mood Cards.

### Module C: "Couch Consensus" Media Discovery Engine
* Curated media decks categorized by mood (e.g., "Edge-of-Your-Seat Thrillers", "Cozy Weekend Comfort", "Mind-Bending Sci-Fi", "Family Night Laughs").
* 10-Foot Fast Vote Deck: D-pad Right (Shortlist) vs. D-pad Left (Skip) vs. D-pad Up (Deep Details).
* Instant Consensus Modal: Displays the winning pick with runtime, Rotten Tomatoes / IMDb scores, synopsis, and streaming provider badges.
* Integrated Video Preview Trailer player with full-screen playback.

### Module D: Front-Door Glance & Household Telemetry
* Simulated front-door doorbell / motion alert popover in top-right corner.
* Live snapshot preview with camera telemetry (Front Porch, Driveway, Living Room).
* Smart home quick toggles (Living Room Lights, Night Mode, Climate Preset).

---

## 4. Technical Architecture
```
aura-vega-tv/
├── .gsd/                      # GSD Autonomous State & Wave History
├── src/
│   ├── engine/
│   │   ├── spatial-focus.ts   # 10-foot D-pad spatial focus engine
│   │   ├── remote-keys.ts     # Fire TV remote keybinding mapping
│   │   └── sound-effects.ts   # Web Audio UI click & focus chime synthesizer
│   ├── components/
│   │   ├── AmbientCanvas.tsx  # Generative ambient particle background
│   │   ├── GlanceBar.tsx      # Top bar with clock, weather, telemetry
│   │   ├── CouchConsensus.tsx # Fast-voting media convergence deck
│   │   ├── MediaCard.tsx      # High-performance 10-foot media card with focus halo
│   │   ├── DoorbellPip.tsx    # Front-door telemetry popover
│   │   └── QuickControls.tsx  # Living room quick toggles
│   ├── styles/
│   │   ├── tokens.css         # 10-foot TV color, typography, elevation tokens
│   │   └── tv-layout.css      # Safe-zone grid, overscan padding, focus animations
│   ├── App.tsx                # Root TV navigation coordinator
│   └── main.tsx               # Entrypoint
├── docker/
│   ├── Dockerfile.vega        # Linux container for Vega Developer Tools (VDT)
│   └── docker-compose.yml     # Containerized build & packaging harness
├── docs/
│   ├── ARCHITECTURE.md        # Deep architectural design & trade-offs
│   ├── VEGA-DX-FRICTION-LOG.md# Amazon Developer Tools feedback report (Judging Secret Weapon)
│   └── DEMO-SCRIPT.md         # 3-minute video recording walkthrough script
├── package.json
├── SPEC.md
└── ROADMAP.md
```

---

## 5. Judging Criteria Alignment
1. **Technical Implementation (25%):** Native Vega OS toolchain integration via Docker, flawless 60fps spatial focus engine, Web Audio audio feedback, and clean modular TypeScript architecture.
2. **Design (25%):** Strict compliance with Amazon 10-foot UI design principles, high-contrast OLED palette, 5% overscan margins, and Stitch-designed card layouts.
3. **Potential Impact (25%):** Solves the real-world friction of living room indecision and turns the unused TV into a valuable ambient home canvas.
4. **Quality of the Idea (25%):** Novel synthesis of ambient computing, co-viewing consensus, and front-door IoT awareness on Amazon's flagship new OS.
5. **Product Feedback Bonus:** Complete `VEGA-DX-FRICTION-LOG.md` delivering actionable feedback on Vega Developer Tools and `@amazon-devices/amazon-devices-buildertools-mcp`.
