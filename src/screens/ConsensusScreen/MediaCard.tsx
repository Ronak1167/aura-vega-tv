import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MediaItem } from '../../types';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing, typography } from '../../styles/tokens';

interface MediaCardProps {
  item: MediaItem;
  matchPercentage?: number;
  onPress: () => void;
  onShortlist?: () => void;
  onSkip?: () => void;
  hasTVPreferredFocus?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  matchPercentage,
  onPress,
  hasTVPreferredFocus,
}) => {
  return (
    <FocusableCard
      onPress={onPress}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={styles.cardContainer}
      accentColor={colors.accentCyan}
    >
      <View style={styles.cardContent}>
        {/* Backdrop 16:9 */}
        <Image
          source={{ uri: item.backdropUrl }}
          style={styles.backdrop}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <View style={styles.gradientOverlay} />

        {/* Platform Badge (Top Left) */}
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{item.streamingPlatform}</Text>
        </View>

        {/* Match Percentage Badge (Top Right) */}
        {matchPercentage !== undefined && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{matchPercentage}% MATCH</Text>
          </View>
        )}

        {/* Card Metadata */}
        <View style={styles.infoArea}>
          {item.mood ? (
            <Text style={styles.moodLabel} numberOfLines={1}>
              {item.mood.toUpperCase()}
            </Text>
          ) : null}

          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.year}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{item.rating}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{item.runtime}</Text>
          </View>

          {/* Scores */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBadgeImdb}>
              <Text style={styles.scoreText}>★ {item.imdbScore}</Text>
            </View>
            <View style={styles.scoreBadgeRt}>
              <Text style={styles.scoreText}>🍅 {item.rottenTomatoes}%</Text>
            </View>
          </View>
        </View>
      </View>
    </FocusableCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 320,
    height: 380,
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 23, 0.65)',
  },
  platformBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentAmber,
  },
  matchBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentCyan,
    letterSpacing: 0.5,
  },
  infoArea: {
    padding: spacing.md,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCyan,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 14,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadgeImdb: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  scoreBadgeRt: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
