/**
 * CaptionOverlay.tsx
 *
 * Renders a styled caption cue over the video player when OS captions are
 * enabled. Reads live caption settings from the Vega accessibility turbo
 * module via useCaptionSettings and applies the user's preferences.
 *
 * When captionsEnabled === false, nothing is rendered.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCaptionSettings } from '../hooks/useCaptionSettings';
import {
  buildCaptionTextStyle,
  buildCaptionBgStyle,
  buildCaptionWindowStyle,
} from '../utils/captionStyle';

interface CaptionOverlayProps {
  currentCue?: string | null;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  currentCue,
}) => {
  const { captionsEnabled, captionStyle } = useCaptionSettings();

  if (!captionsEnabled || !currentCue) {
    return null;
  }

  const textStyle = buildCaptionTextStyle(captionStyle);
  const bgStyle = buildCaptionBgStyle(captionStyle);
  const windowStyle = buildCaptionWindowStyle(captionStyle);

  return (
    <View style={[styles.captionContainer, windowStyle]} pointerEvents="none">
      <View style={bgStyle}>
        <Text style={[styles.captionText, textStyle]}>{currentCue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    position: 'absolute',
    bottom: 80,
    left: '10%',
    right: '10%',
    alignItems: 'center',
    zIndex: 10,
  },
  captionText: {
    textAlign: 'center',
    lineHeight: 30,
  },
});
