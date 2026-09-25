# GSD Project State: Aura Vega TV

**Project Name:** Aura Vega TV (`aura-vega-tv`)  
**Hackathon:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
**Primary Track:** Fire TV — Vega OS (`.vpkg` target)  
**Mini-Challenge:** Open Source Mini Challenge  
**Current Phase:** Phase 1 — Project Specification & Architecture Lock  
**Date:** September 25, 2026  
**Status:** In Progress — Specification locked, UI Design in progress  

---

## 1. Core Mission
Build **Aura Vega TV**, an ambient living room intelligence and contextual co-viewing hub built natively for Amazon's new Linux-based **Vega OS** on Fire TV. It bridges the living room, front door, and cloud with a flawless 10-foot D-pad spatial UI, ambient canvas mode, collaborative movie/media selection ("Couch Consensus"), and lightweight smart home telemetry.

---

## 2. Key Architecture Decisions
- **Target OS:** Amazon Vega OS (Linux-based `.vpkg` package format).
- **Core Framework:** React Native for TV / High-Performance 10-Foot Web Engine adaptable to Vega runtime.
- **Navigation:** Spatial D-pad Focus Engine with visual focus halos, card scaling (`1.08x`), and remote keybindings (Arrows, Enter/Select, Back/Escape, Media keys).
- **Tooling Integration:** `@amazon-devices/amazon-devices-buildertools-mcp` (v1.0.12) for TV diagnostics and focus inspection.
- **UI Design System:** Stitch MCP + custom 10-foot design tokens (1920x1080 canvas, 5% TV safe margins, OLED dark glassmorphism).
- **Build Harness:** Docker Linux container for Vega Developer Tools (VDT) and packaging verification on Windows.
- **Secret Weapon:** Amazon Vega OS Developer Friction Log & SDK Feedback Report.

---

## 3. Phase Progress
- [x] Phase 0: Environment Audit & Track Feasibility Verification (Complete)
- [x] Phase 1: Track Selection & Strategy Lock (Fire TV Vega OS + Open Source)
- [ ] Phase 2: 10-Foot Design Tokens & Screen Mockups via Stitch MCP
- [ ] Phase 3: Core Application Scaffold & Spatial D-Pad Engine
- [ ] Phase 4: Ambient Living Canvas & Contextual Widgets
- [ ] Phase 5: "Couch Consensus" Media Discovery Engine
- [ ] Phase 6: Front-Door Glance & Cloud Telemetry Overlay
- [ ] Phase 7: Docker Vega Build Harness & Packaging
- [ ] Phase 8: Clean-Room Verification, GitHub Release, and Devpost Submission Deck
