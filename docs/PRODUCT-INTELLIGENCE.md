# Product Intelligence & Recommendation Engine Architecture

**Project:** Aura Vega TV (`com.auravega.tv`)  
**Specification Version:** 1.0.0  
**Implementation:** `src/engine/ScoringEngine.ts`  
**Date:** 2026-09-26  

---

## 1. The Core Problem: Living Room Decision Fatigue

Smart TV owners spend an average of 15 to 25 minutes browsing endless tile grids across disjointed streaming apps before settling on a title. In group or co-viewing settings (partners, families, roommates), this friction quadruples into paralysis due to conflicting tastes, asymmetrical veto power, and unexpressed preferences.

Aura Vega TV replaces passive scrolling with an active **Co-Viewing Intelligence Mesh**.

---

## 2. Core Product Promise

> "For **living room co-viewers (couples, roommates, families)**,  
> Aura Vega helps them **eliminate the 20-minute 'what should we watch?' decision fatigue**  
> by **evaluating multi-viewer preferences, contextual environment, and critical ratings through an explainable consensus scoring engine**,  
> resulting in **a rapid, unanimous viewing choice that plays immediately on Fire TV without browsing exhaustion**."

---

## 3. Architecture Pipeline

```
  ┌─────────────────────────┐       ┌────────────────────────┐
  │  Voter Preferences      │       │  Ambient Telemetry     │
  │  (Genres, Moods, Vetoes)│       │  (Time, Weather, AQI)  │
  └───────────┬─────────────┘       └───────────┬────────────┘
              │                                 │
              ▼                                 ▼
       ┌───────────────────────────────────────────────┐
       │             Scoring Engine                    │
       │  (Voter Affinity, Acclaim, Context, Runtime)  │
       └──────────────────────┬────────────────────────┘
                              │
                              ▼
       ┌───────────────────────────────────────────────┐
       │             Explanation Engine                │
       │   (Positive Factors, Penalties, Summaries)    │
       └──────────────────────┬────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ┌───────────────┐              ┌────────────────┐
       │ Media Deck    │              │ Winner Modal   │
       │ (Match Badges)│              │ ("Why This?")  │
       └───────────────┘              └───────┬────────┘
                                              │
                                              ▼
                                      ┌────────────────┐
                                      │ VideoPlayer    │
                                      │ (Playback)     │
                                      └────────────────┘
```

---

## 4. Multi-Factor Scoring Formula

Every candidate title $i$ receives a deterministic composite score $S_{total}(i) \in [0, 100]$:

$$S_{total}(i) = \max\left(0, \min\left(100, w_A \cdot S_{affinity}(i) + w_Q \cdot S_{quality}(i) + w_C \cdot S_{context}(i) + w_R \cdot S_{runtime}(i) - P(i)\right)\right)$$

### Factor Weights ($w$):
- **Voter Affinity ($w_A = 0.35$):** Evaluates genre overlap, mood alignment, and voter satisfaction.
- **Critical Acclaim ($w_Q = 0.25$):** Blends normalized IMDb (0-10) and Rotten Tomatoes (0-100) scores.
- **Contextual Alignment ($w_C = 0.25$):** Evaluates local time-of-day, current weather, and active session mood.
- **Runtime Fit ($w_R = 0.15$):** Evaluates title length against available viewing window.

---

## 5. Sub-Score Formulations

### A. Critical Quality Score ($S_{quality}$)
$$S_{quality}(i) = \text{round}\left(0.5 \times (IMDb \times 10) + 0.5 \times RottenTomatoes\right)$$

### B. Voter Affinity & Veto Handling ($S_{affinity}$)
For each voter $v \in V$:
- Preferred genre match: $+60$ base, $+15$ per additional matching genre (up to $+25$).
- Preferred mood match: $+15$ bonus.
- Disliked/Vetoed genre match: Applies $-40$ penalty to $P(i)$ and flags voter conflict.
- Majority conflict flags candidate as `isVetoed = true` (score capped at 30%).

$$S_{affinity}(i) = \text{round}\left(\frac{1}{|V|} \sum_{v \in V} \text{Satisfaction}_v(i)\right)$$

