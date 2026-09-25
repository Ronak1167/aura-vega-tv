import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AmbientParticleProps {
  initialX: number;
  initialY: number;
  size: number;
  color: string;
  duration: number;
}

/**
 * 60fps Native-driven ambient particle node for living room canvas.
 */
export const AmbientParticle: React.FC<AmbientParticleProps> = ({
  initialX,
  initialY,
  size,
  color,
  duration,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -30,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.45,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.15,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    floatAnim.start();
    return () => floatAnim.stop();
  }, [duration, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
