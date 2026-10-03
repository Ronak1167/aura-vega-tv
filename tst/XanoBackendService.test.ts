/**
 * XanoBackendService.test.ts
 *
 * Test suite for XanoBackendService.
 */

import { xanoBackend } from '../src/services/XanoBackendService';
import { CandidateEvaluation, ViewingContext, VotingParticipant } from '../src/types';

describe('XanoBackendService', () => {
  const sampleCandidate: CandidateEvaluation = {
    item: {
      id: 'media-interstellar',
      title: 'Interstellar',
      year: 2014,
      rating: 'PG-13',
      runtime: '2h 49m',
      imdbScore: 8.7,
      rottenTomatoes: 87,
      mood: 'Cosmic & Mind-Bending',
      synopsis: 'Explorers travel through space.',
      streamingPlatform: 'Prime Video',
      backdropUrl: 'https://images.unsplash.com/test.jpg',
      tags: ['Sci-Fi'],
    },
    breakdown: {
      affinityScore: 90,
      qualityScore: 88,
      contextScore: 85,
      runtimeScore: 80,
      penalty: 0,
      totalScore: 88,
      isVetoed: false,
    },
    matchPercentage: 88,
    rank: 1,
    positiveFactors: ['Strong genre match'],
    negativeFactors: [],
    summaryReason: 'Top household choice',
  };

  const sampleParticipants: VotingParticipant[] = [
    {
      id: 'p1',
      name: 'Ronak',
      avatarColor: '#00E5FF',
      hasVoted: true,
      preferredGenres: ['Sci-Fi'],
    },
  ];

  const sampleContext: ViewingContext = {
    timeOfDay: 'evening',
    weatherCondition: 'Clear',
    temperature: 70,
  };

  it('should maintain a singleton instance and report healthy status', () => {
    const health = xanoBackend.getHealthStatus();
    expect(health).toBeDefined();
    expect(health.endpoint).toContain('xano.com');
  });

  it('should record consensus sessions and update local cache', async () => {
    const record = await xanoBackend.recordConsensusSession(
      'hh_123',
      sampleCandidate,
      sampleParticipants,
      sampleContext,
      'AI consensus insight',
    );

    expect(record).toBeDefined();
    expect(record.winnerTitle).toBe('Interstellar');
    expect(record.householdId).toBe('hh_123');
    expect(record.matchPercentage).toBe(88);

    const recent = xanoBackend.getRecentConsensusRecords(5);
    expect(recent.length).toBeGreaterThan(0);
    expect(recent.some((r) => r.winnerTitle === 'Interstellar')).toBe(true);
  });

  it('should flush pending queue without throwing', async () => {
    const count = await xanoBackend.flushPendingQueue();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
