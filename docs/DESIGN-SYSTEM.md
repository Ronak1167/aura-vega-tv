# DESIGN SYSTEM — Colors, Typography, Tokens, and Components
**Project:** Aura Vega TV
**Version:** 1.0.0
**Platform:** React Native for Vega (StyleSheet objects — no CSS)
**Last Updated:** 2026-09-25

---

## 1. COLOR PALETTE

All values expressed as React Native hex strings or rgba.

### Base Palette
| Token Name | Value | Usage |
|---|---|---|
| `colors.bg.deep` | `#0B0E17` | App background (OLED deep black) |
| `colors.bg.surface` | `#141A29` | Card and modal surface |
| `colors.bg.elevated` | `#1E2640` | Elevated card, active state |
| `colors.bg.overlay` | `rgba(11,14,23,0.92)` | Modal backdrop scrim |

### Accent Colors
| Token Name | Value | Usage |
|---|---|---|
| `colors.accent.cyan` | `#00E5FF` | Focus halo, primary CTA, active indicator |
| `colors.accent.amber` | `#FF9900` | Amazon brand accent, star ratings |
| `colors.accent.green` | `#00C853` | Success, shortlisted indicator |
| `colors.accent.red` | `#FF1744` | Skip / dismiss indicator |

### Text Colors
| Token Name | Value | Usage |
|---|---|---|
| `colors.text.primary` | `#FFFFFF` | Headlines, card titles |
| `colors.text.secondary` | `#B0BDD4` | Subtitles, metadata |
| `colors.text.muted` | `#5A6480` | Disabled, placeholders, captions |
| `colors.text.inverse` | `#0B0E17` | Text on light backgrounds |
| `colors.text.accent` | `#00E5FF` | Highlighted labels, links |

### Gradient Themes (Time-of-Day)
| Phase | Start Color | End Color | Particle Color |
|---|---|---|---|
| Dawn | `#1A0A2E` | `#FF6B35` | `#FFB347` |
| Morning | `#1B3A5C` | `#4A9ECA` | `#FFF9C4` |
| Afternoon | `#0D2137` | `#2D6A9F` | `#E3F2FD` |
| Golden Hour | `#1A0E00` | `#FF8C00` | `#FFD700` |
| Twilight | `#0D0D1F` | `#6A0D6A` | `#E8B4FB` |
| Night | `#0B0E17` | `#141A29` | `#E0E8FF` |

---

## 2. TYPOGRAPHY

All typography uses React Native `StyleSheet.create` — not web CSS. System font is used unless custom font is bundled.

### Scale
| Name | fontSize | fontWeight | lineHeight | Usage |
|---|---|---|---|---|
| `text.clock` | 96 | '200' | 96 | Ambient clock display |
| `text.clockSmall` | 64 | '200' | 64 | Compact clock in GlanceBar |
| `text.hero` | 48 | '700' | 56 | Screen titles, winner reveal |
| `text.title` | 36 | '700' | 44 | Card titles (focused) |
| `text.heading` | 28 | '600' | 36 | Section headers |
| `text.navLabel` | 24 | '500' | 32 | Navigation labels |
| `text.body` | 18 | '400' | 28 | Body text, descriptions |
| `text.label` | 16 | '500' | 24 | Widget labels, badges |
| `text.caption` | 14 | '400' | 20 | Meta info, timestamps |
| `text.micro` | 12 | '400' | 16 | Fine print (use sparingly) |

### Minimum readable size for 10-foot: 14sp (captions only) — prefer 18sp for all body text.

---

## 3. SPACING SYSTEM

```typescript
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xl2: 48,
  xl3: 64,
  xl4: 80,   // Horizontal safe area minimum
  xl5: 96,
} as const
```

---

## 4. SAFE AREA CONSTANTS

```typescript
export const safeArea = {
  // 10-foot TV safe zones (dp)
  horizontalPadding: 80,        // Minimum from screen edge (horizontal)
  verticalPadding: 60,          // Minimum from screen edge (vertical)
  titleSafePercent: 0.90,       // Inner 90% = title safe zone
  actionSafePercent: 0.95,      // Inner 95% = action safe zone
  // No interactive elements beyond actionSafePercent from center
} as const
```

