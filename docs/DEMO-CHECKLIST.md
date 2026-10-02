# Aura Vega TV — Hackathon Demo Checklist

**Target Duration**: ~2:30 (strictly <= 3:00)  
**Package**: `com.auravega.tv` (Vega OS 1.2)  
**Track**: Amazon App Dev Challenge 2026 — Fire TV  

---

## 1. Technical Pre-Flight Checklist
- [ ] **Release Package Available**: `build/x86_64-release/com.auravega.tv_x86_64.vpkg` (SHA256: `64F1E0327C00336CE25A729AC7AA4DD69F0F09FE6B69AD17874DBD065A17FA6A`).
- [ ] **Automated Tests Verified**: 97/97 tests passing across 12 suites (`npm test -- --runInBand`).
- [ ] **TypeScript Verified**: Clean 0 errors (`npx tsc --noEmit`).
- [ ] **Display Setup**: 1080p resolution (1920x1080) for native 10-foot TV display.
- [ ] **Audio Setup**: Clear microphone setup for narrator voiceover; TV UI audio level balanced.
- [ ] **Voter State Ready**: Default household configured with Ronak and Family.

---

## 2. Segment-by-Segment Timing Guide (~2:30 Target)

| Segment | Timestamp | On-Screen Action | Key Talking Point |
|:---|:---:|:---|:---|
| **1. The Problem** | 0:00 – 0:25 | Ambient Screen particle canvas + Glance Bar | "Decision fatigue hits 73% of households. Endless scrolling kills movie night." |
| **2. Household Setup** | 0:25 – 0:50 | Start Co-Viewing → Select Ronak & Family | "Real-time multi-viewer voting on Fire TV. Zero cloud latency." |
| **3. Multi-Factor Scoring** | 0:50 – 1:30 | Filter Sci-Fi/Drama → Detail Modal breakdown | "Deterministic scoring: Affinity + Acclaim + Context + Runtime - Penalties." |
| **4. The Winner** | 1:30 – 1:55 | Trigger Consensus → Winner Modal | "Unanimous top match with plain-English explanation." |
| **5. Instant Playback** | 1:55 – 2:15 | Click Watch Now → VideoPlayer full-screen | "Native W3C media playback + Kepler A11y subtitles." |
| **6. Closing & Impact** | 2:15 – 2:30 | Return to Ambient Home → Final wrap | "Built natively for Amazon Vega OS. Movie night decided in under 60 seconds." |

---

## 3. Visual & Usability Criteria
- [ ] **Focus Visibility**: High-contrast cyan outline (`#00E5FF`, 4px) clearly distinguishes the active element.
- [ ] **Font Legibility**: Title texts (32px+) and metadata badges (18px+) are clearly readable at a 10-foot viewing distance.
- [ ] **Smooth Transitions**: No flickering or stuttering between Ambient, Consensus, Modal, and Player screens.
- [ ] **Safe-Area Insets**: All critical UI elements remain within TV-safe margins (minimum 48px from edges).

---

## 4. Human-Only Action Callout
> [!NOTE]
> Recording actual video footage with human voiceover and physical Fire TV remote interaction is a human-only task that cannot be manufactured by software automation. Follow `docs/DEMO-RECORDING-GUIDE.md` for recording instructions.
