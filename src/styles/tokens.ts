/**
 * Aura Vega TV - Design System Tokens
 * Optimized for OLED Displays and 10-foot Living Room UI
 * Follows DESIGN-SYSTEM.md and TECH-STACK.md specification
 */

export const colors = {
  // Backgrounds (OLED Pure Black & Deep Cosmic Navy)
  bgDeep: '#0B0E17',
  bgDark: '#080A10',
  surface: '#141A29',
  surfaceElevated: '#1E2640',
  surfaceHover: '#2A3456',

  // Accent & Brand (Cyber Cyan & Amazon Warm Amber)
  accentCyan: '#00E5FF',
  accentCyanGlow: 'rgba(0, 229, 255, 0.4)',
  accentAmber: '#FF9900',
  accentAmberGlow: 'rgba(255, 153, 0, 0.35)',

  // Status & Telemetry
  statusLive: '#00FF66',
  statusAlert: '#FF3366',
  statusWarning: '#FFCC00',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#B0BDD4',
  textMuted: '#5A6480',
  textInverse: '#0B0E17',

  // Focus & Overlays
  focusRing: '#00E5FF',
  focusRingAmber: '#FF9900',
  focusOverlay: 'rgba(0, 229, 255, 0.12)',
  overlayDim: 'rgba(5, 7, 12, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  ambientClock: {
    fontSize: 96,
    fontWeight: '200' as const,
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    lineHeight: 56,
  },
  sectionHeader: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  subHeader: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  navigationLabel: {
    fontSize: 24,
    fontWeight: '500' as const,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  body: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textMuted,
    lineHeight: 20,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
};

export const tvSafeLayout = {
  // 10-foot TV overscan margins (90% title safe inner boundary)
  overscanHorizontal: 80,
  overscanVertical: 60,
  cardRadius: 16,
  modalRadius: 24,
  badgeRadius: 8,
  // Focus animation parameters
  focusScale: 1.06,
  focusElevation: 12,
  focusBorderWidth: 4,
};
