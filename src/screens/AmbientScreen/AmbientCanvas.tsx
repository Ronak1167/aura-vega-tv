import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AmbientParticle } from '../../components/AmbientParticle';
import { getAmbientTheme } from '../../utils/time-of-day';
import { formatTime } from '../../utils/format';
import { colors, typography } from '../../styles/tokens';

export const AmbientCanvas: React.FC = () => {
  const theme = useMemo(() => getAmbientTheme(), []);
  const timeInfo = formatTime();

  // Generate deterministic floating particles
  const particles = useMemo(() => {
    return [
      { id: 1, x: 220, y: 180, size: 6, color: theme.particleColors[0], duration: 4200 },
      { id: 2, x: 540, y: 340, size: 10, color: theme.particleColors[1] || theme.particleColors[0], duration: 5100 },
      { id: 3, x: 860, y: 220, size: 8, color: theme.particleColors[0], duration: 4800 },
      { id: 4, x: 1200, y: 400, size: 12, color: theme.particleColors[2] || theme.particleColors[0], duration: 6000 },
      { id: 5, x: 1450, y: 260, size: 7, color: theme.particleColors[0], duration: 4500 },
      { id: 6, x: 380, y: 550, size: 9, color: theme.particleColors[1] || theme.particleColors[0], duration: 5400 },
      { id: 7, x: 1050, y: 620, size: 8, color: theme.particleColors[0], duration: 4900 },
    ];
  }, [theme]);

  return (
    <View style={styles.canvasContainer}>
      {/* Background radial aura */}
      <View
        style={[
          styles.ambientGlow,
          { backgroundColor: theme.gradientColors[1] },
        ]}
      />

      {/* Floating 60fps Particles */}
      {particles.map((p) => (
        <AmbientParticle
          key={p.id}
          initialX={p.x}
          initialY={p.y}
          size={p.size}
          color={p.color}
          duration={p.duration}
        />
      ))}

      {/* Center Ambient Presence Display */}
      <View style={styles.centerPresence}>
        <Text style={styles.greetingText}>{theme.greeting.toUpperCase()}</Text>
        <View style={styles.clockRow}>
          <Text style={typography.ambientClock}>{timeInfo.time}</Text>
          <Text style={styles.clockPeriod}>{timeInfo.period}</Text>
        </View>
        <Text style={styles.moodDescription}>{theme.moodDescription}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: 800,
    height: 500,
    borderRadius: 250,
    opacity: 0.18,
    transform: [{ scale: 1.2 }],
  },
  centerPresence: {
    alignItems: 'center',
    zIndex: 2,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentCyan,
    letterSpacing: 4,
    marginBottom: 8,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  clockPeriod: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  moodDescription: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
