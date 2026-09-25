# PERFORMANCE TARGETS — KPIs and Benchmarks
**Project:** Aura Vega TV
**Version:** 1.0.0
**Source:** Official Vega OS Performance documentation (via amazon-devices-buildertools-mcp)
**Last Updated:** 2026-09-25

---

## 1. OFFICIAL VEGA KPI TARGETS

These are hard targets from the Vega OS platform documentation. Shipping outside these targets risks app store rejection.

| KPI | Test Scenario | Official Guideline | Our Target |
|---|---|---|---|
| Time-to-First-Frame (TTFF) | Cool start (fresh install) | less than 1.5 seconds | less than 1.2 seconds |
| Time-to-First-Frame (TTFF) | Warm start (recent use) | less than 0.5 seconds | less than 0.4 seconds |
| Time-to-Fully-Drawn (TTFD) | Cool start | less than 8.0 seconds | less than 5.0 seconds |
| Time-to-Fully-Drawn (TTFD) | Warm start | less than 1.5 seconds | less than 1.0 seconds |
| Foreground Memory | App in foreground | less than 400 MiB | less than 300 MiB |
| Background Memory | App in background (headless) | less than 150 MiB | less than 80 MiB |
| Video Fluidity | Video playback (trailer) | greater than 99% | 99.5% |
| Time-to-First-Video-Frame | Trailer launch | less than 2500 ms | less than 1500 ms |
| UI Fluidity | D-Pad navigation | greater than 99% | 99.5% |
| App Event Response - Focus | D-Pad key → focus change | less than 200 ms | less than 100 ms |
| Key Pressed/Released Latency | During video playback | less than 100 ms | less than 60 ms |

---

## 2. PERFORMANCE STRATEGIES PER KPI

### TTFF (Cold Start) — Target: less than 1.2 seconds
- AmbientScreen is the initial route — it is lightweight (no data fetching, no media)
- ConsensusScreen uses lazy loading (`React.lazy()` equivalent in RN)
- enableScreens() and enableFreeze() called at app entry point
- No synchronous operations at startup
- Headless service pre-warms data before user launches foreground app

### TTFF (Warm Start) — Target: less than 0.4 seconds
- enableFreeze() keeps offscreen screens frozen (not re-rendered)
- No re-initialization logic when app resumes from background
- Animated values retain state across freeze/unfreeze cycles

### Memory — Target: less than 300 MiB foreground, less than 80 MiB background
- Images: always use `resizeMode="cover"` with explicit `width`/`height` to enable downsampling
- Media catalog: loaded from static JSON (no network call at startup)
- Carousel: Kepler Carousel handles view recycling automatically
- Headless service: no image cache, no UI components, no media player instances
- On screen blur/unmount: pause and destroy VideoPlayer instance explicitly

### UI Fluidity — Target: 99.5%
- ALL `Animated` calls must use `useNativeDriver: true`
- EXCEPTION: color interpolations cannot use native driver — keep these minimal and triggered only on theme change (not per-frame)
- No state mutations inside `onScroll` handlers
- No setTimeout or setInterval inside render paths
- Carousel uses built-in view recycling — do not override with custom FlatList

### Focus Response — Target: less than 100 ms
- TVFocusGuideView defines zone boundaries at mount time — no runtime calculation
- FocusManager.focus() is synchronous at the native layer
- No async operations triggered by onFocus (data fetching deferred to after render)
- onFocus only updates local Animated.Value and StyleSheet reference

---

## 3. MEASUREMENT TOOLS

### KPI Visualizer (Official Vega Tool)
```bash
# Run inside Vega SDK container or on macOS/Ubuntu with SDK installed
vega exec perf kpi-visualizer

# Start a cold-start measurement session
kepler device launch-app --dir . --measure-kpis

# View real-time performance trace
kepler device performance --live
```

### React Native DevTools Profiler (RN 0.83+ / Static Hermes)
- Route: read document `react_native_for_vega_open_devtools_workflow.md` via MCP
- Use for: identifying which component is re-rendering unnecessarily
- Symptom: UI jank during D-Pad navigation → check Profiler for wasted renders

### Perfetto Trace Analysis (App Launch and Key Input)
- Use for: slow cold/warm start investigation, key-input latency
- Route: `analyze_perfetto_traces` tool via amazon-devices-buildertools-mcp

---

## 4. PROFILING GATES (CI/DEMO GATE)

Before demo submission, ALL of the following must be verified:

| Gate | Measurement Method | Pass Criteria |
|---|---|---|
| GATE-PERF-1 | KPI Visualizer: cold start | TTFF less than 1.5s, TTFD less than 8s |
| GATE-PERF-2 | KPI Visualizer: warm start | TTFF less than 0.5s |
| GATE-PERF-3 | D-Pad navigation stress test (30 rapid presses) | No dropped frames, no focus drift |
| GATE-PERF-4 | Trailer playback | First video frame less than 2500ms, no buffering stutter |
| GATE-PERF-5 | Background memory check after minimize | Less than 150 MiB |
| GATE-PERF-6 | DoorbellPiP stress (trigger 10 times rapidly) | No crash, no memory leak |

---

## 5. COMMON PERFORMANCE TRAPS

| Trap | Symptom | Fix |
|---|---|---|
| Non-native animated values | Frame drops during focus animation | Add `useNativeDriver: true` |
| FlatList instead of Carousel | Jank when scrolling media deck | Replace with Kepler Carousel |
| Inline functions in render | Wasted re-renders on parent state change | useCallback for all handlers |
| Images without explicit dimensions | Slow layout (async measurement) | Always set explicit width+height |
| Synchronous localStorage on startup | Slow cold start | Defer AsyncStorage reads to after first paint |
| VideoPlayer not destroyed on unmount | Memory accumulation | pause() + cleanup in useEffect return |
| Bundled React/ReactNative | Huge bundle size, OOM | Declare as peerDependencies only |

---

*Performance targets are enforced by the official Vega OS platform.*
*All KPI measurements must be taken on the Vega Virtual Device (VVD) or real Fire TV hardware.*
*Do not use local browser DevTools measurements as a substitute.*
