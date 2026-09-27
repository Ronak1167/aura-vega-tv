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

    it('boosts items matching active sessionMood during recommendation generation', () => {
      const moodCtx: ViewingContext = {
        ...defaultContext,
        sessionMood: 'Sci-Fi',
      };
      const rec = generateConsensusRecommendation(
        [sciFiFilm, horrorFilm],
        votersWithDislike,
        moodCtx,
      );
      expect(rec).not.toBeNull();
      expect(rec?.winner.item.id).toBe('media-scifi');
      expect(rec?.winner.positiveFactors.some((f) => f.includes('Sci-Fi'))).toBe(true);
    });

    it('cleans state completely on rapid RESET_VOTING', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'VOTE_SHORTLIST',
        payload: sciFiFilm,
      });
      state = consensusReducer(state, {
        type: 'VOTE_SKIP',
        payload: horrorFilm,
      });
      state = consensusReducer(state, {
        type: 'SET_MOOD',
        payload: 'Drama',
      });
      const resetState = consensusReducer(state, { type: 'RESET_VOTING' });

      expect(resetState.shortlist).toHaveLength(0);
      expect(resetState.skipped).toHaveLength(0);
      expect(resetState.winner).toBeNull();
      expect(resetState.activeMood).toBe('All');
      expect(resetState.currentIndex).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Deep Debug Round 2 — New Regressions
  // ──────────────────────────────────────────────────────────────────────────
  describe('4. Explainability Integrity: Voter Agreement vs Conflict Exclusivity', () => {
    it('does NOT list a disliking voter in positiveReasons (agreeing voter list)', () => {
      // Ronak dislikes Horror — he should NOT appear in "Matches preferences for Ronak"
      const affinityHorror = computeAffinityScore(horrorFilm, votersWithDislike);

      // Ronak has a dislike penalty applied
      expect(affinityHorror.penalty).toBe(40);

      // Ronak must NOT appear in any positive reason (he's conflicting, not agreeing)
      const allPositiveText = affinityHorror.positiveReasons.join(' ');
      expect(allPositiveText).not.toContain('Ronak');
    });

    it('lists a voter in agreeingVoters only when they actually like the genre and have no conflict', () => {
      // Family likes Horror, has no dislikes → should appear in positive
      // Ronak dislikes Horror → must NOT appear in positive
      const affinityHorror = computeAffinityScore(horrorFilm, votersWithDislike);
      const allPositiveText = affinityHorror.positiveReasons.join(' ');
      expect(allPositiveText).toContain('Family');
    });
  });

  describe('5. Vetoed Item Match Percentage Floor', () => {
    it('never returns 0% matchPercentage for a vetoed item', () => {
      const voters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Alice',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Comedy'],
          preferredMoods: [],
          dislikedGenres: ['Horror'],
        },
        {
          id: 'v2',
          name: 'Bob',
          avatarColor: '#FF9900',
          hasVoted: true,
          preferredGenres: ['Comedy'],
          preferredMoods: [],
          dislikedGenres: ['Horror'],
        },
      ];

      const defaultCtx: ViewingContext = {
        timeOfDay: 'evening',
        weatherCondition: 'Clear',
        temperature: 70,
        sessionMood: 'All',
      };

      const evaluation = evaluateCandidate(horrorFilm, voters, defaultCtx);
      expect(evaluation.breakdown.isVetoed).toBe(true);
      // Must never show 0% MATCH in UI
      expect(evaluation.matchPercentage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('6. Mood-Change Shortlist Integrity', () => {
    it('preserves existing shortlist items across a mood filter change', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'VOTE_SHORTLIST',
        payload: sciFiFilm,
      });
      expect(state.shortlist).toHaveLength(1);

      // Switch to Drama mood
      state = consensusReducer(state, { type: 'SET_MOOD', payload: 'Drama' });

      // Shortlist must be intact — mood change only resets currentIndex, not shortlist
      expect(state.shortlist).toHaveLength(1);
      expect(state.shortlist[0].id).toBe(sciFiFilm.id);
      // Index resets so the Carousel can restart browsing from position 0
      expect(state.currentIndex).toBe(0);
    });

    it('activeMood is forwarded correctly into scoring context after mood switch', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'SET_MOOD',
        payload: 'Sci-Fi',
      });
      expect(state.activeMood).toBe('Sci-Fi');

      // A subsequent shortlist should forward the active mood to recommendation scoring
      state = consensusReducer(state, { type: 'VOTE_SHORTLIST', payload: sciFiFilm });
      state = consensusReducer(state, { type: 'VOTE_SHORTLIST', payload: horrorFilm });
      // Third vote triggers isVotingComplete
      const thirdItem: MediaItem = {
        ...sciFiFilm,
        id: 'media-third',
        title: 'Arrival',
        mood: 'Thoughtful Sci-Fi',
        tags: ['Sci-Fi', 'Drama'],
      };
      state = consensusReducer(state, { type: 'VOTE_SHORTLIST', payload: thirdItem });

      expect(state.isVotingComplete).toBe(true);
      // Recommendation should be present
      expect(state.recommendation).not.toBeNull();
      // contextSummary from engine must contain the time-of-day (real time is used, not deterministic)
      expect(state.recommendation?.contextSummary).toBeDefined();
    });
  });
});
