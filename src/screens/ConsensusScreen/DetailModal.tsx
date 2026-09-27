import React from 'react';
import { View, Text, StyleSheet, Image, Modal } from 'react-native';
import { MediaItem } from '../../types';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing, typography } from '../../styles/tokens';

interface DetailModalProps {
  item: MediaItem | null;
  visible: boolean;
  onClose: () => void;
  onShortlist: (item: MediaItem) => void;
  onSkip: (item: MediaItem) => void;
  onWatchNow?: (item: MediaItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  visible,
  onClose,
  onShortlist,
  onSkip,
  onWatchNow,
}) => {
  if (!item || !visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Backdrop Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: item.backdropUrl }}
              style={styles.backdropImage}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
            <View style={styles.headerContent}>
              <Text style={styles.badge}>{item.streamingPlatform}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.year} • {item.rating} • {item.runtime} • {item.mood}
              </Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.synopsis}>{item.synopsis}</Text>

            {item.cast && (
              <Text style={styles.castText}>
                <Text style={styles.castLabel}>Starring: </Text>
                {item.cast.join(', ')}
              </Text>
            )}

            {/* Tag pills */}
            <View style={styles.tagRow}>
              {item.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* D-Pad Action Buttons */}
            <View style={styles.actionRow}>
              <FocusableCard
                onPress={() => onShortlist(item)}
                hasTVPreferredFocus={true}
                style={styles.shortlistBtn}
                accentColor={colors.statusLive}
              >
                <Text style={styles.shortlistBtnText}>✓ Add to Shortlist</Text>
              </FocusableCard>

              <FocusableCard
                onPress={() => onSkip(item)}
                style={styles.skipBtn}
                accentColor={colors.statusAlert}
              >
                <Text style={styles.skipBtnText}>✕ Pass / Skip</Text>
              </FocusableCard>

              {onWatchNow && (
                <FocusableCard
                  onPress={() => onWatchNow(item)}
                  style={styles.watchBtn}
                  accentColor={colors.accentAmber}
                >
                  <Text style={styles.watchBtnText}>▶ Watch Film</Text>
                </FocusableCard>
              )}

              <FocusableCard
                onPress={onClose}
                style={styles.closeBtn}
                accentColor={colors.accentCyan}
              >
                <Text style={styles.closeBtnText}>Back (Esc)</Text>
              </FocusableCard>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 900,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  header: {
    height: 300,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  backdropImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 14, 23, 0.65)',
  },
  headerContent: {
    padding: spacing.xl,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentAmber,
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  body: {
    padding: spacing.xl,
  },
  synopsis: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  castText: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  castLabel: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortlistBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    marginRight: spacing.md,
  },
  shortlistBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.statusLive,
  },
  skipBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    marginRight: spacing.md,
  },
  skipBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.statusAlert,
  },
  watchBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 153, 0, 0.2)',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentAmber,
  },
  watchBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentAmber,
  },
  closeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
