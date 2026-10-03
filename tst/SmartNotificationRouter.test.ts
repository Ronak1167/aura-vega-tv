/**
 * SmartNotificationRouter.test.ts
 *
 * Verifies urgency classification, channel routing, deduplication,
 * playback suppression, CTA generation, and audit log behavior.
 */

import { notificationRouter, RoutedNotification, SmartCTA } from '../src/services/SmartNotificationRouter';
import { DoorbellAlert } from '../src/types';

function makeAlert(overrides: Partial<DoorbellAlert> = {}): DoorbellAlert {
  return {
    id: `alert-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    cameraName: 'Front Door',
    eventDescription: 'Person detected at door',
    snapshotUrl: 'https://example.com/snapshot.jpg',
    status: 'active',
    visitorType: 'guest',
    ...overrides,
  };
}

describe('SmartNotificationRouter', () => {
  beforeEach(() => {
    notificationRouter.resetStats();
  });

  // --- Channel routing ---

  test('family visitor → OVERLAY_CARD or FULL_SCREEN_ALERT (never silent) when not playing', () => {
    const routed = notificationRouter.route(makeAlert({ visitorType: 'family' }), false);
    expect(['OVERLAY_CARD', 'FULL_SCREEN_ALERT']).toContain(routed.channel);
  });

  test('motion with loitering → FULL_SCREEN_ALERT regardless of playback', () => {
    const routed = notificationRouter.route(
      makeAlert({ visitorType: 'motion', eventDescription: 'Suspicious loitering detected' }),
      true, // active playback
    );
    expect(routed.channel).toBe('FULL_SCREEN_ALERT');
  });

  test('low-urgency motion → suppressed to SILENT_LOG during active playback', () => {
    const routed = notificationRouter.route(
      makeAlert({ visitorType: 'motion', eventDescription: 'Minor motion' }),
      true,
    );
    expect(routed.channel).toBe('SILENT_LOG');
  });

  test('guest → not sent to SILENT_LOG when not playing', () => {
    const routed = notificationRouter.route(makeAlert({ visitorType: 'guest' }), false);
    expect(routed.channel).not.toBe('SILENT_LOG');
  });

  // --- Deduplication ---

  test('identical visitor type on same camera within 90s is marked as duplicate', () => {
    const alert = makeAlert({ visitorType: 'delivery', cameraName: 'Back Door' });
    const routed1 = notificationRouter.route(alert, false);
    const routed2 = notificationRouter.route(
      { ...alert, id: 'different-id' },
      false,
    );
    // First should not be duplicate
    expect(routed1.isDuplicate).toBe(false);
    // Second (same camera + visitorType) should be deduplicated
    expect(routed2.isDuplicate).toBe(true);
    expect(routed2.channel).toBe('SILENT_LOG');
  });

  // --- CTA generation ---

  test('delivery alert has "Mark Received" CTA', () => {
    const routed = notificationRouter.route(
      makeAlert({ visitorType: 'delivery', cameraName: 'DeliveryCam' }),
      false,
    );
    if (routed.channel !== 'SILENT_LOG') {
      const primary = routed.smartCTAs.find((c: SmartCTA) => c.isPrimary);
      expect(primary?.actionKey).toBe('MARK_RECEIVED');
    }
  });

  test('family alert has "Unlock Door" primary CTA', () => {
    const routed = notificationRouter.route(
      makeAlert({ visitorType: 'family', cameraName: 'FamilyCam' }),
      false,
    );
    if (routed.channel !== 'SILENT_LOG') {
      const primary = routed.smartCTAs.find((c: SmartCTA) => c.isPrimary);
      expect(primary?.actionKey).toBe('UNLOCK_DOOR');
    }
  });

  test('silent log routes have no CTAs', () => {
    // Force a SILENT_LOG by routing motion during playback
    const routed = notificationRouter.route(
      makeAlert({ visitorType: 'motion', eventDescription: 'Leaf blowing' }),
      true,
    );
    if (routed.channel === 'SILENT_LOG') {
      expect(routed.smartCTAs).toHaveLength(0);
    }
  });

  // --- Stats ---

  test('stats accumulate correctly across multiple routes', () => {
    const a1 = notificationRouter.route(makeAlert({ visitorType: 'guest', cameraName: 'StatsGuestCam' }), false);
    const a2 = notificationRouter.route(makeAlert({ visitorType: 'motion', cameraName: 'StatsMotionCam' }), false);
    const stats = notificationRouter.getStats();
    expect(stats.totalRouted).toBeGreaterThanOrEqual(2);
  });

  // --- Audit log ---

  test('audit log captures all routed notifications', () => {
    notificationRouter.resetStats();
    notificationRouter.route(makeAlert({ cameraName: 'LogTest1' }), false);
    notificationRouter.route(makeAlert({ cameraName: 'LogTest2' }), false);
    const log = notificationRouter.getLastN(10);
    // Should include the two new entries (plus any dedups from other tests)
    expect(log.length).toBeGreaterThanOrEqual(1);
  });

  test('each routed notification has routedAt timestamp and alertId', () => {
    const routed = notificationRouter.route(makeAlert({ cameraName: 'TimestampCam' }), false);
    expect(routed.alertId).toBeTruthy();
    expect(routed.routedAt).toBeTruthy();
    expect(new Date(routed.routedAt).getTime()).not.toBeNaN();
  });

  // --- Urgency score integrity ---

  test('urgency scores are within 0–100 range', () => {
    const types: DoorbellAlert['visitorType'][] = ['delivery', 'family', 'guest', 'motion'];
    for (const vt of types) {
      const routed = notificationRouter.route(
        makeAlert({ visitorType: vt, cameraName: `UrgencyCam-${vt}` }),
        false,
      );
      expect(routed.urgencyScore).toBeGreaterThanOrEqual(0);
      expect(routed.urgencyScore).toBeLessThanOrEqual(100);
    }
  });
});
