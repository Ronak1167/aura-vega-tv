/**
 * AdversarialQA.test.ts
 *
 * Rigorous adversarial edge case suite testing unknown failure modes,
 * boundary conditions, malformed metadata, voter toggling, and state integrity.
 */

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
import { consensusReducer, initialConsensusState } from '../src/context/ConsensusContext';
import { MediaItem, VotingParticipant, ViewingContext } from '../src/types';

describe('Adversarial QA Suite - Robustness & Integrity', () => {
  const horrorFilm: MediaItem = {
    id: 'media-horror',
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

  const sciFiFilm: MediaItem = {
    id: 'media-scifi',
    title: 'Interstellar',
    year: 2014,
    rating: 'PG-13',
    runtime: '2h 49m',
    imdbScore: 8.7,
    rottenTomatoes: 87,
    mood: 'Cosmic & Mind-Bending',
    synopsis: 'Space travel',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/interstellar.jpg',
    tags: ['Sci-Fi', 'Space'],
  };

  const votersWithDislike: VotingParticipant[] = [
    {
      id: 'user-ronak',
      name: 'Ronak',
      avatarColor: '#00E5FF',
      hasVoted: true,
      preferredGenres: ['Sci-Fi', 'Space'],
      preferredMoods: ['Cosmic & Mind-Bending'],
      dislikedGenres: ['Horror'],
    },
    {
      id: 'user-family',
      name: 'Family',
      avatarColor: '#FF9900',
      hasVoted: true,
      preferredGenres: ['Horror', 'Mystery'],
      preferredMoods: [],
      dislikedGenres: [],
    },
  ];

  const defaultContext: ViewingContext = {
    timeOfDay: 'evening',
    weatherCondition: 'Clear',
    temperature: 70,
    targetMaxRuntimeMinutes: 180,
    sessionMood: 'All',
  };

  describe('1. Inactive Voter Toggle & Dynamic Affinity', () => {
    it('applies penalty when Ronak is active because he dislikes Horror', () => {
      const affinityBothActive = computeAffinityScore(horrorFilm, votersWithDislike);
      expect(affinityBothActive.penalty).toBe(40);
      expect(affinityBothActive.negativeReasons).toContainEqual(
        expect.stringContaining('Ronak dislikes this genre category'),
      );
    });

    it('removes penalty when Ronak is toggled inactive (hasVoted = false)', () => {
      const votersRonakInactive: VotingParticipant[] = [
        { ...votersWithDislike[0], hasVoted: false },
        { ...votersWithDislike[1], hasVoted: true },
      ];

      const affinityRonakInactive = computeAffinityScore(horrorFilm, votersRonakInactive);
      // Ronak's dislike penalty must NOT apply because he is inactive
      expect(affinityRonakInactive.penalty).toBe(0);
      expect(affinityRonakInactive.negativeReasons).toHaveLength(0);
      expect(affinityRonakInactive.score).toBeGreaterThan(60);
    });

    it('formats summary reason with only active voters when unanimous', () => {
      const votersFamilyInactive: VotingParticipant[] = [
        { ...votersWithDislike[0], hasVoted: true }, // Ronak active
        { ...votersWithDislike[1], hasVoted: false }, // Family inactive
      ];

      const evaluation = evaluateCandidate(sciFiFilm, votersFamilyInactive, defaultContext);
      expect(evaluation.summaryReason).toContain('Ronak');
      expect(evaluation.summaryReason).not.toContain('Family');
    });

    it('gracefully falls back to all participants if every voter is toggled inactive', () => {
      const allInactive: VotingParticipant[] = [
        { ...votersWithDislike[0], hasVoted: false },
        { ...votersWithDislike[1], hasVoted: false },
      ];

      const affinity = computeAffinityScore(sciFiFilm, allInactive);
      expect(affinity.score).toBeGreaterThan(0);
    });
  });

  describe('2. Deduplication in Consensus Reducer', () => {
    it('prevents duplicate shortlisting of the exact same item', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'VOTE_SHORTLIST',
        payload: sciFiFilm,
      });
      expect(state.shortlist).toHaveLength(1);

      // Shortlist again
      state = consensusReducer(state, {
        type: 'VOTE_SHORTLIST',
        payload: sciFiFilm,
      });
      expect(state.shortlist).toHaveLength(1);
    });

    it('prevents duplicate skipping of the exact same item', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'VOTE_SKIP',
        payload: horrorFilm,
      });
      expect(state.skipped).toHaveLength(1);

      // Skip again
      state = consensusReducer(state, {
        type: 'VOTE_SKIP',
        payload: horrorFilm,
      });
      expect(state.skipped).toHaveLength(1);
    });

    it('removes item from skipped list if subsequently shortlisted', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'VOTE_SKIP',
        payload: sciFiFilm,
      });
      expect(state.skipped.some((s) => s.id === sciFiFilm.id)).toBe(true);

      state = consensusReducer(state, {
        type: 'VOTE_SHORTLIST',
        payload: sciFiFilm,
      });
      expect(state.shortlist.some((s) => s.id === sciFiFilm.id)).toBe(true);
      expect(state.skipped.some((s) => s.id === sciFiFilm.id)).toBe(false);
    });
  });

  describe('3. Robustness Against Malformed Metadata & NaN', () => {
    it('handles NaN or missing ratings in computeQualityScore without producing NaN', () => {
      const corruptItem: MediaItem = {
        ...sciFiFilm,
        imdbScore: NaN,
        rottenTomatoes: NaN,
      };

      const score = computeQualityScore(corruptItem);
      expect(isNaN(score)).toBe(false);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('handles zero or negative targetMaxRuntimeMinutes in computeRuntimeScore', () => {
      const zeroCtx: ViewingContext = {
        ...defaultContext,
        targetMaxRuntimeMinutes: 0,
      };
      const resZero = computeRuntimeScore(120, zeroCtx);
      expect(isNaN(resZero.score)).toBe(false);
      expect(resZero.score).toBe(100);

      const negCtx: ViewingContext = {
        ...defaultContext,
        targetMaxRuntimeMinutes: -30,
      };
      const resNeg = computeRuntimeScore(120, negCtx);
      expect(isNaN(resNeg.score)).toBe(false);
      expect(resNeg.score).toBe(100);
    });

    it('handles malformed runtime strings gracefully', () => {
      expect(parseRuntimeMinutes('N/A')).toBe(110);
      expect(parseRuntimeMinutes('invalid')).toBe(110);
      expect(parseRuntimeMinutes('')).toBe(110);
      expect(parseRuntimeMinutes(undefined)).toBe(110);
      expect(parseRuntimeMinutes('45m')).toBe(45);
      expect(parseRuntimeMinutes('3h')).toBe(180);
    });

    it('ranks candidates safely even if title is undefined', () => {
      const itemNoTitle: MediaItem = {
        ...sciFiFilm,
        id: 'no-title',
        title: undefined as unknown as string,
      };
      const itemWithTitle: MediaItem = {
        ...horrorFilm,
        id: 'with-title',
        title: 'Zebra Movie',
      };

      expect(() => {
        rankCandidates([itemNoTitle, itemWithTitle], votersWithDislike, defaultContext);
      }).not.toThrow();
    });
  });
});
