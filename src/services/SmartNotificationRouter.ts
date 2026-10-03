/**
 * SmartNotificationRouter.ts
 *
 * Autonomous AI-powered notification routing engine for Vega OS.
 *
 * Capabilities:
 *  - Deduplicates near-identical doorbell / motion alerts within a 90s window
 *  - Classifies alert urgency using contextual AI rules
 *  - Routes alerts to: Ambient Overlay | Full Screen Interrupt | Silent Log | Grouped Digest
 *  - Generates smart action CTAs ("Buzz in?" / "Send away" / "Watch replay")
 *  - Suppresses non-urgent alerts during active viewing
 *  - Keeps a rolling audit log of all routing decisions
 */

import { DoorbellAlert } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RoutingChannel =
  | 'AMBIENT_TICKER'       // Small banner — low urgency, non-interrupting
  | 'OVERLAY_CARD'         // Focusable overlay — moderate urgency
  | 'FULL_SCREEN_ALERT'    // Full screen takeover — high urgency (package, safety)
  | 'SILENT_LOG';          // No UI — just audit trail

export type SmartCTA = {
  label: string;
  actionKey: string;   // Sent to Fire TV remote handler
  isPrimary: boolean;
};

export interface RoutedNotification {
  alertId: string;
  originalAlert: DoorbellAlert;
  channel: RoutingChannel;
  urgencyScore: number;       // 0–100
  isDuplicate: boolean;
  suppressedDuringPlayback: boolean;
  smartCTAs: SmartCTA[];
  routingReason: string;
  routedAt: string;
}

export interface RouterStats {
  totalRouted: number;
  duplicatesSuppressed: number;
  playbackSuppressed: number;
  channelBreakdown: Record<RoutingChannel, number>;
}

// ---------------------------------------------------------------------------
// Deduplication cache
// ---------------------------------------------------------------------------

const DEDUPE_WINDOW_MS = 90_000; // 90 seconds
interface DedupeEntry {
  cameraName: string;
  visitorType: string;
  firstSeenAt: number;
}
const dedupeCache: DedupeEntry[] = [];

function isDuplicate(alert: DoorbellAlert): boolean {
  const now = Date.now();
  // Prune stale entries
  const cutoff = now - DEDUPE_WINDOW_MS;
  while (dedupeCache.length > 0 && dedupeCache[0].firstSeenAt < cutoff) {
    dedupeCache.shift();
  }

  const match = dedupeCache.find(
    e => e.cameraName === alert.cameraName && e.visitorType === alert.visitorType,
  );
  if (match) return true;

  dedupeCache.push({
    cameraName: alert.cameraName,
    visitorType: alert.visitorType,
    firstSeenAt: now,
  });
  return false;
}

// ---------------------------------------------------------------------------
// Urgency classifier
// ---------------------------------------------------------------------------

const URGENCY_RULES: Array<{
  test: (a: DoorbellAlert) => boolean;
  score: number;
  reason: string;
}> = [
  {
    test: a => a.visitorType === 'delivery',
    score: 70,
    reason: 'Package delivery detected — moderate urgency',
  },
  {
    test: a => a.visitorType === 'family',
    score: 85,
    reason: 'Known family member at door — high urgency',
  },
  {
    test: a => a.visitorType === 'guest',
    score: 75,
    reason: 'Expected guest detected — high urgency',
  },
  {
    test: a => a.visitorType === 'motion' && a.eventDescription.toLowerCase().includes('loitering'),
    score: 95,
    reason: 'Potential loitering detected — critical urgency',
  },
  {
    test: a => a.visitorType === 'motion',
    score: 40,
    reason: 'Generic motion event — low urgency',
  },
];

function classifyUrgency(alert: DoorbellAlert): { score: number; reason: string } {
  for (const rule of URGENCY_RULES) {
    if (rule.test(alert)) {
      return { score: rule.score, reason: rule.reason };
    }
  }
  return { score: 30, reason: 'Unknown alert type — low urgency default' };
}

// ---------------------------------------------------------------------------
// Channel selector
// ---------------------------------------------------------------------------

