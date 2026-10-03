/**
 * HealthPanel.tsx
 *
 * Ambient HUD overlay component displaying Vega OS self-healing system health.
 *
 * Capabilities:
 *  - Displays real-time composite health score (0–100)
 *  - Visual status indicators for the 9 core microservices
 *  - Self-healing recovery alerts & latency diagnostics
 *  - D-Pad focusable card allowing expandable details in the 10-foot TV UI
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { healthMonitor, HealthSnapshot, ServiceMetrics } from '../../services/VegaOSHealthMonitor';
import { prefetchService } from '../../services/PredictivePrefetchService';
import { colors, spacing } from '../../styles/tokens';
import { FocusableCard } from '../../components/FocusableCard';

interface HealthPanelProps {
  onToggleExpand?: () => void;
  style?: object;
}

export const HealthPanel: React.FC<HealthPanelProps> = ({ onToggleExpand, style }) => {
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const updateHealth = async () => {
      try {
        const snap = await healthMonitor.generateSnapshot();
        if (isMounted) setSnapshot(snap);
      } catch (err) {
        console.warn('[HealthPanel] Failed to retrieve snapshot:', err);
      }
    };

    updateHealth();
    const interval = setInterval(updateHealth, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const compositeScore = snapshot?.compositeScore ?? 98;
  const overallStatus = snapshot?.overallStatus ?? 'HEALTHY';
  const services: ServiceMetrics[] = snapshot?.services ?? [];
  const hitRate = Math.round((prefetchService.getHitRate() ?? 0) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return colors.statusLive;
      case 'DEGRADED':
      case 'RECOVERING':
        return colors.statusWarning;
      case 'CRITICAL':
      case 'FAILED':
        return colors.statusAlert;
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    setExpanded(prev => !prev);
    onToggleExpand?.();
  };

  return (
    <FocusableCard
      onPress={handlePress}
      style={[styles.container, style]}
      accentColor={getStatusColor(overallStatus)}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(overallStatus) }]} />
          <Text style={styles.titleText}>VEGA OS HEALTH</Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={[styles.scoreNumber, { color: getStatusColor(overallStatus) }]}>
            {compositeScore}
          </Text>
          <Text style={styles.scoreTotal}>/100</Text>
        </View>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <Text style={styles.statusLabel}>
          Status: <Text style={{ color: getStatusColor(overallStatus), fontWeight: '600' }}>{overallStatus}</Text>
        </Text>
        <Text style={styles.prefetchLabel}>
          CDN Hit Rate: <Text style={styles.highlightText}>{hitRate}%</Text>
        </Text>
        <Text style={styles.toggleHint}>
          {expanded ? '▲ Collapse HUD' : '▼ Expand HUD'}
        </Text>
      </View>

      {/* Expanded Service Matrix */}
      {expanded && (
        <View style={styles.expandedMatrix}>
          <View style={styles.divider} />
          <View style={styles.grid}>
            {services.map((svc: ServiceMetrics) => (
              <View key={svc.name} style={styles.serviceItem}>
                <View style={[styles.miniDot, { backgroundColor: getStatusColor(svc.status) }]} />
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceLatency}>{svc.avgLatencyMs}ms</Text>
              </View>
            ))}
          </View>

          {snapshot?.selfHealActions && snapshot.selfHealActions.length > 0 && (
            <View style={styles.healingAlert}>
              <Text style={styles.healingText}>
                🔧 {snapshot.selfHealActions[snapshot.selfHealActions.length - 1]}
              </Text>
            </View>
          )}
        </View>
      )}
    </FocusableCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1.1,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreTotal: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prefetchLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  highlightText: {
    color: colors.accentCyan,
    fontWeight: '600',
  },
  toggleHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  expandedMatrix: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '32%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  serviceName: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  serviceLatency: {
    fontSize: 10,
    color: colors.textMuted,
  },
  healingAlert: {
    marginTop: spacing.xs,
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.25)',
  },
  healingText: {
    fontSize: 11,
    color: colors.statusWarning,
  },
});