---

## 5. FOCUS INDICATOR STANDARDS

Vega OS accessibility requires physical changes on focus — color/opacity alone is insufficient.

### Standard Focus Style
```typescript
const focusedStyle = {
  borderWidth: 3,
  borderColor: colors.accent.cyan,      // Electric cyan glow
  transform: [{ scale: 1.08 }],         // Scale up on focus
  // Note: scale is handled by Animated.Value for smooth transition
  shadowColor: colors.accent.cyan,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 12,
  elevation: 8,                         // Android elevation (used on Vega)
}

const unfocusedStyle = {
  borderWidth: 0,
  borderColor: 'transparent',
  transform: [{ scale: 1.0 }],
  shadowOpacity: 0,
  elevation: 0,
}
```

### Focus Animation (Animated API with useNativeDriver)
```typescript
// All focus animations MUST use useNativeDriver: true
const focusAnim = useRef(new Animated.Value(0)).current
const scale = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.08] })
const glowOpacity = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.8] })

// On focus: Animated.timing(focusAnim, { toValue: 1, duration: 150, useNativeDriver: true })
// On blur:  Animated.timing(focusAnim, { toValue: 0, duration: 100, useNativeDriver: true })
```

---

## 6. COMPONENT SIZING STANDARDS

### Minimum Touch Target (A11y compliance)
```typescript
export const minTouchTarget = {
  width: 48,
  height: 48,
}
```

### Card Dimensions
| Card Type | Width | Height | Aspect Ratio |
|---|---|---|---|
| Media Card (Carousel) | 200dp | 300dp | 2:3 (portrait poster) |
| Wide Card (Backdrop) | 320dp | 180dp | 16:9 |
| Widget Card (GlanceBar) | 140dp | 64dp | Flexible |
| Doorbell PiP | 320dp | 180dp | 16:9 |

### Glance Bar
```typescript
export const glanceBar = {
  height: 80,
  paddingHorizontal: spacing.xl4,   // 80dp from screen edge
  paddingVertical: spacing.lg,      // 24dp
  widgetSpacing: spacing.xl,        // 32dp between widgets
}
```

---

## 7. ELEVATION / DEPTH SYSTEM

| Level | Usage | elevation | Shadow |
|---|---|---|---|
| 0 | Background canvas | 0 | None |
| 1 | Default card surface | 2 | subtle |
| 2 | Focused card | 8 | cyan glow |
| 3 | Modal overlay | 16 | deep |
| 4 | PiP overlay | 20 | prominent |

---

## 8. ANIMATION CONSTANTS

```typescript
export const animation = {
  focusIn:   { duration: 150, useNativeDriver: true },
  focusOut:  { duration: 100, useNativeDriver: true },
  cardSwipe: { duration: 250, useNativeDriver: true },
  pipSlide:  { duration: 300, useNativeDriver: true },
  themeTransition: { duration: 2000, useNativeDriver: false }, // color interpolation needs JS driver
  particleDrift: { duration: 8000, useNativeDriver: true },
} as const
```

Note: Color interpolations CANNOT use native driver. Keep color animations separate from transform/opacity animations.

---

## 9. ICON STANDARDS

- Use vector icons or Pressable+Text combinations — not raster images for UI icons
- If using an icon library, verify it is RN-compatible and not web-only
- Minimum icon size: 24x24dp (UI), 32x32dp (navigation), 48x48dp (action targets)
- Focus state: icon inherits parent's focused style (no separate icon glow needed)

---

## 10. DARK MODE

Aura Vega TV is dark-only. No light mode toggle. All colors are OLED-optimized dark.
The ambient canvas provides visual warmth and variety through gradient themes.

---

*Design System is the single source of truth for all visual decisions.*
*No hardcoded colors or sizes in component files — all values reference this system.*
