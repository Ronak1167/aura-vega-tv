import React from 'react';
import { View, Text, StyleSheet, Modal, Image, ScrollView } from 'react-native';
import { MediaItem, RecommendationResult } from '../../types';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing } from '../../styles/tokens';

interface WinnerModalProps {
  winner: MediaItem | null;
  recommendation: RecommendationResult | null;
  visible: boolean;
  onWatchNow: (item: MediaItem) => void;
  onReset: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  recommendation,
  visible,
  onWatchNow,
  onReset,
}) => {
  if (!winner || !visible) return null;

  const evaluation = recommendation?.winner;
  const matchPercentage = evaluation?.matchPercentage ?? 92;
  const positiveFactors = evaluation?.positiveFactors ?? [
    'Unanimous match across all active viewers',
    'Ideal feature length for an evening watch',
    'Critical acclaim and audience favorite',
  ];
  const breakdown = evaluation?.breakdown;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.winnerCard}>
          {/* Confetti / Trophy Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerHeaderRow}>
              <Text style={styles.trophy}>🏆</Text>
              <View>
                <Text style={styles.bannerTitle}>CONSENSUS ACHIEVED</Text>
                <Text style={styles.bannerSubtitle}>
                  {evaluation?.summaryReason || "Unanimous match for tonight's session"}
                </Text>
              </View>
            </View>
            <View style={styles.matchScoreBadge}>
              <Text style={styles.matchScoreText}>{matchPercentage}% MATCH</Text>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.contentRow}>
            {/* Left: Film Preview */}
            <View style={styles.leftColumn}>
              <View style={styles.winnerPreview}>
                <Image
                  source={{ uri: winner.backdropUrl }}
                  style={styles.winnerBackdropImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                <View style={styles.previewInfo}>
                  <View style={styles.platformBadge}>
                    <Text style={styles.platformText}>{winner.streamingPlatform}</Text>
                  </View>
                  <Text style={styles.title}>{winner.title}</Text>
                  <Text style={styles.meta}>
                    {winner.year} • {winner.runtime} • IMDb {winner.imdbScore} • 🍅 {winner.rottenTomatoes}%
                  </Text>
                  <Text style={styles.synopsis} numberOfLines={3}>
                    {winner.synopsis}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right: "Why This?" Intelligence Panel */}
            <View style={styles.rightColumn}>
              <Text style={styles.whyHeader}>WHY AURA RECOMMENDED THIS</Text>

              {/* Factors List */}
              <View style={styles.factorsList}>
                {positiveFactors.slice(0, 4).map((factor, index) => (
                  <View key={index} style={styles.factorRow}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>

              {/* Score Breakdown Indicators */}
              {breakdown && (
                <View style={styles.breakdownGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricVal}>{breakdown.affinityScore}%</Text>
                    <Text style={styles.metricLabel}>Group Affinity</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricVal}>{breakdown.qualityScore}%</Text>
                    <Text style={styles.metricLabel}>Quality Score</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricVal}>{breakdown.contextScore}%</Text>
                    <Text style={styles.metricLabel}>Context Fit</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricVal}>{breakdown.runtimeScore}%</Text>
                    <Text style={styles.metricLabel}>Runtime Fit</Text>
                  </View>
                </View>
              )}

              {recommendation?.contextSummary && (
                <Text style={styles.contextFooter}>
                  Scored for: {recommendation.contextSummary}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <FocusableCard
              onPress={() => onWatchNow(winner)}
              hasTVPreferredFocus={true}
              style={styles.watchNowBtn}
              accentColor={colors.accentAmber}
            >
              <Text style={styles.watchNowText}>▶ Watch Now ({winner.streamingPlatform})</Text>
            </FocusableCard>

            <FocusableCard
              onPress={onReset}
              style={styles.resetBtn}
              accentColor={colors.textSecondary}
            >
              <Text style={styles.resetText}>Vote Again</Text>
            </FocusableCard>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerCard: {
    width: 960,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accentAmber,
    overflow: 'hidden',
    shadowColor: colors.accentAmber,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 24,
    padding: spacing.xl,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    marginBottom: spacing.lg,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophy: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accentAmber,
    letterSpacing: 1.2,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(255, 153, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.accentAmber,
  },
  matchScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accentAmber,
    letterSpacing: 0.8,
  },
  contentRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  leftColumn: {
    flex: 1,
    marginRight: spacing.lg,
  },
  winnerPreview: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  winnerBackdropImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 23, 0.75)',
  },
  previewInfo: {
    padding: spacing.md,
  },
  platformBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.accentAmber,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentAmber,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  synopsis: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'space-between',
  },
  whyHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accentCyan,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  factorsList: {
    marginBottom: spacing.md,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accentCyan,
    marginRight: 8,
    marginTop: 1,
  },
  factorText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 8, 14, 0.6)',
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  contextFooter: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  watchNowBtn: {
    backgroundColor: colors.accentAmber,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: spacing.md,
  },
  watchNowText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
