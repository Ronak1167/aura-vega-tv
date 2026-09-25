# NAVIGATION MAP — Screen and Focus Flow
**Project:** Aura Vega TV
**Version:** 1.0.0
**Last Updated:** 2026-09-25

---

## 1. SCREEN GRAPH

```
[App Launch]
     │
     ▼
[AmbientScreen]  ← Initial route (default)
     │
     ├── D-Pad SELECT on Consensus entry → [ConsensusScreen]
     │        │
     │        ├── D-Pad UP on card → [DetailModal] (modal overlay)
     │        │        └── D-Pad SELECT on "Watch Trailer" → [TrailerPlayer] (full-screen modal)
     │        │        └── D-Pad BACK → back to ConsensusScreen
     │        │
     │        ├── Consensus triggered → [WinnerModal] (modal overlay)
     │        │        └── D-Pad SELECT on "Watch Now" → [TrailerPlayer]
     │        │        └── D-Pad BACK → back to ConsensusScreen
     │        │
     │        └── D-Pad BACK → back to AmbientScreen
     │
     ├── DoorbellPip auto-triggers (overlay on AmbientScreen)
     │        ├── D-Pad SELECT → expand (future: full camera view)
     │        └── D-Pad BACK or auto-dismiss (4 seconds) → dismiss
     │
     └── [SettingsScreen] (P2 — accessed via GlanceBar settings widget)
              └── D-Pad BACK → back to AmbientScreen
```

---

## 2. AMBIENT SCREEN FOCUS MAP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GLANCE BAR (TVFocusGuideView — horizontal)                   [80dp padding] │
│ [🕐 Clock]  [🌤 Weather]  [📦 Alerts]  [⚙ Settings (P2)]                  │
│    F1           F2           F3              F4                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AMBIENT CANVAS (no focusable children — art background only)               │
│                                                                             │
│  ┌────────────────────┐                                                     │
│  │   96sp CLOCK       │                                                     │
│  │   28sp DATE        │                                                     │
│  │   18sp QUOTE       │                                                     │
│  └────────────────────┘                                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ BOTTOM ACTION BAR (TVFocusGuideView — horizontal)                           │
│ [🎬 Find Something to Watch]                                                │
│         F5 — D-Pad SELECT opens ConsensusScreen                             │
└─────────────────────────────────────────────────────────────────────────────┘

Focus traversal: D-Pad UP from F5 → F1/F2/F3/F4 (nearest x-axis)
                 D-Pad DOWN from F1/F2/F3/F4 → F5
```

---

## 3. CONSENSUS SCREEN FOCUS MAP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GLANCE BAR (same as AmbientScreen)                                          │
│ [Clock] [Weather] [Alerts]                                                  │
│   F1      F2        F3                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ MOOD SELECTOR (Kepler Carousel — horizontal)                                │
│ [🔥 Thrillers] [😂 Comedy] [🚀 Sci-Fi] [👨‍👩‍👧 Family] [💕 Romance]            │
│     F4            F5         F6          F7         F8                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ MEDIA DECK (Kepler Carousel — horizontal)                                   │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
│ │Poster│  │Poster│  │Poster│  │Poster│  │Poster│  │Poster│                │
│ │Title │  │Title │  │Title │  │Title │  │Title │  │Title │                │
│ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘               │
│   F9        F10       F11       F12       F13       F14                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ VOTE LEGEND BAR                                                             │
│ ◄ LEFT: Skip     ▲ UP: Details     ► RIGHT: Shortlist     ● SELECT: Open   │
└─────────────────────────────────────────────────────────────────────────────┘

Cartesian Rules:
  MediaCard focused:
    D-Pad LEFT  → skip card (animation) + next card focused
    D-Pad RIGHT → shortlist card (animation) + next card focused
    D-Pad UP    → open DetailModal
    SELECT      → open DetailModal (same as UP for discovery)
  D-Pad UP from Mood Selector → GlanceBar
  D-Pad DOWN from GlanceBar → Mood Selector
```

---

## 4. MODAL FOCUS BEHAVIOR

### DetailModal
- Opens above current screen (stack modal presentation)
- Focus MUST be programmatically set to modal's first focusable element via `FocusManager.focus(ref)`
- Focus is TRAPPED inside modal — no D-Pad exit to background screen
- D-Pad BACK dismisses modal and returns focus to previously focused MediaCard

### WinnerModal
- Same focus trap behavior as DetailModal
- Primary action: "Watch Now" (focus default)
- Secondary action: "Try Another"
- D-Pad BACK = "Try Another" behavior

### DoorbellPiP
- NOT a modal — an overlay View with absolute positioning
- Focus is NOT trapped (D-Pad can still navigate GlanceBar if PiP is dismissed)
- D-Pad SELECT on PiP → expands / shows detail
- Auto-dismisses after 4 seconds without user interaction

---

## 5. REMOTE CONTROL KEYBINDING TABLE

| Key | Vega Keycode | Action in Ambient | Action in Consensus |
|---|---|---|---|
| D-Pad UP | KEYCODE_DPAD_UP | Move focus up | Move focus up / open detail |
| D-Pad DOWN | KEYCODE_DPAD_DOWN | Move focus down | Move focus down |
| D-Pad LEFT | KEYCODE_DPAD_LEFT | Move focus left | Skip media card |
| D-Pad RIGHT | KEYCODE_DPAD_RIGHT | Move focus right | Shortlist media card |
| SELECT / Center | KEYCODE_DPAD_CENTER | Activate focused element | Open detail modal |
| BACK | KEYCODE_BACK | Navigate back / dismiss PiP | Dismiss modal / back to Ambient |
| PLAY/PAUSE | KEYCODE_MEDIA_PLAY_PAUSE | Toggle ambient animation pause | Pause trailer if playing |
| HOME | KEYCODE_HOME | (System handles — returns to Fire TV home) | Same |

---

## 6. FOCUS MEMORY (STATE PRESERVATION)

- When navigating FROM ConsensusScreen BACK to AmbientScreen:
  - Consensus state is preserved (shortlist, skip history)
  - Re-entering ConsensusScreen restores last focused card
- When DoorbellPiP appears:
  - Previous focus is remembered
  - After PiP dismissal, focus restores to previous element
- Modal dismissal always restores focus to the element that opened the modal

---

*Navigation Map is the authoritative source for all screen and focus behavior.*
*Any implementation that diverges from this map requires a PRD change first.*
