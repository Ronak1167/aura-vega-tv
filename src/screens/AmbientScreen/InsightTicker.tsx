/**
 * InsightTicker.tsx
 *
 * Real-time AI Intelligence Ticker for the Aura Vega TV Ambient Screen.
 *
 * Displays:
 *  - Live narrative summary from the AutonomousInsightReporter
 *  - Trending genre & mood velocity pills (e.g., '🔥 Sci-Fi', '✨ Blockbuster')
 *  - Top predicted recommendation with match score
 *  - Generative motion backdrop cue (Runway Gen-4 / Higgsfield Kling synthesis)
 *  - Focusable card allowing full insight modal inspection via Fire TV D-Pad
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { insightReporter, InsightReport } from '../../engine/AutonomousInsightReporter';
import { colors, spacing, typography } from '../../styles/tokens';
import { FocusableCard } from '../../components/FocusableCard';

interface InsightTickerProps {
  onPressDetails?: (report: InsightReport) => void;
  style?: object;
}

export const InsightTicker: React.FC<InsightTickerProps> = ({ onPressDetails, style }) => {
  const [report, setReport] = useState<InsightReport | null>(() => insightReporter.getLastReport());
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for the live intelligence indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    // Check for fresh insight reports every 5 seconds
    const interval = setInterval(() => {
      const latest = insightReporter.getLastReport();
      if (latest) {
        setReport(latest);
      }
    }, 5000);

    return () => {
      pulseLoop.stop();
      clearInterval(interval);
    };
  }, [pulseAnim]);

  const narrative = report?.narrativeSummary ??
    'Vega AI Consensus is monitoring household preferences & curating evening entertainment.';

  const topPick = report?.topRecommendation?.topPick?.item.title ?? 'Dune: Part Two';
  const topMatch = report?.topRecommendation?.topPick?.matchPercentage ?? 94;
  const trendSignals = report?.trendSignals ?? [
    { dimension: 'genre', label: 'Sci-Fi', strength: 0.95, direction: 'rising' },
    { dimension: 'mood', label: 'Blockbuster', strength: 0.88, direction: 'rising' },
  ];

  return (
    <FocusableCard
      onPress={() => report && onPressDetails?.(report)}
      style={[styles.container, style]}
      accentColor={colors.accentCyan}
    >
      <View style={styles.headerRow}>
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <Text style={styles.liveText}>VEGA AI INTELLIGENCE</Text>
        </View>

        <Text style={styles.topPickText}>
          Next Match: <Text style={styles.topPickHighlight}>{topPick}</Text> ({topMatch}%)
        </Text>
      </View>

      <Text style={styles.narrativeText} numberOfLines={2}>
        {narrative}
      </Text>

      <View style={styles.signalsRow}>
        {trendSignals.slice(0, 3).map((sig, idx) => (
          <View key={`sig-${idx}`} style={styles.signalPill}>
            <Text style={styles.signalText}>
              {sig.direction === 'rising' ? '🔥 ' : '📊 '}
              {sig.label}
            </Text>
          </View>
        ))}

        {report?.generativeMotionPrompt && (
          <View style={styles.motionPill}>
            <Text style={styles.motionText} numberOfLines={1}>
              🎨 Scene: {report.generativeMotionPrompt.slice(0, 38)}…
            </Text>
          </View>
        )}
      </View>
    </FocusableCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 20, 32, 0.82)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCyan,
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentCyan,
    letterSpacing: 1.2,
  },
  topPickText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  topPickHighlight: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  narrativeText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    fontWeight: '400',
    marginVertical: spacing.xs,
  },
  signalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  signalPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  signalText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentCyan,
  },
  motionPill: {
    backgroundColor: 'rgba(255, 153, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.25)',
  },
  motionText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentAmber,
  },
});