function selectChannel(
  urgencyScore: number,
  isPlaybackActive: boolean,
  isDup: boolean,
): RoutingChannel {
  if (isDup) return 'SILENT_LOG';
  if (urgencyScore >= 90) return 'FULL_SCREEN_ALERT';          // Always interrupt, even during playback
  if (isPlaybackActive && urgencyScore < 80) return 'SILENT_LOG';  // Suppress during active viewing
  if (urgencyScore >= 75) return 'OVERLAY_CARD';
  if (urgencyScore >= 50) return 'AMBIENT_TICKER';
  return 'SILENT_LOG';
}

// ---------------------------------------------------------------------------
// CTA generator
// ---------------------------------------------------------------------------

function generateCTAs(alert: DoorbellAlert, channel: RoutingChannel): SmartCTA[] {
  if (channel === 'SILENT_LOG') return [];

  const baseCTAs: SmartCTA[] = [
    { label: '📷 View Camera', actionKey: 'VIEW_CAMERA', isPrimary: false },
  ];

  if (alert.visitorType === 'delivery') {
    return [
      { label: '📦 Mark Received', actionKey: 'MARK_RECEIVED', isPrimary: true },
      ...baseCTAs,
    ];
  }

  if (alert.visitorType === 'family') {
    return [
      { label: '🔓 Unlock Door', actionKey: 'UNLOCK_DOOR', isPrimary: true },
      { label: '👋 Buzz In', actionKey: 'BUZZ_IN', isPrimary: false },
      ...baseCTAs,
    ];
  }

  if (alert.visitorType === 'guest') {
    return [
      { label: '👋 Buzz In', actionKey: 'BUZZ_IN', isPrimary: true },
      { label: '🚫 Send Away', actionKey: 'SEND_AWAY', isPrimary: false },
      ...baseCTAs,
    ];
  }

  if (alert.visitorType === 'motion') {
    return [
      { label: '🔍 Investigate', actionKey: 'VIEW_CAMERA', isPrimary: true },
      { label: '✓ Dismiss', actionKey: 'DISMISS', isPrimary: false },
    ];
  }

  return baseCTAs;
}

// ---------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------

class SmartNotificationRouter {
  private stats: RouterStats = {
    totalRouted: 0,
    duplicatesSuppressed: 0,
    playbackSuppressed: 0,
    channelBreakdown: {
      AMBIENT_TICKER: 0,
      OVERLAY_CARD: 0,
      FULL_SCREEN_ALERT: 0,
      SILENT_LOG: 0,
    },
  };

  private auditLog: RoutedNotification[] = [];

  route(alert: DoorbellAlert, isPlaybackActive: boolean): RoutedNotification {
    const dup = isDuplicate(alert);
    const { score, reason } = classifyUrgency(alert);
    const channel = selectChannel(score, isPlaybackActive, dup);
    const ctAs = generateCTAs(alert, channel);

    const suppressedDuringPlayback =
      isPlaybackActive && channel === 'SILENT_LOG' && !dup && score < 80;

    const routed: RoutedNotification = {
      alertId: `nr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      originalAlert: alert,
      channel,
      urgencyScore: score,
      isDuplicate: dup,
      suppressedDuringPlayback,
      smartCTAs: ctAs,
      routingReason: reason,
      routedAt: new Date().toISOString(),
    };

    // Update stats
    this.stats.totalRouted++;
    this.stats.channelBreakdown[channel]++;
    if (dup) this.stats.duplicatesSuppressed++;
    if (suppressedDuringPlayback) this.stats.playbackSuppressed++;

    // Keep rolling log (max 100 entries)
    this.auditLog.push(routed);
    if (this.auditLog.length > 100) this.auditLog.shift();

    return routed;
  }

  getStats(): RouterStats {
    return { ...this.stats };
  }

  getAuditLog(): RoutedNotification[] {
    return [...this.auditLog];
  }

  getLastN(n: number): RoutedNotification[] {
    return this.auditLog.slice(-n);
  }

  resetStats(): void {
    this.stats = {
      totalRouted: 0,
      duplicatesSuppressed: 0,
      playbackSuppressed: 0,
      channelBreakdown: {
        AMBIENT_TICKER: 0,
        OVERLAY_CARD: 0,
        FULL_SCREEN_ALERT: 0,
        SILENT_LOG: 0,
      },
    };
  }
}

export const notificationRouter = new SmartNotificationRouter();
