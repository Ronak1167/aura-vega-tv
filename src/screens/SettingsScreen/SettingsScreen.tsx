import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWeather } from '../../context/WeatherContext';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing, tvSafeLayout } from '../../styles/tokens';

interface SettingsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { unit, toggleUnit, weather } = useWeather();

  return (
    <View style={styles.container}>
      <View style={styles.safeZone}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SETTINGS & DIAGNOSTICS</Text>
          <FocusableCard
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accentColor={colors.accentCyan}
          >
            <Text style={styles.backBtnText}>← Back (BACK)</Text>
          </FocusableCard>
        </View>

        {/* Setting Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Living Room Preferences</Text>

          {/* Temperature Unit Toggle */}
          <FocusableCard
            onPress={toggleUnit}
            hasTVPreferredFocus={true}
            style={styles.settingCard}
            accentColor={colors.accentCyan}
          >
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Temperature Units</Text>
                <Text style={styles.settingDesc}>
                  Currently displaying in {unit === 'F' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
                </Text>
              </View>
              <View style={styles.valueBadge}>
                <Text style={styles.valueText}>Toggle: {unit === 'F' ? '°F' : '°C'}</Text>
              </View>
            </View>
          </FocusableCard>

          {/* Ambient Hub Mode */}
          <View style={styles.settingCardStatic}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Ambient OLED Protection</Text>
                <Text style={styles.settingDesc}>
                  Active (Subtle drift & ultra-deep dark points to prevent burn-in)
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>ENABLED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System & Vega OS Runtime Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vega OS Platform Diagnostics</Text>

          <View style={styles.diagnosticCard}>
            <Text style={styles.diagRow}>
              <Text style={styles.diagLabel}>Package ID: </Text>
              com.auravega.tv
            </Text>
            <Text style={styles.diagRow}>
              <Text style={styles.diagLabel}>Target OS Version: </Text>
              Vega OS 1.2 (SDK 0.24)
            </Text>
            <Text style={styles.diagRow}>
              <Text style={styles.diagLabel}>JavaScript Engine: </Text>
              Static Hermes (RN 0.83 Bridgeless)
            </Text>
            <Text style={styles.diagRow}>
              <Text style={styles.diagLabel}>Headless Service: </Text>
              com.auravega.tv.headless (Active)
            </Text>
            <Text style={styles.diagRow}>
              <Text style={styles.diagLabel}>Location Telemetry: </Text>
              {weather.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safeZone: {
    flex: 1,
    paddingHorizontal: tvSafeLayout.overscanHorizontal,
    paddingVertical: tvSafeLayout.overscanVertical,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  settingCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: spacing.md,
  },
  settingCardStatic: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: colors.textMuted,
  },
  valueBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentCyan,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.statusLive,
  },
  diagnosticCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  diagRow: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  diagLabel: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
