import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWeather } from '../../context/WeatherContext';
import { useAlert } from '../../context/AlertContext';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing, typography } from '../../styles/tokens';
import { formatTime, formatDate, formatTemp } from '../../utils/format';

interface GlanceBarProps {
  onEnterConsensus?: () => void;
  onOpenSettings?: () => void;
}

export const GlanceBar: React.FC<GlanceBarProps> = ({
  onEnterConsensus,
  onOpenSettings,
}) => {
  const { weather, unit } = useWeather();
  const { activeAlert, triggerDoorbellEvent } = useAlert();
  const timeInfo = formatTime();
  const dateStr = formatDate();

  return (
    <View style={styles.container}>
      {/* Left: Clock and Date */}
      <View style={styles.leftGroup}>
        <View style={styles.timeBadge}>
          <Text style={styles.clockText}>{timeInfo.time}</Text>
          <Text style={styles.periodText}>{timeInfo.period}</Text>
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>

      {/* Center: Weather Telemetry Widget */}
      <View style={styles.weatherWidget}>
        <Text style={styles.tempText}>{formatTemp(weather.temperature, unit)}</Text>
        <View style={styles.weatherMeta}>
          <Text style={styles.conditionText}>{weather.condition}</Text>
          <Text style={styles.locationText}>{weather.location} • AQI {weather.airQualityIndex}</Text>
        </View>
      </View>

      {/* Right: Actions (Simulate Doorbell, Couch Consensus CTA) */}
      <View style={styles.rightGroup}>
        {/* Simulate Doorbell Ring Button for testing & demos */}
        <FocusableCard
          onPress={() => triggerDoorbellEvent()}
          style={styles.actionBtn}
          accentColor={activeAlert ? colors.statusAlert : colors.accentAmber}
        >
          <Text style={styles.actionBtnText}>
            {activeAlert ? '🔔 Doorbell Active' : '🔔 Test Doorbell'}
          </Text>
        </FocusableCard>

        {/* Couch Consensus Entry CTA */}
        <FocusableCard
          onPress={onEnterConsensus}
          style={styles.consensusBtn}
          accentColor={colors.accentCyan}
          hasTVPreferredFocus={true}
        >
          <Text style={styles.consensusBtnText}>🎬 Start Co-Viewing</Text>
        </FocusableCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 76,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(20, 26, 41, 0.75)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.xl,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: spacing.md,
  },
  clockText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentCyan,
    marginLeft: 4,
  },
  dateText: {
    ...typography.body,
    color: colors.textSecondary,
    borderLeftWidth: 1,
    borderLeftColor: colors.glassBorder,
    paddingLeft: spacing.md,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accentAmber,
    marginRight: spacing.sm,
  },
  weatherMeta: {
    justifyContent: 'center',
  },
  conditionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  locationText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    marginRight: spacing.sm,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  consensusBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },
  consensusBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentCyan,
  },
});
