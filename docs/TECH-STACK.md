# TECH-STACK — Technology Decisions
**Project:** Aura Vega TV
**Version:** 1.0.0
**Last Updated:** 2026-09-25

---

## 1. PLATFORM DECISION

### Target: Amazon Vega OS on Fire TV
- Vega OS is a Linux-based microkernel OS purpose-built for Amazon Fire TV (next generation)
- App runtime: React Native for Vega (Amazon's fork of RN 0.7x / 0.83 with Static Hermes)
- UI layer: React Native components (View, Text, Pressable, Animated) — no HTML/CSS/DOM
- Package format: .vpkg produced exclusively by official Vega SDK CLI
- App distribution: Amazon Appstore

### Why NOT Web/React/Vite
- Vega OS does not expose a browser runtime for app execution
- .vpkg produced from HTML/dist is malformed and fails OS signature verification
- DOM APIs (getBoundingClientRect, classList, Canvas) are not available in Vega's JS runtime
- Web apps cannot register headless services — a mandatory Vega OS requirement

---

## 2. DEVELOPMENT ENVIRONMENT

| Tool | Version | Purpose |
|---|---|---|
| React Native for Vega | 0.83+ (Static Hermes) | Core app runtime |
| Vega SDK CLI (`vega`) | Latest | Project scaffold, build, package |
| Kepler CLI (`kepler`) | Latest | Device management, deploy, port forwarding |
| Node.js | 20 LTS | Build toolchain |
| Metro Bundler | Vega-bundled | JS bundler for Fast Refresh |
| Vega Virtual Device (VVD) | Latest | Emulator for development without hardware |
| Vega Studio (VS Code Extension) | Latest | IDE integration, hot reload, device logs |

### Windows Constraint and Resolution
- Vega SDK requires macOS 10.15+ or Ubuntu 20.04+
- Our machine: Windows 11
- **Resolution: Linux Docker container** running Ubuntu 24.04 with Vega SDK installed
- The Docker container provides the `vega` and `kepler` CLI commands
- Metro Bundler runs inside the container; host browser connects via port forwarding

---

## 3. APPLICATION DEPENDENCIES

### Vega-Required Packages (No Choice — Must Use These)
```json
{
  "@amazon-devices/react-navigation__native": "~7.0.0",
  "@amazon-devices/react-navigation__stack": "~7.0.0",
  "@amazon-devices/react-native-screens": "~2.0.0"
}
```

### Vega Media Packages
```json
{
  "@amazon-devices/react-native-w3cmedia": "latest"
}
```

### Vega UI Components
```json
{
  "@amazon-devices/kepler-ui-components": "latest"
}
```

### Vega Accessibility
```json
{
  "@amazon-devices/kepler-a11y-settings-interface-turbo": "latest"
}
```

### Do NOT Bundle (System-Provided by Vega OS)
- `react` — declared as peerDependency ONLY
- `react-native` — declared as peerDependency ONLY

### Approved Additional Libraries
- `react-native-reanimated` — smooth ambient particle animation (if Vega-compatible version exists)
- No `FlatList` for content rows — use `Carousel` from `@amazon-devices/kepler-ui-components`
- No `@react-navigation/` packages — use `@amazon-devices/react-navigation__` packages

---

## 4. ARCHITECTURE STYLE

- **Pattern:** Feature-based module architecture (each screen is a self-contained feature folder)
- **State:** React context + useReducer (no Redux; minimizes bundle size and bridge traffic)
- **Navigation:** Stack navigator via `createStackNavigator` from `@amazon-devices/react-navigation__stack`
- **Animation:** `React.Animated` API with `useNativeDriver: true` for all animations (mandatory for 60fps on Vega)
- **Side Effects:** `useEffect` with proper cleanup for timers, subscriptions, and media player instances
- **Headless Service:** Registered via `manifest.toml [offers]` section and implemented as a separate JS module

---

## 5. DESIGN SYSTEM TOKENS

### Color Palette (OLED-Optimized Dark)
| Token | Value | Usage |
|---|---|---|
| `--color-bg-deep` | `#0B0E17` | App background |
| `--color-surface` | `#141A29` | Card surface |
| `--color-surface-elevated` | `#1E2640` | Modal, elevated card |
| `--color-accent-cyan` | `#00E5FF` | Focus halo, primary CTA |
| `--color-accent-amber` | `#FF9900` | Amazon brand accent, ratings |
| `--color-text-primary` | `#FFFFFF` | Primary text |
| `--color-text-secondary` | `#B0BDD4` | Secondary / label text |
| `--color-text-muted` | `#5A6480` | Disabled / placeholder |

### Typography (React Native StyleSheet)
| Usage | fontSize | fontWeight | lineHeight |
|---|---|---|---|
| Ambient Clock | 96 | 200 | 96 |
| Hero Title | 48 | 700 | 56 |
| Section Header | 28 | 600 | 36 |
| Navigation Label | 24 | 500 | 32 |
| Body Text | 18 | 400 | 28 |
| Caption / Meta | 14 | 400 | 20 |

### Spacing System (8dp base grid)
- xs: 4dp
- sm: 8dp
- md: 16dp
- lg: 24dp
- xl: 32dp
- 2xl: 48dp
- 3xl: 64dp

### 10-Foot Safe Area (Overscan)
- Title Safe Zone: 90% inner boundary
- Horizontal padding: 80dp minimum from screen edge
- Vertical padding: 60dp minimum from screen edge
- No interactive elements within outer 5% overscan zone

---

## 6. BUILD PIPELINE

```
Development:
  npm start               → Metro Bundler (inside Docker/Linux)
  kepler device port-forward --port 8081 --forward false
  kepler device launch-app --dir .

Debug Build:
  npm run build:debug     → Vega SDK bundles app for development

Release Build:
  npm run build:release   → Vega SDK bundles + packages as .vpkg

Deployment:
  kepler device install-app --dir .
  kepler device launch-app --dir .
```

---

## 7. TESTING STRATEGY

| Layer | Tool | Target |
|---|---|---|
| Unit | Jest (Vega-compatible config) | Engine logic, state reducers |
| Component | React Native Testing Library | Component render and interaction |
| Integration | Vega Virtual Device (VVD) | Full D-Pad navigation flows |
| Performance | `vega exec perf kpi-visualizer` | KPI targets from PERFORMANCE-TARGETS.md |
| Accessibility | Manual on VVD | Caption settings, focus indicator audit |

---

## 8. DECISION LOG

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Runtime | React Native for Vega | React/Vite, Flutter | Vega OS requires RN. Only supported runtime. |
| Navigation | @amazon-devices/react-navigation__stack | @react-navigation/stack | Standard packages incompatible with Vega. |
| Lists | Kepler Carousel | FlatList | TV-optimized performance, built-in focus management |
| Focus | TVFocusGuideView + FocusManager | Custom DOM engine | Native layer; DOM not available |
| Animation | Animated API + useNativeDriver | Canvas, CSS transitions | Performance; JS bridge would drop frames |
| State | Context + useReducer | Redux, Zustand | Minimal bundle size; no external dep needed |
| Media | @amazon-devices/react-native-w3cmedia | react-native-video, ExoPlayer | Vega standard; others incompatible |
