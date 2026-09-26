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

**On screen**: Aura Vega launches. The **Ambient Canvas** — a particle-flow background — pulses gently. The app feels alive, premium, designed for the 10-foot TV experience.

---

### Segment 2 — Setting the Scene (0:30–1:00)

**Narrator says:**
> "First, we tell Aura who's in the room tonight."

**Action**: Navigate to the **Household Viewer tab** using the remote D-pad.

- Select **Alex** → Toggle ON (checked)
- Select **Jordan** → Toggle ON (checked)

**Narrator says:**
> "Two viewers. Aura now knows both of you are here."
>
> "Next — what kind of evening is it?"

**Action**: Navigate to the **Context tab**.

- Toggle **Relaxed** mode ON
- Toggle **Late Evening** timing ON

**Narrator says:**
> "Relaxed Friday evening. This context doesn't just sit there — it actively adjusts every recommendation score."

---

### Segment 3 — The Core Product (1:00–1:45)

**Narrator says:**
> "Now watch what happens."

**Action**: Navigate to the **Consensus tab**. The carousel loads.

> "Aura has just run its consensus scoring engine locally, on-device. No cloud call. No AI black box. In under 200 milliseconds."

**Point to the carousel cards**:
> "Each card shows the title, a score from 0–100, and — this is the key differentiator — **an explanation**."

**Action**: Focus on the **top-scored card** (e.g. *The Shawshank Redemption* or highest scored item). Read its explainability text aloud:

> "'Both viewers enjoy Drama. Rated highly on IMDb. Relaxed evening boost applied. Score: 94.'"

**Narrator says:**
> "This is not a black box. Every point in that score is earned by something real. Alex and Jordan's shared genre preferences. The IMDb rating. The context boost for a relaxed evening. It is completely transparent and completely deterministic."

---

### Segment 4 — Consensus Decision (1:45–2:15)

**Action**: Press SELECT on the top card. The **Winner Modal** appears.

> "Aura has reached consensus. *[Title]* wins."

**Point to the winner card**:
> "Score, full explanation, and a Watch Now button. This is the unanimous pick for tonight."

**Action**: Show the **Watch Now** button.
> "If we're happy with this, we press Watch Now and the video player opens. If we want to explore more options..."

**Action**: Press the **Keep Browsing** button to dismiss the modal.
> "We stay in the deck and keep exploring — the session is never lost."

---

### Segment 5 — Filtering & Depth (2:15–2:45)

**Action**: Navigate to the Genre filter buttons above the carousel.

- Select **Action** genre filter

> "Maybe Alex is in the mood for something with more energy. Filter by Action. The deck updates instantly. Scores re-sort. The engine adapts."

**Action**: Select a different card from the filtered deck. Press SELECT.

> "New winner. New explanation. Aura never locks you in — it's a conversation."

---

### Segment 6 — Video Player (2:45–3:00)

**Action**: Press **Watch Now** on a winner card.

The **VideoPlayer** launches. Video plays. Show the OSD controls: Play/Pause, Seek bar, Captions.

> "Full Vega OS video player. Native W3C media surface. Caption support out of the box for accessibility."

**Narrator closes**:
> "Aura Vega. Built natively on Vega OS. Powered by explainable deterministic scoring. Designed for the living room. This is what it looks like when your TV actually helps you decide."

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
