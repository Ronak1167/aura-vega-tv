/**
 * AutonomousEngine.test.ts
 *
 * Test suite for AutonomousAIEngine multi-agent consensus pipeline.
 */

import { autonomousAIEngine } from '../src/engine/AutonomousAIEngine';
import mediaCatalog from '../src/data/media-catalog.json';
import { MediaItem, ViewingContext, VotingParticipant } from '../src/types';

describe('AutonomousAIEngine Multi-Agent Pipeline', () => {
  const sampleParticipants: VotingParticipant[] = [
    {
      id: 'p1',
      name: 'Ronak',
      avatarColor: '#00E5FF',
      hasVoted: true,
      preferredGenres: ['Sci-Fi', 'Action'],
      preferredMoods: ['Cosmic & Mind-Bending'],
      dislikedGenres: ['Horror'],
    },
    {
      id: 'p2',
      name: 'Co-Viewer',
      avatarColor: '#FF9900',
      hasVoted: true,
      preferredGenres: ['Sci-Fi', 'Blockbuster'],
      preferredMoods: ['Epic Sci-Fi Spectacle'],
      dislikedGenres: [],
    },
  ];

  const sampleContext: ViewingContext = {
    timeOfDay: 'night',
    weatherCondition: 'Rainy',
    temperature: 65,
    targetMaxRuntimeMinutes: 180,
    sessionMood: 'All',
  };

  it('should maintain a singleton instance', () => {
    const inst1 = autonomousAIEngine;
    expect(inst1).toBeDefined();
  });

  it('should execute end-to-end multi-agent autonomous consensus pipeline', async () => {
    const result = await autonomousAIEngine.executeAutonomousConsensus(
      mediaCatalog as MediaItem[],
      sampleParticipants,
      sampleContext,
      'test_household_123',
    );

    expect(result).toBeDefined();
    expect(result.recommendation).toBeDefined();
    expect(result.aiRecommendation).toBeDefined();
    expect(result.report).toBeDefined();

    // Check Multi-Agent Report fields
    const { report } = result;
    expect(report.agentStatus).toBe('fully_autonomous');
    expect(report.winnerTitle).toBeTruthy();
    expect(report.synthesizerConsensusScore).toBeGreaterThan(0);
    expect(report.explainabilityText).toContain('wins with a');
    expect(report.explainabilityText).toContain('Ronak & Co-Viewer');
    expect(report.contextAnalystInsight.toLowerCase()).toContain('rainy');
    expect(report.splineOrbScale).toBeGreaterThanOrEqual(1.0);
    expect(report.totalLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should support starting and stopping the autonomous heartbeat loop', () => {
    jest.useFakeTimers();
    autonomousAIEngine.startAutonomousLoop(
      mediaCatalog as MediaItem[],
      () => sampleParticipants,
      () => sampleContext,
      10000,
    );

    jest.advanceTimersByTime(20000);
    autonomousAIEngine.stopAutonomousLoop();
    jest.useRealTimers();
  });
});
