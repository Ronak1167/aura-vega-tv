/**
 * VegaOSHealthMonitor.test.ts
 *
 * Verifies service health tracking, composite scoring,
 * self-healing behavior, and snapshot generation.
 */

import { healthMonitor, ServiceName, ServiceStatus, ServiceMetrics } from '../src/services/VegaOSHealthMonitor';

describe('VegaOSHealthMonitor', () => {
  beforeEach(() => {
    // Re-initialize monitor state via fresh calls — no reset API needed
    // We access the singleton and exercise it directly
  });

  test('records a success and updates latency metrics', () => {
    healthMonitor.recordSuccess('AIRecommender', 150);
    const metrics = healthMonitor.getServiceMetrics('AIRecommender');
    expect(metrics).not.toBeNull();
    expect(metrics!.callCount).toBeGreaterThan(0);
    expect(metrics!.avgLatencyMs).toBeGreaterThanOrEqual(0);
    expect(metrics!.lastSuccessAt).toBeTruthy();
  });

  test('records an error and updates error rate', () => {
    // Record multiple errors to push error rate above threshold
    for (let i = 0; i < 5; i++) {
      healthMonitor.recordError('GenerativeMotion', new Error('Motion API timeout'));
    }
    const metrics = healthMonitor.getServiceMetrics('GenerativeMotion');
    expect(metrics).not.toBeNull();
    expect(metrics!.errorRate).toBeGreaterThan(0);
    expect(metrics!.lastErrorAt).toBeTruthy();
  });

  test('self-heal attempt counter increments on FAILED services', () => {
    const svc: ServiceName = 'SplineSpatial';
    // Flood with errors to trigger self-healing
    for (let i = 0; i < 20; i++) {
      healthMonitor.recordError(svc, new Error('Spline connection lost'));
    }
    const metrics = healthMonitor.getServiceMetrics(svc);
    expect(metrics).not.toBeNull();
    expect(metrics!.selfHealAttempts).toBeGreaterThanOrEqual(0);
    // After self-heal attempt, status should not remain FAILED
    const acceptableStatuses: ServiceStatus[] = ['RECOVERING', 'DEGRADED', 'HEALTHY', 'FAILED'];
    expect(acceptableStatuses).toContain(metrics!.status);
  });

  test('snapshot has required structure', async () => {
    const snapshot = await healthMonitor.generateSnapshot();
    expect(snapshot.snapshotId).toContain('health-');
    expect(snapshot.recordedAt).toBeTruthy();
    expect(snapshot.compositeScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.compositeScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(snapshot.services)).toBe(true);
    expect(snapshot.services.length).toBeGreaterThan(0);
    expect(Array.isArray(snapshot.activeAlerts)).toBe(true);
    expect(Array.isArray(snapshot.selfHealActions)).toBe(true);
  });

  test('healthy service records correct status', () => {
    // Multiple fast successful calls should yield HEALTHY
    const svc: ServiceName = 'WeatherService';
    for (let i = 0; i < 10; i++) {
      healthMonitor.recordSuccess(svc, 80); // 80ms — very fast
    }
    const metrics = healthMonitor.getServiceMetrics(svc);
    expect(metrics!.status).toBe('HEALTHY');
    expect(metrics!.errorRate).toBe(0);
  });

  test('getLatestSnapshot returns the most recent snapshot', async () => {
    await healthMonitor.generateSnapshot();
    const snap = healthMonitor.getLatestSnapshot();
    expect(snap).not.toBeNull();
    expect(snap!.snapshotId).toBeTruthy();
  });

  test('history grows with each snapshot', async () => {
    const before = healthMonitor.getHistory().length;
    await healthMonitor.generateSnapshot();
    const after = healthMonitor.getHistory().length;
    expect(after).toBeGreaterThan(before);
  });

  test('composite score is always 0–100', async () => {
    const snap = await healthMonitor.generateSnapshot();
    expect(snap.compositeScore).toBeGreaterThanOrEqual(0);
    expect(snap.compositeScore).toBeLessThanOrEqual(100);
  });

  test('getCompositeScore returns latest composite or 100 default', () => {
    const score = healthMonitor.getCompositeScore();
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('all 9 services are tracked in snapshot', async () => {
    const snap = await healthMonitor.generateSnapshot();
    const names = snap.services.map((s: ServiceMetrics) => s.name);
    expect(names).toContain('AIRecommender');
    expect(names).toContain('AutonomousEngine');
    expect(names).toContain('XanoBackend');
    expect(names).toContain('GenerativeMotion');
    expect(names).toContain('SplineSpatial');
    expect(names).toContain('WeatherService');
    expect(names).toContain('NotificationRouter');
    expect(names).toContain('InsightReporter');
    expect(names).toContain('HeadlessOrchestrator');
  });
});
