# Aura Vega TV — Demo Recording Guide

**Document Purpose**: Step-by-step instructions for human recording of the 2:30 hackathon submission video.  
**Strict Limit**: <= 3:00 total video duration.  
**Video Output**: 1080p MP4 (1920x1080 @ 30fps or 60fps), YouTube or Vimeo upload for Devpost link.

---

## 1. Setup & Environment
1. **Screen Capture Software**: OBS Studio, Windows Xbox Game Bar (`Win + G`), or hardware HDMI capture card.
2. **Audio Setup**: Dedicated USB microphone or headset for clean, noise-free narration.
3. **App Launcher**:
   - **On Device**: Deploy `build/x86_64-release/com.auravega.tv_x86_64.vpkg` via `vega app install`.
   - **Alternative (Metro / Browser Capture)**: If Fire TV hardware is not connected, launch the Metro prototype (`npm run start` and browser view) to demonstrate the verified UI states and spatial navigation.

---

## 2. Narration Script & Step-by-Step Actions

### Phase 1: Problem Intro (0:00 – 0:25)
* **Visual**: Launch on `AmbientScreen`. Particle canvas gently moves.
* **Narration**:
  > "Every Friday night, millions of households face the same frustration: spending 20 minutes scrolling through menus, arguing about what to watch, and ending up watching nothing. That is decision fatigue. Aura Vega TV is a living room companion designed specifically for Fire TV and Amazon Vega OS to solve couch consensus in under 60 seconds."

### Phase 2: Entering Consensus & Household Selection (0:25 – 0:50)
* **Action**: Press `SELECT` on remote to enter `ConsensusScreen`.
* **Visual**: Focus lands on Voter row. Toggle `Ronak` and `Family`.
* **Narration**:
  > "Instead of single-user algorithmic black boxes, Aura Vega is built for multiple people in the room. Here, Ronak and Family are active. Instantly, our on-device scoring engine recalculates the entire catalog for both viewers simultaneously."

### Phase 3: Mood Filters & Transparent Scoring (0:50 – 1:30)
* **Action**: D-pad down to Mood filter, select `Sci-Fi`. Focus candidate card (`Interstellar`), press `SELECT` to open `DetailModal`.
* **Visual**: Detail modal opens showing the transparent score breakdown.
* **Narration**:
  > "Filtering to Sci-Fi, the engine displays immediate candidate rankings. Opening the detail view reveals our transparent formula: Voter Affinity, Critical Acclaim from Rotten Tomatoes and IMDb, Contextual Alignment based on current evening time and weather, and Runtime Fit against bedtime limits. Zero cloud latency. No hallucinations."

### Phase 4: Consensus Winner Trigger (1:30 – 1:55)
* **Action**: Dismiss modal, navigate D-pad to `Evaluate Consensus Now` (or shortlist 3 titles), press `SELECT`.
* **Visual**: `WinnerModal` smoothly animates in presenting the top consensus pick.
* **Narration**:
  > "When the group is ready, one click triggers the final consensus decision. The Winner Modal presents the explainable recommendation: an agreed match across both viewers with zero vetoes. Notice the 'Keep Browsing' option if the room wants to explore further, or 'Watch Now' for immediate playback."

### Phase 5: Instant Media Playback (1:55 – 2:15)
* **Action**: Click `Watch Now`. Screen transitions to `VideoPlayerScreen`.
* **Visual**: Full-screen video playback surface with OSD controls and captions.
* **Narration**:
  > "Clicking Watch Now launches instant full-screen playback on Vega's native media surface using the Kepler W3C Media TurboModule. Complete with TV-safe remote controls, seek ±10 seconds, and accessible caption styling."

### Phase 6: Conclusion (2:15 – 2:30)
* **Action**: Press Back button on remote, returning cleanly to Ambient Home.
* **Narration**:
  > "Aura Vega TV: Native Vega OS architecture, deterministic group consensus, and a TV-first experience. Decision fatigue solved for the living room. Thank you."

---

## 3. Post-Recording Quality Checklist
- [ ] Total duration is between 2:15 and 2:45 (strictly under 3:00).
- [ ] Audio narration is clear, well-paced, and free of background noise.
- [ ] Video resolution is 1080p with no pixelation or frame drops.
- [ ] Uploaded to YouTube or Vimeo as Unlisted or Public, ready to paste into Devpost.
