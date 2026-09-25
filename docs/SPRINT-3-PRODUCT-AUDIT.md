# Sprint 3 Product Audit — Current Architecture & Maturity Assessment

**Project:** Aura Vega TV (`com.auravega.tv`)  
**Stage:** Sprint 3 — Phase 0 Audit  
**Date:** 2026-09-26  

---

## 1. Executive Summary

Aura Vega TV has achieved full **platform correctness**:
- Official Vega OS packages are integrated (`@amazon-devices/react-native-kepler`, `react-native-w3cmedia`, `vega-carousel`, `kepler-ui-components`, `kepler-a11y-settings-interface-turbo`).
- Full headless service lifecycle and manifest definitions are verified.
- Production Metro bundling compiles both UI and headless entrypoints into static Hermes bytecode.
- 9 test suites / 32 Jest unit tests pass with zero TypeScript errors.

However, from a **Product and Intelligence** perspective:
- The consensus mechanism was a basic threshold counter (`updatedShortlist.length >= 3`) that chose `updatedShortlist[0]` without multi-viewer weight evaluation, mood scoring, or time-of-day contextual affinity.
- The `WinnerModal` presented a generic victory screen without explaining **WHY** the title won ("Recommended because 2 viewers loved Sci-Fi, it fits your 2h evening window, and matches rainy weather").
- The environmental telemetry (`WeatherService`, time of day) was purely decorative on the `GlanceBar` and did not influence recommendation rankings.
- The headless service ran a generic periodic timer without injecting personalized recommendations into the active media deck.

Sprint 3 directly addresses these gaps to elevate Aura Vega TV from a technical showcase to an intelligent, compelling living room product.

---

## 2. Screen & Component Audit

| Screen / Component | 1. User Value | 2. Product Logic | 3. Platform Value | 4. Demo Value | 5. Technical Maturity | 6. Real / Mock / Sim | 7. Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`AmbientScreen`** | High — Transforms idle TV into an ambient piece with dynamic daylight and contextual clock. | High — Time-of-day lighting calculation. | High — Native 10-foot TV overscan and dark OLED protection. | High — Immediate visual "wow" within first 5 seconds. | High | Real React Native animations + simulated day cycles | **IMPROVE** — Make ambient context directly feed into the Co-Viewing recommendation engine. |
| **`GlanceBar`** | Medium-High — Quick glance at time, local weather, AQI, and doorbell activity. | Medium — Weather unit toggling, time ticker. | Medium — TV-safe glassmorphism and focus traversal. | High — Fast entry point to Consensus CTA (`🎬 Start Co-Viewing`). | High | Real time/date, simulated weather telemetry | **IMPROVE** — Surface intelligent contextual tag (e.g. "Evening Cozy Watch Pick Available"). |
| **`AmbientCanvas`** | High — Calming daylight gradient transitions and ambient particle movement. | Medium — 6 period daylight calculator (`dawn` to `night`). | High — GPU-driven native opacity blending. | High — Evident 10-foot living room design. | High | Real React Native Animated API | **KEEP** — Maintain 60fps performance without CPU spikes. |
| **`DoorbellPip`** | High — Eliminates living room blindness when someone rings or package arrives. | Medium — 4-second auto-dismiss with expand actions. | High — TV Picture-in-Picture layout standards. | Very High — Proves smart home synergy on Fire TV. | High | Simulated event trigger with native layout | **KEEP** — Showcase non-intrusive notification during ambient and browsing. |
| **`ConsensusScreen`** | Very High — The core product promise: eliminates 20-minute Netflix/Prime browsing arguments. | Low-Medium (Currently) — Currently only filters by mood pills and counts 3 shortlists. | Very High — Integrates official Vega Carousel v2 with 10-foot anchored focus. | Critical — Central showcase of product intelligence and decision convergence. | Medium | Real UI/Carousel + Mock Decision Engine | **IMPROVE (CRITICAL)** — Connect to deterministic multi-factor Scoring Engine with real explainability. |
| **`MediaDeck`** | High — Displays curated media options via smooth horizontal carousel. | Medium — Adapts data via `CarouselItemDataAdapter`. | Critical — Uses official `@amazon-devices/vega-carousel`. | High — Native remote D-pad scrolling and focus scale. | High | Real Vega Carousel | **KEEP / EXPAND** — Feed scored & ranked candidate items with match badges. |
| **`MediaCard`** | High — At-a-glance metadata (IMDb, Rotten Tomatoes, runtime, mood, streaming service). | Medium — Focus state and D-pad action buttons. | High — 1.04x focus scale factor, high-contrast borders. | High — Clean, legible 10-foot typography. | High | Real component | **IMPROVE** — Display match percentage badge calculated by the scoring engine. |
| **`DetailModal`** | Medium — Deep dive on synopsis, director, full cast, and streaming availability. | Medium — Modal focus trap and trailer preview trigger. | Medium — Accessible dialog pattern. | Medium — Demonstrates detailed metadata inspection. | High | Real component | **KEEP** — Ensure smooth D-pad return to deck. |
| **`WinnerModal`** | Critical — The climax of the Co-Viewing workflow. | Low (Currently) — Displays hardcoded winner text without reasoning. | High — D-pad primary focus on "▶ Watch Now". | Critical — The moment where decision fatigue is solved. | Medium | Real UI, Unintelligent winner selection | **REPLACE / UPGRADE** — Rebuild with **"Why This?" Intelligence Panel**: contributing factors, viewer alignment, mood match, runtime compatibility. |
| **`VideoPlayerScreen`** | Critical — Immediate consumption of the recommended content. | High — HTMLMediaElement playback lifecycle, OSD controls, scrubber. | Critical — Native `KeplerVideoSurfaceView` and `@amazon-devices/react-native-w3cmedia`. | Very High — Seamless handoff from consensus to playback. | High | Real Vega W3C Media Player | **KEEP** — Verified and operational. |
| **`CaptionOverlay`** | High — Accessibility compliance for TV viewers. | High — Real-time dynamic styling based on OS settings. | Critical — Uses `@amazon-devices/kepler-a11y-settings-interface-turbo`. | High — Demonstrates accessibility rigor. | High | Real TurboModule + fallback | **KEEP** |
| **`SettingsScreen`** | Medium — User preferences and Vega runtime diagnostics. | Medium — Temperature unit toggle, diagnostic inspect. | High — Displays runtime packaging and Static Hermes telemetry. | Medium — Evaluator credibility check. | High | Real component | **KEEP** — Diagnostic proof of Vega OS execution. |
| **`HeadlessService`** | High — Background maintenance of personalized catalog and home sync. | Low-Medium (Currently) — Simple periodic interval timer. | Critical — Fulfills Vega `manifest.toml` service contract. | High — Proves architecture beyond a single UI thread. | High | Real Vega headless context | **IMPROVE** — Pre-compute contextual recommendations in background. |

