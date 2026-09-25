import React from 'react';
import { View, Text, StyleSheet, Modal, Image } from 'react-native';
import { MediaItem } from '../../types';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing } from '../../styles/tokens';

interface WinnerModalProps {
  winner: MediaItem | null;
  visible: boolean;
  onWatchNow: (item: MediaItem) => void;
  onReset: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  visible,
  onWatchNow,
  onReset,
}) => {
  if (!winner || !visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.winnerCard}>
          {/* Confetti / Trophy Banner */}
          <View style={styles.banner}>
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.bannerTitle}>CONSENSUS ACHIEVED!</Text>
            <Text style={styles.bannerSubtitle}>
              Everyone agreed on the tonight's choice
            </Text>
          </View>

          {/* Winner Title Card */}
          <View style={styles.winnerPreview}>
            <Image
              source={{ uri: winner.backdropUrl }}
              style={styles.winnerBackdropImage}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.winnerDetails}>
              <Text style={styles.platform}>{winner.streamingPlatform}</Text>
              <Text style={styles.title}>{winner.title}</Text>
              <Text style={styles.meta}>
                {winner.year} • {winner.runtime} • IMDb {winner.imdbScore} • 🍅 {winner.rottenTomatoes}%
              </Text>
              <Text style={styles.synopsis} numberOfLines={2}>
                {winner.synopsis}
              </Text>
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
    backgroundColor: 'rgba(5, 7, 12, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerCard: {
    width: 840,
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
  },
  banner: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(255, 153, 0, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 153, 0, 0.25)',
  },
  trophy: {
    fontSize: 48,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accentAmber,
    letterSpacing: 2,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  winnerPreview: {
    height: 240,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  winnerBackdropImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 23, 0.72)',
  },
  winnerDetails: {
    padding: spacing.xl,
  },
  platform: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCyan,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  synopsis: {
    fontSize: 14,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  watchNowBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 153, 0, 0.2)',
    borderWidth: 1,
    borderColor: colors.accentAmber,
    marginRight: spacing.lg,
  },
  watchNowText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.accentAmber,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
