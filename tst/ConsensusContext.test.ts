import { consensusReducer, initialConsensusState } from '../src/context/ConsensusContext';
import { MediaItem } from '../src/types';

describe('ConsensusContext - Co-Viewing Decision Engine Reducer', () => {
  const mockItem1: MediaItem = {
    id: 'test-1',
    title: 'Interstellar',
    year: 2014,
    rating: 'PG-13',
    runtime: '2h 49m',
    imdbScore: 8.7,
    rottenTomatoes: 87,
    mood: 'Cosmic',
    synopsis: 'Space journey',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/1.jpg',
    tags: ['Sci-Fi'],
  };

  const mockItem2: MediaItem = {
    id: 'test-2',
    title: 'Dune 2',
    year: 2024,
    rating: 'PG-13',
    runtime: '2h 46m',
    imdbScore: 8.6,
    rottenTomatoes: 92,
    mood: 'Sci-Fi',
    synopsis: 'Desert war',
    streamingPlatform: 'Max',
    backdropUrl: 'https://example.com/2.jpg',
    tags: ['Sci-Fi'],
  };

  const mockItem3: MediaItem = {
    id: 'test-3',
    title: 'Arrival',
    year: 2016,
    rating: 'PG-13',
    runtime: '1h 56m',
    imdbScore: 7.9,
    rottenTomatoes: 94,
    mood: 'Sci-Fi',
    synopsis: 'Linguistics with aliens',
    streamingPlatform: 'Prime Video',
    backdropUrl: 'https://example.com/3.jpg',
    tags: ['Sci-Fi'],
  };

  it('should initialize with empty shortlist, skipped items, and no winner', () => {
    expect(initialConsensusState.shortlist).toHaveLength(0);
    expect(initialConsensusState.skipped).toHaveLength(0);
    expect(initialConsensusState.winner).toBeNull();
    expect(initialConsensusState.isVotingComplete).toBe(false);
  });

  it('should append items to shortlist on VOTE_SHORTLIST action', () => {
    const nextState = consensusReducer(initialConsensusState, {
      type: 'VOTE_SHORTLIST',
      payload: mockItem1,
    });

    expect(nextState.shortlist).toHaveLength(1);
    expect(nextState.shortlist[0].id).toBe('test-1');
    expect(nextState.currentIndex).toBe(1);
    expect(nextState.isVotingComplete).toBe(false);
  });

  it('should append items to skipped list on VOTE_SKIP action', () => {
    const nextState = consensusReducer(initialConsensusState, {
      type: 'VOTE_SKIP',
      payload: mockItem1,
    });

    expect(nextState.skipped).toHaveLength(1);
    expect(nextState.skipped[0].id).toBe('test-1');
    expect(nextState.shortlist).toHaveLength(0);
    expect(nextState.currentIndex).toBe(1);
  });

  it('should trigger consensus completion when 3 items are shortlisted', () => {
    let state = consensusReducer(initialConsensusState, {
      type: 'VOTE_SHORTLIST',
      payload: mockItem1,
    });
    state = consensusReducer(state, {
      type: 'VOTE_SHORTLIST',
      payload: mockItem2,
    });
    state = consensusReducer(state, {
      type: 'VOTE_SHORTLIST',
      payload: mockItem3,
    });

    expect(state.shortlist).toHaveLength(3);
    expect(state.isVotingComplete).toBe(true);
    expect(state.winner).not.toBeNull();
    expect(state.recommendation).not.toBeNull();
    expect(state.recommendation?.winner.item.id).toBe(state.winner?.id);
    expect(state.recommendation?.winner.matchPercentage).toBeGreaterThanOrEqual(70);
  });

  it('should properly reset state back to initial values on RESET_VOTING', () => {
    const dirtyState = consensusReducer(initialConsensusState, {
      type: 'VOTE_SHORTLIST',
      payload: mockItem1,
    });
    const resetState = consensusReducer(dirtyState, { type: 'RESET_VOTING' });

    expect(resetState.shortlist).toHaveLength(0);
    expect(resetState.skipped).toHaveLength(0);
    expect(resetState.winner).toBeNull();
  });
});