### C. Contextual Environmental Alignment ($S_{context}$)
- **Time of Day:**
  - `night` (22:00+): Titles $\le 120$ min receive $+15$ points. Titles $>150$ min receive $-15$ points.
  - `evening` (18:00 - 22:00): Prime-time feature films receive $+15$ points.
  - `afternoon`: Action, Adventure, and Blockbuster titles receive $+10$ points.
  - `morning`: Lighter formats, Comedy, and Documentaries receive $+10$ points.
- **Weather Telemetry:**
  - Rainy / Stormy / Overcast: Cosmic, Neo-Noir, Sci-Fi, and atmospheric dramas receive $+15$ cozy atmosphere bonus.
  - Clear / Sunny: Vibrant action and blockbusters receive $+10$ points.
- **Session Mood Override:**
  - Active mood selection (e.g. "Sci-Fi") adds $+20$ for direct matches, while non-matching items are penalized $-30$.

### D. Runtime Score ($S_{runtime}$)
Target window $T_{max}$ (default 180m evening, 120m late-night):
- If $Runtime \le T_{max}$: Score $= 100$.
- If $Runtime > T_{max}$: Score $= \max\left(20, 100 - (Runtime - T_{max}) \times 1.2\right)$.

---

## 6. Deterministic Tie-Breaking Sequence

To guarantee 100% reproducible demo and testing outcomes, ties are resolved hierarchically:
1. **Highest Voter Affinity Score** ($S_{affinity}$) — Voter alignment takes precedence over critical ratings.
2. **Highest Critical Quality Score** ($S_{quality}$) — If voter affinity is identical, higher critical consensus wins.
3. **Alphabetical by Title** — Pure string comparison (`title.localeCompare`) guarantees deterministic resolution.

---

## 7. Explainability & "Why This?" Factor Generation

The system never emits an unexplained recommendation. Each evaluation produces:
1. **Summary Reason:** Concise headline (e.g., `"Unanimous Top Match for Ronak & Family"`).
2. **Positive Factors:** Human-readable explanations:
   - `"Unanimous match: All 2 viewers enjoy this genre"`
   - `"Atmospheric cozy vibe matches today's overcast weather"`
   - `"Critical favorite (92% Rotten Tomatoes • 8.6 IMDb)"`
   - `"Comfortably within your 180m time limit"`
3. **Component Breakdown:** Numerical sub-scores displayed in the 10-foot TV `WinnerModal`.

---

## 8. Headless Personalization Synergy

The Vega headless background service (`service.js` / `ContentPersonalizationHeadlessService.ts`) runs periodically in a decoupled JavaScript thread:
- Periodically pre-computes candidate rankings across the catalog.
- Caches the evaluated candidate list in memory.
- Enables the foreground UI to load recommendations with zero UI-thread latency or dropped frames.

---

## 9. Security & Data Honesty Classification

| Integration | Classification | Status & Verification |
| :--- | :--- | :--- |
| **Vega W3C Video Surface** | **REAL** | Native `KeplerVideoSurfaceView` and `VideoPlayer` |
| **Vega Carousel v2** | **REAL** | Official `@amazon-devices/vega-carousel` with `recyclerlistview` |
| **Vega A11y Caption TurboModule** | **REAL** | Official `@amazon-devices/kepler-a11y-settings-interface-turbo` |
| **Vega Headless Service Context** | **REAL** | Registered in `manifest.toml`, executed via `service.js` |
| **Static Hermes Bytecode Compiler** | **REAL** | Native `hermesc.exe` compilation (v96) |
| **Multi-Factor Scoring Engine** | **REAL** | Pure mathematical deterministic domain logic in `src/engine/` |
| **Weather & Environmental Telemetry** | **SIMULATED** | Seeded realistic telemetry based on local time and location |
| **Doorbell PiP Alert Trigger** | **DEMO / SIMULATED** | Non-intrusive TV overlay for demo demonstration |
| **Media Catalog** | **CURATED DEMO DATA** | 12 diverse titles with authentic IMDb/RT ratings & metadata |
