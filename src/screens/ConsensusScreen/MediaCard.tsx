import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MediaItem } from '../../types';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing, typography } from '../../styles/tokens';

interface MediaCardProps {
  item: MediaItem;
  onPress: () => void;
  onShortlist?: () => void;
  onSkip?: () => void;
  hasTVPreferredFocus?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
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

        {/* Platform Badge */}
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{item.streamingPlatform}</Text>
        </View>

        {/* Card Metadata */}
        <View style={styles.infoArea}>
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
  infoArea: {
    padding: spacing.md,
    backgroundColor: 'rgba(20, 26, 41, 0.92)',
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
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadgeImdb: {
    backgroundColor: '#332800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  scoreBadgeRt: {
    backgroundColor: '#330D14',
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
