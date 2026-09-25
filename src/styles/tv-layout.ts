import { StyleSheet } from 'react-native';
import { colors, spacing, tvSafeLayout } from './tokens';

/**
 * Standard 10-foot TV Layout utilities for React Native for Vega.
 * Target display: 1920x1080 (1080p full HD base resolution on Fire TV)
 */
export const tvStyles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safeContainer: {
    flex: 1,
    paddingHorizontal: tvSafeLayout.overscanHorizontal,
    paddingVertical: tvSafeLayout.overscanVertical,
  },
  topBarContainer: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardBase: {
    borderRadius: tvSafeLayout.cardRadius,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardFocused: {
    borderColor: colors.focusRing,
    borderWidth: tvSafeLayout.focusBorderWidth,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.accentCyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: tvSafeLayout.focusElevation,
  },
  cardFocusedAmber: {
    borderColor: colors.accentAmber,
    borderWidth: tvSafeLayout.focusBorderWidth,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.accentAmber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: tvSafeLayout.focusElevation,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDim,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: 960,
    backgroundColor: colors.surfaceElevated,
    borderRadius: tvSafeLayout.modalRadius,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.xxl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 32,
    elevation: 24,
  },
});
