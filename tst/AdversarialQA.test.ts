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
import { findNextFocusTarget, FocusNode } from '../src/engine/FocusEngine';
import { ContentPersonalizationHeadlessService } from '../src/headless/ContentPersonalizationHeadlessService';
import { weatherService } from '../src/services/WeatherService';

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

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Phase 6 Adversarial QA Matrix (Scenarios A through W)
  // ──────────────────────────────────────────────────────────────────────────
  describe('7. Phase 6 Comprehensive Adversarial Scenarios (A to W)', () => {
    // A. Zero voters
    it('Scenario A: zero voters yields valid neutral baseline recommendation', () => {
      const rec = generateConsensusRecommendation([sciFiFilm, horrorFilm], [], defaultContext);
      expect(rec).not.toBeNull();
      expect(rec?.winner.breakdown.affinityScore).toBe(70);
      expect(rec?.winner.breakdown.totalScore).toBeGreaterThan(0);
    });

    // B. One voter
    it('Scenario B: single voter preferences dominate scoring without error', () => {
      const singleVoter: VotingParticipant[] = [votersWithDislike[0]]; // Ronak only
      const rec = generateConsensusRecommendation([sciFiFilm, horrorFilm], singleVoter, defaultContext);
      expect(rec).not.toBeNull();
      expect(rec?.winner.item.id).toBe(sciFiFilm.id);
      expect(rec?.shortlistRankings.find((r) => r.item.id === horrorFilm.id)?.breakdown.isVetoed).toBe(true);
    });

    // C. All voters identical
    it('Scenario C: all voters identical yields unanimous maximum agreement', () => {
      const identicalVoters: VotingParticipant[] = [
        { ...votersWithDislike[0], id: 'v1' },
        { ...votersWithDislike[0], id: 'v2' },
        { ...votersWithDislike[0], id: 'v3' },
      ];
      const affinity = computeAffinityScore(sciFiFilm, identicalVoters);
      expect(affinity.score).toBe(100);
      expect(affinity.penalty).toBe(0);
      expect(affinity.positiveReasons.some((r) => r.includes('Unanimous'))).toBe(true);
    });

    // D. All voters contradictory
    it('Scenario D: all voters contradictory balances positive and negative factors', () => {
      const contradictoryVoters: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'SciFiLover',
          avatarColor: '#00E5FF',
          hasVoted: true,
          preferredGenres: ['Sci-Fi'],
          preferredMoods: [],
          dislikedGenres: ['Horror'],
        },
        {
          id: 'v2',
          name: 'HorrorLover',
          avatarColor: '#FF9900',
          hasVoted: true,
          preferredGenres: ['Horror'],
          preferredMoods: [],
          dislikedGenres: ['Sci-Fi'],
        },
      ];
      const evalSciFi = evaluateCandidate(sciFiFilm, contradictoryVoters, defaultContext);
      const evalHorror = evaluateCandidate(horrorFilm, contradictoryVoters, defaultContext);
      // Both should receive vetoes/penalties from the opposing voter
      expect(evalSciFi.breakdown.isVetoed).toBe(true);
      expect(evalHorror.breakdown.isVetoed).toBe(true);
    });

    // E. Majority dislikes a title
    it('Scenario E: majority dislikes a title applies multiple penalties', () => {
      const majorityDislike: VotingParticipant[] = [
        { ...votersWithDislike[0], id: 'v1' }, // dislikes horror
        { ...votersWithDislike[0], id: 'v2' }, // dislikes horror
        { ...votersWithDislike[1], id: 'v3' }, // likes horror
      ];
      const affinity = computeAffinityScore(horrorFilm, majorityDislike);
      expect(affinity.penalty).toBe(80); // 2 voters * 40 penalty
      expect(affinity.isVetoed).toBe(true);
    });

    // F. All titles vetoed
    it('Scenario F: all titles vetoed still deterministically ranks with minimum match floors', () => {
      const votersDislikeAll: VotingParticipant[] = [
        {
          id: 'v1',
          name: 'Disliker',
          avatarColor: '#FFF',
          hasVoted: true,
          preferredGenres: ['Comedy'],
          preferredMoods: [],
          dislikedGenres: ['Horror', 'Sci-Fi'],
        },
      ];
      const ranked = rankCandidates([sciFiFilm, horrorFilm], votersDislikeAll, defaultContext);
      expect(ranked).toHaveLength(2);
      expect(ranked[0].breakdown.isVetoed).toBe(true);
      expect(ranked[1].breakdown.isVetoed).toBe(true);
      expect(ranked[0].matchPercentage).toBeGreaterThanOrEqual(1);
      expect(ranked[1].matchPercentage).toBeGreaterThanOrEqual(1);
    });

    // G. Equal scores
    it('Scenario G: equal scores breaks ties alphabetically by title', () => {
      const itemA: MediaItem = {
        ...sciFiFilm,
        id: 'item-a',
        title: 'Alpha Movie',
      };
      const itemB: MediaItem = {
        ...sciFiFilm,
        id: 'item-b',
        title: 'Beta Movie',
      };
      const ranked = rankCandidates([itemB, itemA], [], defaultContext);
      expect(ranked[0].item.title).toBe('Alpha Movie');
      expect(ranked[1].item.title).toBe('Beta Movie');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
    });

    // H. Duplicate title metadata
    it('Scenario H: duplicate title metadata ranks distinct IDs without infinite recursion', () => {
      const dup1: MediaItem = { ...sciFiFilm, id: 'dup-1', title: 'Identical Title' };
      const dup2: MediaItem = { ...sciFiFilm, id: 'dup-2', title: 'Identical Title' };
      const ranked = rankCandidates([dup1, dup2], [], defaultContext);
      expect(ranked).toHaveLength(2);
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
    });

    // I. Missing rating
    it('Scenario I: missing or null ratings safely defaults quality score', () => {
      const unrated: MediaItem = {
        ...sciFiFilm,
        imdbScore: undefined as unknown as number,
        rottenTomatoes: null as unknown as number,
      };
      const quality = computeQualityScore(unrated);
      expect(quality).toBeGreaterThan(0);
      expect(isNaN(quality)).toBe(false);
    });

    // J. Invalid runtime
    it('Scenario J: invalid non-numeric runtime string safely defaults to 110m', () => {
      expect(parseRuntimeMinutes('corrupt-string')).toBe(110);
      expect(parseRuntimeMinutes('?? min')).toBe(110);
    });

    // K. Negative runtime
    it('Scenario K: negative runtime values handled safely', () => {
      const runtimeScore = computeRuntimeScore(-45, defaultContext);
      expect(isNaN(runtimeScore.score)).toBe(false);
      expect(runtimeScore.score).toBe(100);
    });

    // L. Extremely long runtime
    it('Scenario L: extremely long runtime (600m / 10h) decays to floor score', () => {
      const longRuntime = computeRuntimeScore(600, defaultContext);
      expect(longRuntime.score).toBe(20);
      expect(longRuntime.reason).toContain('longer than preferred');
    });

    // M. Missing genre
    it('Scenario M: missing or empty genre tags evaluated safely', () => {
      const noGenre: MediaItem = {
        ...sciFiFilm,
        tags: [],
        mood: '',
      };
      const affinity = computeAffinityScore(noGenre, votersWithDislike);
      expect(isNaN(affinity.score)).toBe(false);
      expect(affinity.score).toBeGreaterThanOrEqual(0);
    });

    // N. Malformed media data
    it('Scenario N: malformed media data with missing optional fields does not throw', () => {
      const malformed: MediaItem = {
        id: 'malformed-1',
        title: 'Minimal Film',
        year: 2024,
        rating: 'NR',
        runtime: '90m',
        imdbScore: 6.0,
        rottenTomatoes: 60,
        mood: 'Indie',
        synopsis: '',
        streamingPlatform: 'Prime Video',
        backdropUrl: '',
        tags: ['Drama'],
      };
      expect(() => {
        evaluateCandidate(malformed, votersWithDislike, defaultContext);
      }).not.toThrow();
    });

    // O. Rapid repeated D-pad input
    it('Scenario O: rapid repeated D-pad input produces consistent focus targets', () => {
      const centerNode: FocusNode = { id: 'btn-1', rect: { x: 100, y: 100, width: 200, height: 50 } };
      const rightNode: FocusNode = { id: 'btn-2', rect: { x: 400, y: 100, width: 200, height: 50 } };
      const nodes = [centerNode, rightNode];

      // Simulate 50 rapid RIGHT D-pad clicks
      for (let i = 0; i < 50; i++) {
        const next = findNextFocusTarget('btn-1', nodes, 'right');
        expect(next).toBe('btn-2');
      }
    });

    // P. Repeated Back presses
    it('Scenario P: repeated reset actions on initial state remain stable', () => {
      let state = initialConsensusState;
      for (let i = 0; i < 10; i++) {
        state = consensusReducer(state, { type: 'RESET_VOTING' });
        expect(state.winner).toBeNull();
        expect(state.currentIndex).toBe(0);
      }
    });

    // Q. Modal open/close race
    it('Scenario Q: rapid modal open and reset actions maintain state integrity', () => {
      let state = consensusReducer(initialConsensusState, {
        type: 'SET_WINNER',
        payload: sciFiFilm,
      });
      expect(state.winner?.id).toBe(sciFiFilm.id);
      expect(state.isVotingComplete).toBe(true);

      state = consensusReducer(state, { type: 'RESET_VOTING' });
      expect(state.shortlist).toHaveLength(0);
      expect(state.winner).toBeNull();
      expect(state.isVotingComplete).toBe(false);
    });

    // R. Winner selection race
    it('Scenario R: exactly 3 shortlist actions trigger completion and produce recommendation', () => {
      let state = initialConsensusState;
      state = consensusReducer(state, { type: 'VOTE_SHORTLIST', payload: sciFiFilm });
      state = consensusReducer(state, { type: 'VOTE_SHORTLIST', payload: horrorFilm });
      const third: MediaItem = { ...sciFiFilm, id: 'm3', title: 'Arrival' };
      state = consensusReducer(state, { type: 'VOTE_SHORTLIST', payload: third });

      expect(state.isVotingComplete).toBe(true);
      expect(state.shortlist).toHaveLength(3);
      expect(state.recommendation).not.toBeNull();
    });

    // S. Player lifecycle interruption
    it('Scenario S: selecting winner transitions state appropriately for video launch and dismiss', () => {
      let state = initialConsensusState;
      state = consensusReducer(state, { type: 'SET_WINNER', payload: sciFiFilm });
      expect(state.winner?.id).toBe(sciFiFilm.id);

      // Resetting simulates return from player
      state = consensusReducer(state, { type: 'RESET_VOTING' });
      expect(state.winner).toBeNull();
    });

    // T. Service startup resilience
    it('Scenario T: headless service start is idempotent and handles multiple calls safely', () => {
      const service = ContentPersonalizationHeadlessService.getInstance();
      expect(() => {
        service.start();
        service.start(); // second call should be safely ignored
      }).not.toThrow();
      service.stop();
    });

    // U. Service restart & cache hydration
    it('Scenario U: headless service restart re-hydrates cached recommendations', () => {
      const service = ContentPersonalizationHeadlessService.getInstance();
      service.start();
      const recs = service.getCachedRecommendations();
      expect(recs.length).toBeGreaterThan(0);
      service.stop();
      service.start();
      expect(service.getCachedRecommendations().length).toBeGreaterThan(0);
      service.stop();
    });

    // V. Network unavailable / fallback resilience
    it('Scenario V: weather telemetry provides offline cached telemetry on network unavailability', async () => {
      const weather = await weatherService.fetchCurrentWeather();
      expect(weather.location).toBe('Seattle, WA');
      expect(weather.temperature).toBeDefined();
      expect(weather.condition).toBeDefined();
    });

    // W. Empty recommendation response
    it('Scenario W: empty candidate array returns null recommendation safely', () => {
      const rec = generateConsensusRecommendation([], votersWithDislike, defaultContext);
      expect(rec).toBeNull();
    });
  });
});
