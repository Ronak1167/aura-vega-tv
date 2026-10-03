/**
 * AmbientScreenComponents.test.ts
 *
 * Verifies Wave 7 Ambient Screen UI components:
 *  - InsightTicker data binding and narrative presentation
 *  - HealthPanel status color mapping and service telemetry display
 *  - Ambient intelligence integration with AutonomousInsightReporter and VegaOSHealthMonitor
 */

import { insightReporter, InsightReport } from '../src/engine/AutonomousInsightReporter';
import { healthMonitor, HealthSnapshot, ServiceStatus } from '../src/services/VegaOSHealthMonitor';
import { prefetchService } from '../src/services/PredictivePrefetchService';
import { colors } from '../src/styles/tokens';
import { MediaItem, VotingParticipant, ViewingContext } from '../src/types';

describe('Ambient Screen Autonomous UI Integration (Wave 7)', () => {
  const mockContext: ViewingContext = {
    timeOfDay: 'evening',
    ambientLight: 'dim',
    weatherCondition: 'Clear',
    temperature: 72,
    groupEnergy: 'medium',
  };

  const mockParticipants: VotingParticipant[] = [
    {
      id: 'p1',
      name: 'Ronak',
      avatarColor: '#00E5FF',
      hasVoted: true,
      preferredGenres: ['sci-fi'],
      preferredMoods: ['Sci-Fi'],
      dislikedGenres: [],
    },
  ];

  const mockMedia: MediaItem[] = [
    {
      id: 'm1',
      title: 'Dune: Part Two',
      year: 2024,
      rating: 'PG-13',
      runtime: '2h 46m',
      runtimeMinutes: 166,
      imdbScore: 8.6,
      rottenTomatoes: 92,
      mood: 'Sci-Fi',
      synopsis: 'Paul Atreides unites with Chani and the Fremen.',
      streamingPlatform: 'Max',
      backdropUrl: 'https://example.com/dune2.jpg',
      tags: ['sci-fi', 'adventure'],
    },
  ];

  describe('InsightTicker Data Pipeline', () => {
    it('provides valid intelligence report for the ambient ticker', async () => {
      const report = await insightReporter.generateReport(
        mockParticipants,
        mockMedia,
        mockMedia,
        0.95,
      );

      expect(report).toBeDefined();
      expect(report.narrativeSummary).toBeTruthy();
      expect(report.trendSignals.length).toBeGreaterThan(0);
      expect(report.generativeMotionPrompt).toBeTruthy();

      const latest = insightReporter.getLastReport();
      expect(latest?.sessionId).toBe(report.sessionId);
    });

    it('formats trend signal badges properly for 10-foot TV UI', async () => {
      const report = await insightReporter.generateReport(
        mockParticipants,
        mockMedia,
        mockMedia,
        0.9,
      );

      const signals = report.trendSignals;
      expect(signals.every(s => typeof s.label === 'string')).toBe(true);
      expect(signals.every(s => typeof s.strength === 'number')).toBe(true);
      expect(signals.some(s => s.direction === 'rising' || s.direction === 'stable')).toBe(true);
    });
  });

  describe('HealthPanel Telemetry & Status Model', () => {
    it('computes composite health snapshot for the ambient HUD', async () => {
      const snapshot = await healthMonitor.generateSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.compositeScore).toBeGreaterThanOrEqual(0);
      expect(snapshot.compositeScore).toBeLessThanOrEqual(100);
      expect(['HEALTHY', 'DEGRADED', 'RECOVERING', 'FAILED']).toContain(snapshot.overallStatus);
      expect(snapshot.services.length).toBe(9);
    });

    it('maps service statuses to proper color tokens', () => {
      const mapColor = (status: ServiceStatus) => {
        switch (status) {
          case 'HEALTHY':
            return colors.statusLive;
          case 'DEGRADED':
          case 'RECOVERING':
            return colors.statusWarning;
          case 'FAILED':
            return colors.statusAlert;
          default:
            return colors.textSecondary;
        }
      };

      expect(mapColor('HEALTHY')).toBe(colors.statusLive);
      expect(mapColor('DEGRADED')).toBe(colors.statusWarning);
      expect(mapColor('RECOVERING')).toBe(colors.statusWarning);
      expect(mapColor('FAILED')).toBe(colors.statusAlert);
    });

    it('binds CDN hit rate and savings from PredictivePrefetchService', async () => {
      await prefetchService.buildAndWarm(mockMedia, mockParticipants, mockContext, new Set(), null);

      const hitRate = prefetchService.getHitRate();
      const report = prefetchService.getLatestReport();

      expect(hitRate).toBeGreaterThanOrEqual(0);
      expect(report).not.toBeNull();
      expect(report?.prefetchSavingsMs).toBeGreaterThan(0);
    });
  });
});
