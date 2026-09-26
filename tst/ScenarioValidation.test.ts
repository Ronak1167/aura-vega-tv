import {
  evaluateCandidate,
  rankCandidates,
  generateConsensusRecommendation,
  computeAffinityScore,
  computeContextScore,
  computeRuntimeScore,
} from '../src/engine/ScoringEngine';
import { MediaItem, VotingParticipant, ViewingContext } from '../src/types';

describe('Scoring Scenarios Validation (A through G)', () => {
  const sciFiItem: MediaItem = {
    id: 'item-scifi',
    title: 'Interstellar',
    year: 2014,
    rating: 'PG-13',
    runtime: '2h 49m',
    imdbScore: 8.7,
    rottenTomatoes: 87,
    mood: 'Cosmic & Mind-Bending',
    synopsis: 'Space travel to save humanity',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/interstellar.jpg',
    tags: ['Sci-Fi', 'Space', 'Drama'],
  };

  const actionItem: MediaItem = {
    id: 'item-action',
    title: 'Mad Max: Fury Road',
    year: 2015,
    rating: 'R',
    runtime: '2h 00m',
    imdbScore: 8.1,
    rottenTomatoes: 97,
    mood: 'High-Octane Post-Apocalyptic',
    synopsis: 'Desert chase',
    streamingPlatform: 'Max',
    backdropUrl: 'https://example.com/furyroad.jpg',
    tags: ['Action', 'Thriller'],
  };

  const comedyItem: MediaItem = {
    id: 'item-comedy',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    rating: 'R',
    runtime: '1h 39m',
    imdbScore: 8.1,
    rottenTomatoes: 92,
    mood: 'Whimsical & Melancholic',
    synopsis: 'Adventures of a legendary concierge',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/budapest.jpg',
    tags: ['Comedy', 'Drama'],
  };

  const horrorItem: MediaItem = {
    id: 'item-horror',
    title: 'The Conjuring',
    year: 2013,
    rating: 'R',
    runtime: '1h 52m',
    imdbScore: 7.5,
    rottenTomatoes: 86,
    mood: 'Supernatural Horror',
    synopsis: 'Haunted house',
    streamingPlatform: 'Max',
    backdropUrl: 'https://example.com/conjuring.jpg',
    tags: ['Horror', 'Supernatural'],
  };

  const shortAnimation: MediaItem = {
    id: 'item-short',
    title: 'Big Buck Bunny',
    year: 2008,
    rating: 'G',
    runtime: '10m',
    imdbScore: 7.8,
    rottenTomatoes: 80,
    mood: 'Playful & Lighthearted',
    synopsis: 'A large rabbit seeks revenge',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/bbb.jpg',
    tags: ['Animation', 'Comedy'],
  };

  const defaultContext: ViewingContext = {
    timeOfDay: 'evening',
    weatherCondition: 'Rainy',
    temperature: 68,
    targetMaxRuntimeMinutes: 180,
    sessionMood: 'All',
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO A: Everyone likes the same genre
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario A: Unanimous Genre Preference', () => {
    it('ranks the agreed genre highest and produces a unanimous reason', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Sci-Fi'],
          preferredMoods: ['Cosmic'],
          dislikedGenres: [],
        },
        {
          id: 'v2',
          name: 'Bob',
          avatarColor: '#FF9900',
          hasVoted: true,
          preferredGenres: ['Sci-Fi'],
          preferredMoods: ['Cosmic'],
          dislikedGenres: [],
        },
      ];

      const ranked = rankCandidates([sciFiItem, comedyItem, actionItem], voters, defaultContext);

      expect(ranked[0].item.id).toBe('item-scifi');
      expect(ranked[0].matchPercentage).toBeGreaterThan(80);
      expect(ranked[0].positiveFactors.some((f) => f.includes('Unanimous match'))).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO B: Viewers strongly disagree
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario B: Strong Preference Disagreement', () => {
    it('produces lower match scores and identifies partial compromise without false unanimity', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Sci-Fi'],
          preferredMoods: ['Cosmic'],
          dislikedGenres: ['Comedy'],
        },
        {
          id: 'v2',
          name: 'Bob',
          avatarColor: '#FF9900',
          hasVoted: true,
          preferredGenres: ['Comedy'],
          preferredMoods: ['Whimsical'],
          dislikedGenres: ['Sci-Fi'],
        },
      ];

      const ranked = rankCandidates([sciFiItem, comedyItem, actionItem], voters, defaultContext);

      // Both sci-fi and comedy are vetoed by the other viewer!
      const scifiEval = ranked.find((r) => r.item.id === 'item-scifi')!;
      const comedyEval = ranked.find((r) => r.item.id === 'item-comedy')!;

      expect(scifiEval.breakdown.isVetoed).toBe(true);
      expect(comedyEval.breakdown.isVetoed).toBe(true);

      // The neutral compromise candidate (Action) is not vetoed by either!
      const actionEval = ranked.find((r) => r.item.id === 'item-action')!;
      expect(actionEval.breakdown.isVetoed).toBe(false);
      expect(ranked[0].item.id).toBe('item-action');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO C: One viewer vetoes a title
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario C: Single Viewer Veto / Disliked Genre', () => {
    it('severely penalizes and caps the vetoed title so it cannot win', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Horror'],
          dislikedGenres: [],
        },
        {
          id: 'v2',
          name: 'Bob',
          avatarColor: '#FF9900',
          hasVoted: true,
          preferredGenres: ['Sci-Fi'],
          dislikedGenres: ['Horror'], // Explicit veto
        },
      ];

      const ranked = rankCandidates([horrorItem, sciFiItem], voters, defaultContext);

      const horrorEval = ranked.find((r) => r.item.id === 'item-horror')!;
      expect(horrorEval.breakdown.isVetoed).toBe(true);
      expect(horrorEval.breakdown.totalScore).toBeLessThanOrEqual(30);
      expect(ranked[0].item.id).toBe('item-scifi');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO D: Two titles receive nearly identical scores
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario D: Deterministic Tie-Breaker', () => {
    it('breaks ties deterministically using Affinity -> Quality -> Alphabetical order', () => {
      const twinA: MediaItem = {
        id: 'twin-a',
        title: 'Alpha Mission',
        year: 2024,
        rating: 'PG-13',
        runtime: '1h 45m',
        imdbScore: 8.0,
        rottenTomatoes: 80,
        tags: ['Sci-Fi'],
        mood: 'Space',
        synopsis: 'A mission to space',
        streamingPlatform: 'Prime Video',
        backdropUrl: 'https://example.com/alpha.jpg',
      };

      const twinB: MediaItem = {
        id: 'twin-b',
        title: 'Beta Odyssey',
        year: 2024,
        rating: 'PG-13',
        runtime: '1h 45m',
        imdbScore: 8.0,
        rottenTomatoes: 80,
        tags: ['Sci-Fi'],
        mood: 'Space',
        synopsis: 'Another space mission',
        streamingPlatform: 'Prime Video',
        backdropUrl: 'https://example.com/beta.jpg',
      };

      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Sci-Fi'],
          dislikedGenres: [],
        },
      ];

      const ranked1 = rankCandidates([twinB, twinA], voters, defaultContext);
      const ranked2 = rankCandidates([twinA, twinB], voters, defaultContext);

      // Both orders should deterministically rank Alpha Mission before Beta Odyssey
      expect(ranked1[0].item.title).toBe('Alpha Mission');
      expect(ranked2[0].item.title).toBe('Alpha Mission');
      expect(ranked1[0].matchPercentage).toEqual(ranked2[0].matchPercentage);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO E: Context changes the ranking
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario E: Environmental Context Influence', () => {
    it('boosts atmospheric titles during rainy weather compared to clear sunny weather', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Sci-Fi', 'Action'],
          dislikedGenres: [],
        },
      ];

      const rainyContext: ViewingContext = {
        timeOfDay: 'evening',
        weatherCondition: 'Heavy Rain',
        temperature: 60,
        sessionMood: 'All',
      };

      const sunnyContext: ViewingContext = {
        timeOfDay: 'afternoon',
        weatherCondition: 'Clear Sunny',
        temperature: 78,
        sessionMood: 'All',
      };

      const rainyRank = rankCandidates([sciFiItem, actionItem], voters, rainyContext);
      const sunnyRank = rankCandidates([sciFiItem, actionItem], voters, sunnyContext);

      // Atmospheric sci-fi gains context bonus on rainy evening
      const sciFiRainy = rainyRank.find((r) => r.item.id === 'item-scifi')!;
      const sciFiSunny = sunnyRank.find((r) => r.item.id === 'item-scifi')!;

      expect(sciFiRainy.breakdown.contextScore).toBeGreaterThan(sciFiSunny.breakdown.contextScore);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO F: Runtime constraint changes the ranking
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario F: Late-Night Runtime Window Constraint', () => {
    it('penalizes a 169m epic when user has a strict 90m limit, allowing a shorter film to win', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Drama', 'Sci-Fi', 'Comedy'],
          dislikedGenres: [],
        },
      ];

      const strictNightContext: ViewingContext = {
        timeOfDay: 'night',
        weatherCondition: 'Clear',
        temperature: 65,
        targetMaxRuntimeMinutes: 90, // Strict 90m bedtime window
        sessionMood: 'All',
      };

      const ranked = rankCandidates([sciFiItem, comedyItem], voters, strictNightContext);

      // Interstellar is 169m (79m over target limit)
      // Comedy item is 99m (only 9m over limit)
      const sciFiScore = ranked.find((r) => r.item.id === 'item-scifi')!;
      const comedyScore = ranked.find((r) => r.item.id === 'item-comedy')!;

      expect(sciFiScore.breakdown.runtimeScore).toBeLessThan(comedyScore.breakdown.runtimeScore);
      expect(ranked[0].item.id).toBe('item-comedy');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SCENARIO G: No candidate satisfies all preferences
  // ───────────────────────────────────────────────────────────────────────────
  describe('Scenario G: Zero Perfect Candidates', () => {
    it('gracefully degrades to best available compromise without errors or crashes', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Western'], // Neither item has Western
          preferredMoods: ['Gritty'],
          dislikedGenres: [],
        },
        {
          id: 'v2',
          name: 'Bob',
          avatarColor: '#FF9900',
          hasVoted: true,
          preferredGenres: ['Musical'], // Neither item has Musical
          preferredMoods: ['Uplifting'],
          dislikedGenres: [],
        },
      ];

      const recommendation = generateConsensusRecommendation(
        [sciFiItem, comedyItem, actionItem],
        voters,
        defaultContext,
      );

      expect(recommendation).not.toBeNull();
      expect(recommendation!.winner).toBeDefined();
      expect(recommendation!.shortlistRankings.length).toBe(3);
      // Scores should honestly reflect baseline quality/context rather than artificial 100%
      expect(recommendation!.winner.matchPercentage).toBeLessThan(80);
      expect(recommendation!.winner.positiveFactors.length).toBeGreaterThan(0);
    });
  });
});
