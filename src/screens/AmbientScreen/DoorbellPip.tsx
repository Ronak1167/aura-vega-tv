import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAlert } from '../../context/AlertContext';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing } from '../../styles/tokens';

export const DoorbellPip: React.FC = () => {
  const { activeAlert, dismissAlert } = useAlert();

  useEffect(() => {
    if (!activeAlert) return;
    // Auto dismiss after 10 seconds if not interacted
    const timer = setTimeout(() => {
      dismissAlert();
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeAlert, dismissAlert]);

  if (!activeAlert) return null;

  return (
    <View style={styles.pipOverlay}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.cameraTitle}>{activeAlert.cameraName}</Text>
          </View>
          <Text style={styles.timestamp}>{activeAlert.timestamp}</Text>
        </View>

        {/* Snapshot image */}
        <Image
          source={{ uri: activeAlert.snapshotUrl }}
          style={styles.snapshot}
          resizeMode="cover"
        />

        {/* Info & Action */}
        <View style={styles.footer}>
          <Text style={styles.eventText}>{activeAlert.eventDescription}</Text>
          <FocusableCard
            onPress={dismissAlert}
            style={styles.dismissBtn}
            accentColor={colors.statusAlert}
          >
            <Text style={styles.dismissText}>Dismiss (BACK)</Text>
          </FocusableCard>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pipOverlay: {
    position: 'absolute',
    top: 100,
    right: 80,
    width: 380,
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.accentAmber,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(11, 14, 23, 0.85)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusAlert,
    marginRight: 6,
  },
  cameraTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  snapshot: {
    width: '100%',
    height: 200,
    backgroundColor: colors.bgDeep,
  },
  footer: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  eventText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 51, 102, 0.2)',
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.statusAlert,
  },
});
