/**
 * AutonomousInsightReporter.test.ts
 *
 * Verifies that the InsightReporter correctly generates:
 *   - Trend signals from recent media activity
 *   - Generative motion prompts aligned to weather/time context
 *   - Narrative summaries for the ambient ticker
 *   - Incrementing report counters
 */

import { insightReporter, InsightReport, TrendSignal } from '../src/engine/AutonomousInsightReporter';
import { MediaItem, VotingParticipant } from '../src/types';

const makeItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
  id: 'i1',
  title: 'Test Film',
  year: 2024,
  rating: 'PG-13',
  runtime: '2h 0m',
  runtimeMinutes: 120,
  imdbScore: 8.0,
  rottenTomatoes: 85,
  mood: 'Sci-Fi',
  synopsis: 'Test synopsis',
  streamingPlatform: 'Prime Video',
  backdropUrl: 'https://example.com/bg.jpg',
  tags: ['sci-fi', 'action'],
  ...overrides,
});

const participants: VotingParticipant[] = [
  {
    id: 'p1',
    name: 'Ronak',
    avatarColor: '#00E5FF',
    hasVoted: true,
    preferredGenres: ['sci-fi', 'action'],
    preferredMoods: ['Blockbuster'],
    dislikedGenres: [],
  },
  {
    id: 'p2',
    name: 'Guest',
    avatarColor: '#FF9900',
    hasVoted: true,
    preferredGenres: ['drama'],
    preferredMoods: ['Drama'],
    dislikedGenres: [],
  },
];

const catalog: MediaItem[] = [
  makeItem({ id: 'c1', title: 'Dune: Part Two', tags: ['sci-fi', 'action'], mood: 'Blockbuster' }),
  makeItem({ id: 'c2', title: 'Oppenheimer', tags: ['drama', 'history'], mood: 'Drama' }),
  makeItem({ id: 'c3', title: 'Interstellar', tags: ['sci-fi'], mood: 'Sci-Fi' }),
];

const recentActivity: MediaItem[] = [
  makeItem({ id: 'r1', tags: ['sci-fi'], mood: 'Sci-Fi' }),
  makeItem({ id: 'r2', tags: ['action', 'sci-fi'], mood: 'Blockbuster' }),
  makeItem({ id: 'r3', tags: ['drama'], mood: 'Drama' }),
];

describe('AutonomousInsightReporter', () => {
  let report: InsightReport;

  beforeAll(async () => {
    report = await insightReporter.generateReport(participants, catalog, recentActivity, 0.75);
  });

  test('report has required top-level fields', () => {
    expect(report.sessionId).toContain('vega-report-');
    expect(report.generatedAt).toBeTruthy();
    expect(report.householdSize).toBe(2);
  });

  test('trend signals are generated from recent activity', () => {
    expect(Array.isArray(report.trendSignals)).toBe(true);
    expect(report.trendSignals.length).toBeGreaterThan(0);

    const genreSignals = report.trendSignals.filter((s: TrendSignal) => s.dimension === 'genre');
    expect(genreSignals.length).toBeGreaterThan(0);
    genreSignals.forEach((s: TrendSignal) => {
      expect(s.strength).toBeGreaterThanOrEqual(0);
      expect(s.strength).toBeLessThanOrEqual(1);
      expect(['rising', 'stable', 'declining']).toContain(s.direction);
    });
  });

  test('platform signal is included', () => {
    const platformSignal = report.trendSignals.find((s: TrendSignal) => s.dimension === 'platform');
    expect(platformSignal).toBeDefined();
    expect(platformSignal!.label).toContain('platform');
  });

  test('narrative summary is non-empty and mentions viewer count', () => {
    expect(report.narrativeSummary.length).toBeGreaterThan(20);
    expect(report.narrativeSummary).toContain('2 viewer');
  });

  test('generative motion prompt is non-empty and mentions cinematic', () => {
    expect(report.generativeMotionPrompt.length).toBeGreaterThan(20);
    expect(report.generativeMotionPrompt.toLowerCase()).toContain('cinematic');
  });

  test('system health score is bounded 0–100', () => {
    expect(report.systemHealthScore).toBeGreaterThanOrEqual(0);
    expect(report.systemHealthScore).toBeLessThanOrEqual(100);
  });

  test('diagnostics are populated', () => {
    expect(report.diagnostics.modelLatencyMs).toBeGreaterThanOrEqual(0);
    expect(report.diagnostics.cacheHitRate).toBe(0.75);
  });

  test('report count increments on each call', async () => {
    const prev = insightReporter.getReportCount();
    await insightReporter.generateReport(participants, catalog, recentActivity, 0.5);
    expect(insightReporter.getReportCount()).toBe(prev + 1);
  });

  test('getLastReport returns the latest report', () => {
    const last = insightReporter.getLastReport();
    expect(last).not.toBeNull();
    expect(last!.sessionId).toContain('vega-report-');
  });

  test('report with empty activity still runs without throwing', async () => {
    await expect(
      insightReporter.generateReport(participants, catalog, [], 0)
    ).resolves.toBeDefined();
  });
});
