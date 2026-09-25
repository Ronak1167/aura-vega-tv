# Aura Vega TV — System Architecture & Technical Deep-Dive

**Document Version:** 1.0.0  
**Target Platform:** Amazon Fire TV (Vega OS Runtime)  
**Host Simulation:** Docker Linux Container / Chromium TV Engine (1920x1080 @ 60fps)  

---

## 1. High-Level Architectural Flow

```
                      +---------------------------------------+
                      |       Fire TV Hardware / Remote       |
                      |  DPAD_UP / DOWN / LEFT / RIGHT / OK   |
                      +-------------------+-------------------+
                                          | Keydown Events
                                          v
                      +---------------------------------------+
                      |      Remote Key Mapper Module         |
                      |        (src/engine/remote-keys.ts)    |
                      +-------------------+-------------------+
                                          | Normalized Actions
                                          v
+-----------------------------------------------------------------------------+
|                      Spatial Focus Engine (60 FPS)                          |
|                     (src/engine/spatial-focus.ts)                           |
|                                                                             |
|  * 2D Cartesian Coordinate Projection & Nearest-Neighbor Search              |
|  * Orthogonal Axis Drift Suppression (2.8x Penalty Matrix)                  |
|  * Dynamic Active Node Subscription & Luminous Glow Elevation               |
|  * Zero-Latency Web Audio Acoustic Feedback (Tick / Chime / Knock)          |
+-------------------------------------+---------------------------------------+
                                      | Focused State
                                      v
+-----------------------------------------------------------------------------+
|                     10-Foot TV Component Ecosystem                          |
|                                                                             |
|  +--------------------+  +--------------------+  +-----------------------+  |
|  |   GlanceBar.tsx    |  | CouchConsensus.tsx |  |    DoorbellPip.tsx    |  |
|  |  * Digital Clock   |  | * 10-ft Vote Deck  |  |  * Live Camera WebRTC |  |
|  |  * Weather Telemetry| | * Winner Confetti  |  |  * Smart Deadbolt Lock|  |
|  |  * Remote Hints    |  | * Trailer Player   |  |  * Porch Light Dimmer |  |
|  +--------------------+  +--------------------+  +-----------------------+  |
|                                                                             |
|                      +---------------------------------+                    |
|                      |        AmbientCanvas.tsx        |                    |
|                      |  * 60FPS Bioluminescent Particles|                    |
|                      |  * Daylight Cycle Color Gradients|                    |
|                      +---------------------------------+                    |
+-------------------------------------+---------------------------------------+
                                      | Build Pipeline
                                      v
                      +---------------------------------------+
                      |     Linux Container Build Harness     |
                      |       (docker/Dockerfile.vega)        |
                      |  * Vega Developer Tools (VDT) Target  |
                      |  * Compressed .vpkg Bundle Generation |
                      +---------------------------------------+
```

---

## 2. Key Architectural Innovations

### A. The 2.8x Orthogonal Drift Suppression Matrix
Standard DOM `tabIndex` or naive distance matching algorithms calculate simple Euclidean distance:
$$D = \sqrt{\Delta x^2 + \Delta y^2}$$

In a 10-foot living room card carousel, if the user presses `DPAD_RIGHT`, cards in adjacent vertical rows that are slightly offset horizontally often have a smaller direct Euclidean distance than the next card in the horizontal sequence. This creates the dreaded "staircase focus bug" where horizontal presses inadvertently jump rows.

Aura Vega TV implements a directional projection matrix:
$$D_{\text{effective}} = \Delta_{\text{primary}} + 2.8 \times \Delta_{\text{orthogonal}}$$

By applying a **2.8x penalty multiplier** to orthogonal drift, focus sweeps are guaranteed to remain strictly locked onto the horizontal row until a vertical D-pad key is explicitly pressed.

### B. Zero-Latency Acoustic Web Audio Feedback
Loading MP3/WAV assets over a network or disk introduces 40-120ms of audio latency on embedded TV processors. Aura Vega TV synthesizes acoustic feedback directly in code using the Web Audio API:
* **Focus Tick:** 440Hz $\rightarrow$ 880Hz exponential sine sweep (40ms duration, 0.04 peak gain).
* **Select Chime:** Dual harmonic D5 (587.33Hz) + D6 (1174.66Hz) resonant chords with exponential decay.
* **Back Knock:** Low-frequency 320Hz $\rightarrow$ 160Hz damped pulse.
This guarantees zero asset downloads and true **0ms instant acoustic feedback**.

### C. Containerized Cross-Platform Parity
Because Amazon's Vega Developer Tools (VDT) require Linux/macOS, Windows developers are traditionally locked out. Our Dockerized harness (`docker/Dockerfile.vega`) abstracts the underlying POSIX dependencies, enabling any developer on Windows 10/11 to compile, package `.vpkg` bundles, and test with zero host OS modifications.
