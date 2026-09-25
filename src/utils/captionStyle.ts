/**
 * captionStyle.ts
 *
 * Pure mapping functions: CaptioningProps enums → React Native TextStyle / ViewStyle.
 * Per official Vega docs (vega_a11y_caption_settings.md).
 */
import { TextStyle, ViewStyle } from 'react-native';
import { CaptioningProps } from '../hooks/useCaptionSettings';

// Edge-type enum values from CaptioningManager (Android)
const EDGE_NONE = 0;
const EDGE_OUTLINE = 1;
const EDGE_DROP_SHADOW = 2;
const EDGE_RAISED = 3;
const EDGE_DEPRESSED = 4;

// Font-style enum values
const FONT_STYLE_NORMAL = 0;
const FONT_STYLE_BOLD = 1;
const FONT_STYLE_ITALIC = 2;
const FONT_STYLE_BOLD_ITALIC = 3;

function argbToRgba(argb: number | undefined): string | undefined {
  if (argb == null) {
    return undefined;
  }
  const a = ((argb >> 24) & 0xff) / 255;
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

function mapFontStyle(
  fontStyle: number | undefined,
): Pick<TextStyle, 'fontStyle' | 'fontWeight'> {
  switch (fontStyle) {
    case FONT_STYLE_BOLD:
      return { fontWeight: 'bold', fontStyle: 'normal' };
    case FONT_STYLE_ITALIC:
      return { fontStyle: 'italic', fontWeight: 'normal' };
    case FONT_STYLE_BOLD_ITALIC:
      return { fontStyle: 'italic', fontWeight: 'bold' };
    case FONT_STYLE_NORMAL:
    default:
      return { fontStyle: 'normal', fontWeight: 'normal' };
  }
}

function mapEdgeType(
  edgeType: number | undefined,
  edgeColor: number | undefined,
): Pick<TextStyle, 'textShadowColor' | 'textShadowOffset' | 'textShadowRadius'> {
  const color = argbToRgba(edgeColor) ?? 'rgba(0,0,0,0.9)';
  switch (edgeType) {
    case EDGE_DROP_SHADOW:
      return {
        textShadowColor: color,
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
      };
    case EDGE_RAISED:
      return {
        textShadowColor: color,
        textShadowOffset: { width: -1, height: -1 },
        textShadowRadius: 2,
      };
    case EDGE_DEPRESSED:
      return {
        textShadowColor: color,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      };
    case EDGE_OUTLINE:
      // RN doesn't support outline directly; use a shadow approximation
      return {
        textShadowColor: color,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 3,
      };
    case EDGE_NONE:
    default:
      return {};
  }
}

export function buildCaptionTextStyle(prefs: CaptioningProps): TextStyle {
  const BASE_SIZE = 22; // fallback sp → pt approximation
  const fontScale = prefs.fontScale ?? 1;
  const textSizeSp = prefs.textSizeSp ?? BASE_SIZE;
  const fontSize = Math.round(textSizeSp * fontScale);

  return {
    color: argbToRgba(prefs.foregroundColor) ?? '#FFFFFF',
    fontSize,
    fontFamily: prefs.fontFamily ?? undefined,
    ...mapFontStyle(prefs.fontStyle),
    ...mapEdgeType(prefs.edgeType, prefs.edgeColor),
  };
}

export function buildCaptionWindowStyle(prefs: CaptioningProps): ViewStyle {
  return {
    backgroundColor: argbToRgba(prefs.windowColor) ?? 'rgba(0,0,0,0.0)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  };
}

export function buildCaptionBgStyle(prefs: CaptioningProps): ViewStyle {
  return {
    backgroundColor: argbToRgba(prefs.backgroundColor) ?? 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  };
}
