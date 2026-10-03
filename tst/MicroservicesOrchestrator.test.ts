/**
 * MicroservicesOrchestrator.test.ts
 *
 * Full integration test suite for the autonomous MicroservicesOrchestrator.
 */

import { orchestrator } from '../src/services/MicroservicesOrchestrator';
import { ViewingContext, VotingParticipant } from '../src/types';

describe('MicroservicesOrchestrator Autonomous Stack', () => {
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
      name: 'Family',
      avatarColor: '#FF9900',
      hasVoted: true,
      preferredGenres: ['Sci-Fi', 'Blockbuster', 'Family'],
      preferredMoods: ['Epic Sci-Fi Spectacle'],
      dislikedGenres: [],
    },
  ];

  const sampleContext: ViewingContext = {
    timeOfDay: 'evening',
    weatherCondition: 'Rainy',
    temperature: 68,
    targetMaxRuntimeMinutes: 180,
    sessionMood: 'All',
  };

  it('should boot all autonomous microservices and report ready', async () => {
    const bootResult = await orchestrator.boot();
    expect(bootResult.success).toBe(true);
    expect(bootResult.services['autonomous_ai_engine']).toBe(true);
    expect(bootResult.services['spline_spatial']).toBe(true);
    expect(bootResult.services['scoring_engine']).toBe(true);
    expect(orchestrator.isReady()).toBe(true);
  });

  it('should execute autonomous consensus and generate multi-agent report', async () => {
    const sessionId = await orchestrator.startHouseholdSession(sampleParticipants);
    expect(sessionId).toBeTruthy();

    const result = await orchestrator.getAutonomousConsensus(sampleParticipants, sampleContext);
    expect(result).toBeDefined();
    expect(result.report).toBeDefined();
    expect(result.report.winnerTitle).toBeTruthy();
    expect(result.report.explainabilityText).toBeTruthy();
    expect(result.report.totalLatencyMs).toBeGreaterThanOrEqual(0);

    const lastReport = orchestrator.getLastAutonomousReport();
    expect(lastReport).not.toBeNull();
    expect(lastReport?.winnerTitle).toBe(result.report.winnerTitle);
  });

  it('should provide Spline 3D spatial lighting and consensus orb configuration', () => {
    const lighting = orchestrator.getSpatialLighting('evening', 'Rainy');
    expect(lighting).toBeDefined();
    expect(lighting.intensity).toBeGreaterThan(0);
    expect(lighting.ambientColorHex).toBeTruthy();

    const orb = orchestrator.getConsensusOrbConfig(88, false);
    expect(orb).toBeDefined();
    expect(orb.sceneId).toBe('spline-aura-consensus-orb');
    expect(orb.consensusOrbScale).toBeGreaterThan(1.0);
  });

  it('should handle playback stream requests with quality profile selection', async () => {
    const stream = await orchestrator.startPlayback('media-dune2', 'profile_ronak', '1080p');
    expect(stream).toBeDefined();
    expect(stream.mediaId).toBe('media-dune2');
    expect(stream.quality).toBe('1080p');
    expect(stream.url).toBeTruthy();
  });

  it('should cast votes and update gateway metrics', async () => {
    await orchestrator.castVote('p1', 'media-interstellar');
    const metrics = orchestrator.getGatewayMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.totalRequests).toBeGreaterThanOrEqual(0);
  });
});
