# TEST PLAN — Testing Strategy
**Project:** Aura Vega TV
**Version:** 1.0.0
**Last Updated:** 2026-09-25

---

## 1. TEST LEVELS

### Level 1: Unit Tests (Jest)
Scope: Business logic, state reducers, utility functions

| Test Suite | File | What is Tested |
|---|---|---|
| ConsensusReducer | `__tests__/consensus.test.ts` | shortlist/skip/winner logic, phase transitions |
| TimeOfDay | `__tests__/time-of-day.test.ts` | All 6 day phases, boundary times (04:59, 05:00, 07:00) |
| WeatherReducer | `__tests__/weather.test.ts` | fetch start/success/error state transitions |
| AlertReducer | `__tests__/alert.test.ts` | add, dismiss, mark-read, PiP show/hide |
| MediaCatalog | `__tests__/media-catalog.test.ts` | JSON schema validation, all required fields present |
| Formatters | `__tests__/format.test.ts` | Date, time, temperature format edge cases |

### Level 2: Component Tests (React Native Testing Library)
Scope: Component rendering and basic interaction

| Test | Component | What is Tested |
|---|---|---|
| COMP-001 | AmbientCanvas | Renders without crash; animation values initialized |
| COMP-002 | GlanceBar | Renders clock, weather, alert widgets; onWidgetSelect fires |
| COMP-003 | DoorbellPip | Shows/hides correctly; auto-dismiss after 4 seconds |
| COMP-005 | MediaCard | Renders title, rating; onShortlist/onSkip called correctly |
| COMP-006 | DetailModal | Renders all metadata; Watch Trailer button activates |
| COMP-007 | WinnerModal | Shows winner title; Watch Now / Try Another actions fire |
| COMP-009 | FocusableCard | onFocus/onBlur trigger Animated.Value changes |

### Level 3: Integration Tests (Vega Virtual Device)
Scope: Full D-Pad navigation flows on actual Vega OS

| Flow | Steps | Expected Outcome |
|---|---|---|
| FLOW-001 | Launch → navigate GlanceBar widgets | All 3 widgets reachable via D-Pad, clock ticks |
| FLOW-002 | Ambient → open Consensus | Enter Consensus via bottom CTA; first card focused |
| FLOW-003 | Consensus voting (RIGHT x5) | 5 cards shortlisted; consensus triggers; winner modal appears |
| FLOW-004 | Skip a card (LEFT) | Card animated away; next card focused; not in shortlist |
| FLOW-005 | Open detail modal (UP on card) | DetailModal opens; focus set to Watch Trailer button |
| FLOW-006 | Dismiss modal (BACK) | Returns focus to card that opened it |
| FLOW-007 | Trailer playback | Video loads; plays; BACK pauses and closes |
| FLOW-008 | Doorbell PiP trigger | PiP slides in; 4s auto-dismiss; or SELECT to expand |
| FLOW-009 | Theme change over time | Gradient transitions at day-phase boundaries |

### Level 4: Performance Tests (KPI Visualizer)
See `PERFORMANCE-TARGETS.md §3` for tool usage.

| Gate | Command | Pass Criteria |
|---|---|---|
| GATE-PERF-1 | `vega exec perf kpi-visualizer` cold start | TTFF less than 1.5s |
| GATE-PERF-2 | `vega exec perf kpi-visualizer` warm start | TTFF less than 0.5s |
| GATE-PERF-3 | D-Pad rapid press (30 presses) | UI Fluidity greater than 99% |
| GATE-PERF-4 | Trailer playback TTFVF | First frame less than 2500ms |
| GATE-PERF-5 | Minimize app | Background memory less than 150 MiB |

---

## 2. TEST EXECUTION CHECKLIST (PRE-DEMO)

### Code Quality
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] All unit tests pass (`npm test`)
- [ ] No console.error() or console.warn() in production build
- [ ] No hardcoded colors or sizes (all reference tokens.ts)
- [ ] No bundled React or React Native (check package.json dependencies)

### Platform Compliance
- [ ] manifest.toml validates (run `vega project validate`)
- [ ] os.version present with min="1.2" target="1.2"
- [ ] Headless service declared in [offers] and implemented in headless.js
- [ ] App icon is 512x512 PNG in assets/image/
- [ ] `npm run build:release` succeeds without errors

### Navigation and Focus
- [ ] Every interactive element is reachable via D-Pad from app launch
- [ ] No focus islands (elements that can be reached but not escaped)
- [ ] Modal focus trap works correctly (BACK dismisses, no leak to background)
- [ ] DoorbellPiP dismisses correctly (4s auto and SELECT)
- [ ] Focus memory: returning from modal restores correct focus

### Performance
- [ ] GATE-PERF-1: Cold start TTFF less than 1.5s
- [ ] GATE-PERF-2: Warm start TTFF less than 0.5s
- [ ] GATE-PERF-3: D-Pad navigation UI fluidity greater than 99%
- [ ] GATE-PERF-4: Trailer TTFVF less than 2500ms
- [ ] GATE-PERF-5: Background memory less than 150 MiB

### Accessibility
- [ ] All interactive elements: minimum 48x48dp touch target
- [ ] All focus indicators: physical change (border + scale) — not color only
- [ ] All Pressable components: accessibilityLabel and accessibilityRole set
- [ ] Caption settings: bridge from OS tested
- [ ] Audio description preference: read and respected

### Demo Readiness
- [ ] DEMO-SCRIPT.md rehearsed — complete run under 3 minutes
- [ ] Doorbell PiP demo trigger works reliably (not time-dependent)
- [ ] Couch Consensus reaches winner within 90 seconds from clean start
- [ ] VEGA-DX-FRICTION-LOG.md has minimum 8 friction entries
- [ ] GitHub repository: public, clean history, no keys committed

---

## 3. KNOWN TEST LIMITATIONS

- No physical Fire TV hardware available (using VVD emulator only)
- Weather API uses simulated data (no real API key for hackathon submission)
- Trailer URLs: static MP4 files (no real streaming license)
- Multi-user Couch Consensus: simulated (single controller)

---

*All pre-demo checklist items must be green before recording the submission video.*
*No exceptions — any failing gate is a risk to the Tech Implementation score.*