---

## 3. Product vs Tech Gap Analysis

1. **Missing Core Scoring Engine:**
   - Previous state: Winner was simply the 1st shortlisted card when list count reached 3.
   - Requirement: A deterministic multi-factor scoring engine evaluating:
     - Group voter affinity (shared genre/mood preferences)
     - Environmental/contextual alignment (e.g. evening cozy vs weekend blockbuster)
     - Runtime fit (fits within viewing session window)
     - Quality signals (IMDb + Rotten Tomatoes blended score)
     - Exclusions / veto handling (if any voter skips/dislikes a genre)

2. **Missing Explainability ("Why This?"):**
   - The user must never be told "This is your winner" without seeing the underlying rationale.
   - The UI must show structured, human-readable reasons generated from actual math:
     - "88% Match for Ronak & Family"
     - "Matches tonight's Cosmic & Mind-Bending mood"
     - "Fits your 2h 45m evening viewing window"
     - "Highest blended critical rating (IMDb 8.7 • RT 87%)"

3. **Contextual Disconnect:**
   - Weather and time-of-day were only rendered in GlanceBar text.
   - Requirement: Time-of-day (Morning/Afternoon/Evening/Night) and Weather (Rainy/Clear) should dynamically adjust content scoring weights (e.g., higher mood weight for rainy evenings).

---

## 4. Sprint 3 Action Plan

1. **Phase 1:** Crystallize Core Product Promise.
2. **Phase 2 & 4:** Build pure, deterministic `ScoringEngine` (`src/engine/ScoringEngine.ts`) with mathematical weights, veto handling, tie-breaking, and score component breakdowns.
3. **Phase 3 & 5:** Build `ExplanationEngine` (`src/engine/ExplanationEngine.ts`) producing clear positive/negative contributing factors.
4. **Phase 6 & 11:** Upgrade `ConsensusContext`, `ConsensusScreen`, and `WinnerModal` to incorporate real voter preferences, multi-viewer votes, and the "Why This?" breakdown.
5. **Phase 7 & 8:** Connect `WeatherService` and `time-of-day` to the candidate scoring pipeline.
6. **Phase 9 & 12:** Provide a rich, deterministic 12-item demo catalog with known characteristics for a repeatable 3-minute demo flow.
7. **Phase 15:** Write rigorous Jest tests covering normal scoring, conflict resolution, ties, exclusions, missing data, and explanation generation.
8. **Phase 18 & 19:** Document product intelligence and verify build/bundle outputs.
