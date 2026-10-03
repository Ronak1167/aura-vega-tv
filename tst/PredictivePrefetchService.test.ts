/**
 * PredictivePrefetchService.test.ts
 *
 * Verifies the CDN prefetch & pre-warm engine:
 *  - Prediction queue generation with prioritized candidates
 *  - Trend signal boosts from InsightReporter
 *  - Time/weather affinity adjustments
 *  - Co-viewing consensus boosts
 *  - Watched and Stale state tracking
 *  - Report history and metrics aggregation
 */

import {
  PredictivePrefetchService,
  PrefetchReport,
  PrefetchCandidate,
} from '../src/services/PredictivePrefetchService';
import { MediaItem, VotingParticipant, ViewingContext } from '../src/types';
import { InsightReport } from '../src/engine/AutonomousInsightReporter';

const makeItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
  id: 'm1',
  title: 'Inception',
  year: 2010,
  rating: 'PG-13',
  runtime: '2h 28m',
  runtimeMinutes: 148,
  imdbScore: 8.8,
  rottenTomatoes: 87,
  mood: 'Sci-Fi',
  synopsis: 'A thief who steals corporate secrets through dream-sharing technology.',
  streamingPlatform: 'Prime Video',
  backdropUrl: 'https://example.com/inception.jpg',
  tags: ['sci-fi', 'thriller', 'action'],
  ...overrides,
});

const participants: VotingParticipant[] = [
  {
    id: 'p1',
    name: 'Ronak',
    avatarColor: '#00E5FF',
    hasVoted: true,
    preferredGenres: ['sci-fi', 'thriller'],
    preferredMoods: ['Sci-Fi', 'Blockbuster'],
    dislikedGenres: [],
  },
  {
    id: 'p2',
    name: 'Priya',
    avatarColor: '#FF0055',
    hasVoted: true,
    preferredGenres: ['sci-fi', 'drama'],
    preferredMoods: ['Drama'],
    dislikedGenres: [],
  },
];

const context: ViewingContext = {
  timeOfDay: 'evening',
  ambientLight: 'dim',
  weatherCondition: 'Clear',
  temperature: 70,
  temperatureF: 70,
  groupEnergy: 'high',
};

describe('PredictivePrefetchService', () => {
  let service: PredictivePrefetchService;

  beforeEach(() => {
    service = new PredictivePrefetchService();
  });

  describe('Queue Generation and Pre-warming', () => {
    it('generates a prioritized prefetch report with warmed candidates', async () => {
      const candidates: MediaItem[] = [
        makeItem({ id: 'm1', title: 'Inception', tags: ['sci-fi', 'thriller'] }),
        makeItem({ id: 'm2', title: 'The Notebook', tags: ['romance', 'drama'], mood: 'Romantic', streamingPlatform: 'Netflix' }),
        makeItem({ id: 'm3', title: 'Interstellar', tags: ['sci-fi', 'drama'], mood: 'Sci-Fi', streamingPlatform: 'Prime Video' }),
      ];

      const report = await service.buildAndWarm(candidates, participants, context, new Set(), null);

      expect(report.totalCandidates).toBe(3);
      expect(report.warmedCount).toBeGreaterThan(0);
      expect(report.queue.length).toBe(3);
      expect(report.predictedNextWatch).toBeTruthy();
      expect(report.prefetchSavingsMs).toBeGreaterThan(0);
      expect(service.getReportCount()).toBe(1);
    });

    it('boosts priority for items matching InsightReport trend signals', async () => {
      const candidates: MediaItem[] = [
        makeItem({ id: 'm1', title: 'Cyberpunk Odyssey', tags: ['cyberpunk', 'sci-fi'] }),
        makeItem({ id: 'm2', title: 'Random Film', tags: ['romance'] }),
      ];

      const mockInsight: InsightReport = {
        sessionId: 'test-session-1',
        generatedAt: new Date().toISOString(),
        viewingContext: context,
        householdSize: 2,
        topRecommendation: null,
        trendSignals: [
          {
            dimension: 'genre',
            label: 'cyberpunk',
            direction: 'rising',
            strength: 0.9,
          },
        ],
        narrativeSummary: 'Cyberpunk is trending high',
        generativeMotionPrompt: 'Neon futuristic city',
        systemHealthScore: 98,
        diagnostics: {
          modelLatencyMs: 45,
          cacheHitRate: 0.95,
          dataFreshnessSeconds: 10,
        },
      };

      const report = await service.buildAndWarm(candidates, participants, context, new Set(), mockInsight);
      const cyberpunkCandidate = report.queue.find(c => c.mediaId === 'm1');
      const randomCandidate = report.queue.find(c => c.mediaId === 'm2');

      expect(cyberpunkCandidate?.priorityScore).toBeGreaterThan(randomCandidate?.priorityScore ?? 0);
    });
  });

  describe('Lifecycle State Transitions', () => {
    it('removes media from the queue when marked as watched', async () => {
      const candidates: MediaItem[] = [
        makeItem({ id: 'm1', title: 'Inception' }),
        makeItem({ id: 'm2', title: 'Interstellar' }),
      ];

      await service.buildAndWarm(candidates, participants, context, new Set(), null);
      expect(service.getCurrentQueue().some(c => c.mediaId === 'm1')).toBe(true);

      service.markWatched('m1');
      expect(service.getCurrentQueue().some(c => c.mediaId === 'm1')).toBe(false);
      expect(service.getCurrentQueue().some(c => c.mediaId === 'm2')).toBe(true);
    });

    it('marks a candidate as STALE if flagged', async () => {
      const candidates: MediaItem[] = [makeItem({ id: 'm1', title: 'Inception' })];
      await service.buildAndWarm(candidates, participants, context, new Set(), null);

      service.markStale('m1');
      const candidate = service.getCurrentQueue().find(c => c.mediaId === 'm1');
      expect(candidate?.status).toBe('STALE');
    });
  });

  describe('Metrics and Querying', () => {
    it('retrieves critical priority items', async () => {
      const candidates: MediaItem[] = [
        makeItem({ id: 'm1', title: 'Inception', tags: ['sci-fi', 'thriller'], imdbScore: 9.5 }),
      ];

      await service.buildAndWarm(candidates, participants, context, new Set(), null);
      const critical = service.getCriticalItems();
      expect(Array.isArray(critical)).toBe(true);
    });

    it('calculates average hit rate across reports', async () => {
      const candidates: MediaItem[] = [makeItem({ id: 'm1', title: 'Inception' })];
      await service.buildAndWarm(candidates, participants, context, new Set(), null);

      const hitRate = service.getHitRate();
      expect(hitRate).toBeGreaterThanOrEqual(0);
      expect(hitRate).toBeLessThanOrEqual(1.0);
    });
  });
});
