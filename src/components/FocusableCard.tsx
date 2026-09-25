import React, { useRef, useState } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { colors, tvSafeLayout } from '../styles/tokens';

interface FocusableCardProps {
  onPress?: (event: GestureResponderEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  accentColor?: string;
  hasTVPreferredFocus?: boolean;
}

/**
 * TV-optimized FocusableCard with high-contrast accessibility ring,
 * native-driven 60fps scaling, and Cartesian D-Pad alignment.
 */
export const FocusableCard: React.FC<FocusableCardProps> = ({
  onPress,
  onFocus,
  onBlur,
  style,
  focusedStyle,
  children,
  accentColor = colors.focusRing,
  hasTVPreferredFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: tvSafeLayout.focusScale,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onBlur?.();
  };

  return (
    <Pressable
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={({ pressed }) => [
        styles.cardContainer,
        style,
        isFocused && [
          styles.cardFocused,
          { borderColor: accentColor },
          focusedStyle,
        ],
        pressed && styles.cardPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.innerScaleView,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: tvSafeLayout.cardRadius,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'visible',
    margin: 8,
  },
  cardFocused: {
    borderWidth: tvSafeLayout.focusBorderWidth,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.accentCyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 16,
    zIndex: 10,
  },
  cardPressed: {
    opacity: 0.9,
  },
  innerScaleView: {
    width: '100%',
    height: '100%',
    borderRadius: tvSafeLayout.cardRadius,
    overflow: 'hidden',
  },
});
