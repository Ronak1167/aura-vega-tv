# Aura Vega TV — Hackathon Demo Script

**Submitted Application**: Aura Vega TV (`com.auravega.tv`)  
**Target Demo Duration**: 3 minutes  
**Audience**: Hackathon judges reviewing Vega OS submissions  
**Goal**: Demonstrate a compelling, differentiated, end-to-end user experience that solves a real problem on a real Amazon device category.

---

## Pre-Demo Checklist

Before presenting, confirm the following:
- [ ] App is installed and launched on Fire TV / Vega OS device
- [ ] Metro bundler OR pre-built release APK is running
- [ ] TV is on, sound is on, and the ambient canvas is visible
- [ ] Active viewers are reset to default (no viewers selected)
- [ ] Catalog is at its initial unfiltered state

---

## Demo Flow (~3 minutes)

### Segment 1 — The Problem (0:00–0:30)

**Narrator says:**
> "We've all been there. It's Friday night. You and your partner sit down on the couch. You open Netflix, you scroll for 20 minutes, and you end up watching nothing. That's decision fatigue — and it happens in 73% of households regularly."
>
> "Aura Vega is a living room companion app for Fire TV that eliminates 'what to watch?' — together, in under 60 seconds."

**On screen**: Aura Vega launches on the **Ambient Screen**. The **Ambient Canvas** — a particle-flow background — pulses gently. The **Glance Bar** at the top displays real-time clock, date, local weather telemetry, and a prominent **'🎬 Start Co-Viewing'** CTA.

---

### Segment 2 — Entering Couch Consensus & Household Setup (0:30–1:00)

**Narrator says:**
> "First, we jump from our ambient living room hub into Couch Consensus."

**Action**: With focus already on **'🎬 Start Co-Viewing'** in the Glance Bar, press **SELECT** on the remote.

The screen transitions to **Couch Consensus**.

**Narrator says:**
> "Here on the Couch Consensus screen, we see who's in the room tonight. Alex, Jordan, and Sam are configured household members."

**Action**: Navigate D-pad to the **Voters** row at the top:
- Select **Alex** → Toggle ON (active)
- Select **Jordan** → Toggle ON (active)
- (Sam remains inactive or toggled as desired)

**Narrator says:**
> "Two viewers active. Aura immediately re-evaluates the entire catalog for both viewers simultaneously."

---

### Segment 3 — Context & Multi-Factor Scoring (1:00–1:45)

**Narrator says:**
> "Next — what vibe are we looking for tonight?"

**Action**: Navigate D-pad to the **Mood Filter** row:
- Select **Drama** or **Sci-Fi** (or leave on **All** for full catalog consensus)

**Narrator says:**
> "Aura has already run its consensus scoring engine locally on-device. Zero cloud latency. No AI black box. Under 50 milliseconds."

**Point to the horizontal carousel cards**:
> "Each title in the Media Deck shows its poster, title, tags, and a live composite match score badge."

**Action**: Focus on a candidate card. Press **SELECT** to open the **Detail Modal**.

**Narrator says:**
> "Opening the detail view shows the complete score breakdown:
> - Voter Affinity (shared genre preferences)
> - Critical Acclaim (Rotten Tomatoes & IMDb)
> - Contextual Alignment (time of day and weather)
> - Runtime Fit (respects bedtime limits)
> Every point is earned transparently."

---

### Segment 4 — Consensus Decision & Winner Modal (1:45–2:15)

**Action**: Close the detail view, or press **'⚡ Evaluate Consensus Now'** in the action bar (or shortlist 3 titles).

The **Winner Modal** smoothly presents the top consensus pick.

**Narrator says:**
> "Aura delivers the winner: an explainable, unanimous top match. We see the exact summary: 'Unanimous match across all active viewers • Fits late-night 2-hour window • 94% Rotten Tomatoes'."

**Action**: Highlight the options:
> "We have **🎬 Watch Now** for immediate streaming. And notice the **'Keep Browsing'** button: if we want to explore other options without resetting our session, we can dismiss and continue browsing seamlessly."

---

### Segment 5 — Filtering & Session Recovery (2:15–2:45)

**Action**: Press **'Keep Browsing'** to dismiss the Winner Modal. The deck remains active.

**Narrator says:**
> "Suppose we change our minds and want a lighthearted comedy instead. We select the **Comedy** mood filter."

**Action**: Switch mood to **Comedy**. The deck updates instantly, re-scoring candidates for the active viewers under the comedy constraint.

**Narrator says:**
> "The engine adapts in real-time. Aura never locks you into a rigid path — it's an interactive co-viewing conversation."

---

### Segment 6 — Instant Video Playback & Accessibility (2:45–3:00)

**Action**: Re-open the top match and press **'🎬 Watch Now'**.

The **VideoPlayerScreen** opens full-screen. The sample stream plays on Vega's native video surface.

**Point to the OSD controls**:
- Show **Play / Pause** and **Seek**
- Show the **Captions toggle** displaying accessibility caption styling via Kepler's A11y TurboModule
- Show the **'← Back to Consensus'** button

**Action**: Press **'← Back to Consensus'** to return cleanly to the active consensus session.

**Narrator closes:**
> "Aura Vega TV. Built natively on Amazon Vega OS. Powered by transparent, deterministic scoring. Designed for the living room. This is how streaming on Fire TV should feel."

---

## Fallback Plan (if device is unavailable)

Use the Metro web debug bundle at `http://localhost:8081` via the browser prototype screenshots captured in the artifact directory. Walk through the same segments using recorded screenshots or the demo video recording.

---

## Key Talking Points for Judge Q&A

| Question | Answer |
| :--- | :--- |
| "Is this using AI?" | "No LLMs. Fully deterministic scoring with a transparent formula: genre overlap, quality weighting, context modifiers, affinity. Zero cloud calls. Explainability is native." |
| "How is this different from a recommendation algorithm?" | "Traditional algorithms are single-viewer, opaque, and require historical data. Aura is multi-viewer, explainable, and works in the first session." |
| "Why Fire TV / Vega OS?" | "The living room is the natural home for group decisions. The D-pad remote, TV screen real estate, and 10-foot viewing distance are perfectly suited to this co-viewing experience." |
| "What does the headless service do?" | "It pre-calculates recommended scores in the background before you open the app, so the first load feels instant." |
| "Is this production-ready?" | "The core engine, catalog, and navigation system are production-quality. The catalog is curated static data today; the roadmap includes live catalog API integration." |
