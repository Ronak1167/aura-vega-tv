import {
  parseRuntimeMinutes,
  computeQualityScore,
  computeAffinityScore,
  computeContextScore,
  computeRuntimeScore,
  evaluateCandidate,
  rankCandidates,
  generateConsensusRecommendation,
} from '../src/engine/ScoringEngine';
import { MediaItem, VotingParticipant, ViewingContext } from '../src/types';

describe('ScoringEngine - Deterministic Co-Viewing Intelligence', () => {
  const sampleMedia1: MediaItem = {
    id: 'media-interstellar',
    title: 'Interstellar',
    year: 2014,
    rating: 'PG-13',
    runtime: '2h 49m',
    imdbScore: 8.7,
    rottenTomatoes: 87,
    mood: 'Cosmic & Mind-Bending',
    synopsis: 'A wormhole journey',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/interstellar.jpg',
    tags: ['Sci-Fi', 'Space', 'Masterpiece'],
  };

  const sampleMedia2: MediaItem = {
    id: 'media-dune2',
    title: 'Dune: Part Two',
    year: 2024,
    rating: 'PG-13',
    runtime: '2h 46m',
    imdbScore: 8.6,
    rottenTomatoes: 92,
    mood: 'Epic Sci-Fi Spectacle',
    synopsis: 'Arrakis rebellion',
    streamingPlatform: 'Max',
    backdropUrl: 'https://example.com/dune.jpg',
    tags: ['Action', 'Sci-Fi', 'Blockbuster'],
  };

  const sampleMediaHorror: MediaItem = {
    id: 'media-conjuring',
    title: 'The Conjuring',
    year: 2013,
    rating: 'R',
    runtime: '1h 52m',
    imdbScore: 7.5,
    rottenTomatoes: 86,
    mood: 'Supernatural Horror',
    synopsis: 'Haunted farmhouse',
    streamingPlatform: 'Max',
    backdropUrl: 'https://example.com/conjuring.jpg',
    tags: ['Horror', 'Supernatural'],
  };

  const sampleVoters: VotingParticipant[] = [
    {
      id: 'voter-1',
      name: 'Ronak',
      avatarColor: '#00E5FF',
      hasVoted: true,
      preferredGenres: ['Sci-Fi', 'Action'],
      preferredMoods: ['Cosmic & Mind-Bending'],
      dislikedGenres: ['Horror'],
    },
    {
      id: 'voter-2',
      name: 'Family',
      avatarColor: '#FF9900',
      hasVoted: true,
      preferredGenres: ['Sci-Fi', 'Blockbuster'],
      preferredMoods: ['Epic Sci-Fi Spectacle'],
      dislikedGenres: [],
    },
  ];

  const sampleContext: ViewingContext = {
    timeOfDay: 'evening',
    weatherCondition: 'Rainy',
    temperature: 68,
    targetMaxRuntimeMinutes: 180,
    sessionMood: 'Sci-Fi',
  };

  describe('parseRuntimeMinutes', () => {
    it('should parse "2h 49m" into 169 minutes', () => {
      expect(parseRuntimeMinutes('2h 49m')).toBe(169);
    });

    it('should parse "1h 56m" into 116 minutes', () => {
      expect(parseRuntimeMinutes('1h 56m')).toBe(116);
    });

    it('should parse numeric strings or fallback gracefully', () => {
      expect(parseRuntimeMinutes('120 min')).toBe(120);
      expect(parseRuntimeMinutes(undefined)).toBe(110);
      expect(parseRuntimeMinutes('')).toBe(110);
    });
  });

  describe('computeQualityScore', () => {
    it('should blend IMDb and Rotten Tomatoes scores', () => {
      // Interstellar: IMDb 8.7 * 10 = 87, RT = 87 -> 87
      expect(computeQualityScore(sampleMedia1)).toBe(87);

      // Dune 2: IMDb 8.6 * 10 = 86, RT = 92 -> 0.5 * 86 + 0.5 * 92 = 89
      expect(computeQualityScore(sampleMedia2)).toBe(89);
    });

    it('should handle missing scores with sensible defaults', () => {
      const bareItem: MediaItem = {
        ...sampleMedia1,
        imdbScore: undefined as unknown as number,
        rottenTomatoes: undefined as unknown as number,
      };
      const score = computeQualityScore(bareItem);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('computeAffinityScore & Conflict Resolution', () => {
    it('should calculate high affinity for unanimous genre match', () => {
      const affinity = computeAffinityScore(sampleMedia1, sampleVoters);
      expect(affinity.score).toBeGreaterThanOrEqual(80);
      expect(affinity.isVetoed).toBe(false);
      expect(affinity.positiveReasons.length).toBeGreaterThan(0);
      expect(affinity.penalty).toBe(0);
    });

    it('should detect conflicting/disliked genre and apply penalty', () => {
      const affinity = computeAffinityScore(sampleMediaHorror, sampleVoters);
      // Ronak dislikes Horror
      expect(affinity.penalty).toBeGreaterThan(0);
      expect(affinity.negativeReasons).toContainEqual(expect.stringContaining('Ronak dislikes'));
    });
  });

  describe('computeContextScore', () => {
    it('should reward prime evening features with cozy rainy day vibe', () => {
      const ctx = computeContextScore(sampleMedia1, sampleContext);
      expect(ctx.score).toBeGreaterThan(70);
      expect(ctx.reasons).toContainEqual(expect.stringContaining('evening'));
    });

    it('should penalize long movies late at night', () => {
      const lateNightContext: ViewingContext = {
        ...sampleContext,
        timeOfDay: 'night',
      };
      const ctx = computeContextScore(sampleMedia1, lateNightContext);
      expect(ctx.reasons).toContainEqual(expect.stringContaining('Lengthy runtime'));
    });
  });

  describe('computeRuntimeScore', () => {
    it('should give 100 to movies fitting within limit', () => {
      const res = computeRuntimeScore(116, sampleContext);
      expect(res.score).toBe(100);
    });

    it('should decay score when runtime exceeds target', () => {
      const shortLimitContext: ViewingContext = {
        ...sampleContext,
        targetMaxRuntimeMinutes: 120,
      };
      const res = computeRuntimeScore(169, shortLimitContext);
      expect(res.score).toBeLessThan(100);
      expect(res.reason).toContain('longer than preferred');
    });
  });

  describe('evaluateCandidate & rankCandidates', () => {
    it('should rank items deterministically', () => {
      const items = [sampleMediaHorror, sampleMedia1, sampleMedia2];
      const ranked = rankCandidates(items, sampleVoters, sampleContext);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].rank).toBe(3);

      // Sci-fi items should significantly outrank Horror due to voter match and no veto
      expect(ranked[0].item.tags).toContain('Sci-Fi');
      expect(ranked[2].item.title).toBe('The Conjuring');
    });

    it('should resolve ties deterministically', () => {
      // Two identical copies with different titles
      const twinA: MediaItem = { ...sampleMedia1, id: 'a', title: 'Alpha Movie' };
      const twinB: MediaItem = { ...sampleMedia1, id: 'b', title: 'Beta Movie' };

      const ranked = rankCandidates([twinB, twinA], sampleVoters, sampleContext);
      // Alphabetical order breaks tie
      expect(ranked[0].item.title).toBe('Alpha Movie');
      expect(ranked[1].item.title).toBe('Beta Movie');
    });

    it('should safely handle empty candidate list', () => {
      const ranked = rankCandidates([], sampleVoters, sampleContext);
      expect(ranked).toHaveLength(0);
    });
  });

  describe('generateConsensusRecommendation', () => {
    it('should generate an explainable recommendation result with winner', () => {
      const result = generateConsensusRecommendation(
        [sampleMedia1, sampleMedia2],
        sampleVoters,
        sampleContext,
      );

      expect(result).not.toBeNull();
      expect(result?.winner).toBeDefined();
      expect(result?.winner.matchPercentage).toBeGreaterThanOrEqual(80);
      expect(result?.winner.positiveFactors.length).toBeGreaterThan(0);
      expect(result?.shortlistRankings).toHaveLength(2);
      expect(result?.contextSummary).toContain('EVENING');
    });

    it('should return null if candidates list is empty', () => {
      const result = generateConsensusRecommendation([], sampleVoters, sampleContext);
      expect(result).toBeNull();
    });
  });
});
