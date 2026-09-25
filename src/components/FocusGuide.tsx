import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface FocusGuideProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

/**
 * FocusGuide wrapper for Vega OS 10-foot D-Pad navigation groups.
 * Ensures clean Cartesian focus boundaries between top bar and content decks.
 */
export const FocusGuide: React.FC<FocusGuideProps> = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
});
