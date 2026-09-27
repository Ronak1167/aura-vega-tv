import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import {
  MediaItem,
  ConsensusState,
  VotingParticipant,
  ViewingContext,
  CandidateEvaluation,
  RecommendationResult,
} from '../types';
import mediaCatalog from '../data/media-catalog.json';
import {
  rankCandidates,
  generateConsensusRecommendation,
  evaluateCandidate,
} from '../engine/ScoringEngine';
import { getAmbientTheme } from '../utils/time-of-day';

type ConsensusAction =
  | { type: 'VOTE_SHORTLIST'; payload: MediaItem }
  | { type: 'VOTE_SKIP'; payload: MediaItem }
  | { type: 'SET_MOOD'; payload: string }
  | { type: 'SET_WINNER'; payload: MediaItem }
  | { type: 'SET_RECOMMENDATION'; payload: RecommendationResult }
  | { type: 'TOGGLE_PARTICIPANT'; payload: string }
  | { type: 'RESET_VOTING' };

export const DEFAULT_PARTICIPANTS: VotingParticipant[] = [
  {
    id: 'user-1',
    name: 'Ronak',
    avatarColor: '#00E5FF',
    hasVoted: true,
    preferredGenres: ['Sci-Fi', 'Action'],
    preferredMoods: ['Cosmic & Mind-Bending'],
    dislikedGenres: ['Horror'],
  },
  {
    id: 'user-2',
    name: 'Family',
    avatarColor: '#FF9900',
    hasVoted: true,
    preferredGenres: ['Sci-Fi', 'Blockbuster', 'Adventure'],
    preferredMoods: ['Epic Sci-Fi Spectacle'],
    dislikedGenres: [],
  },
];

export const initialConsensusState: ConsensusState = {
  shortlist: [],
  skipped: [],
  currentIndex: 0,
  winner: null,
  activeMood: 'All',
  participants: DEFAULT_PARTICIPANTS,
  isVotingComplete: false,
  recommendation: null,
  evaluations: new Map<string, CandidateEvaluation>(),
};

export function createInitialContext(): ViewingContext {
  const theme = getAmbientTheme();

  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'evening';
  if (theme.period === 'night') {
    timeOfDay = 'night';
  } else if (theme.period === 'golden_hour') {
    timeOfDay = 'evening';
  } else if (theme.period === 'day') {
    timeOfDay = 'afternoon';
  } else {
    timeOfDay = 'morning';
  }

  return {
    timeOfDay,
    weatherCondition: 'Rainy',
    temperature: 68,
    targetMaxRuntimeMinutes: timeOfDay === 'night' ? 130 : 180,
    sessionMood: 'All',
  };
}

export function consensusReducer(
  state: ConsensusState,
  action: ConsensusAction,
  context: ViewingContext = createInitialContext(),
): ConsensusState {
  switch (action.type) {
    case 'VOTE_SHORTLIST': {
      // Prevent duplicate shortlisting of the same item
      if (state.shortlist.some((item) => item.id === action.payload.id)) {
        return state;
      }

      const updatedShortlist = [...state.shortlist, action.payload];
      const updatedSkipped = state.skipped.filter((item) => item.id !== action.payload.id);
      const isComplete = updatedShortlist.length >= 3;

      let recommendation: RecommendationResult | null = null;
      let winner: MediaItem | null = state.winner;

      if (isComplete) {
        // Run real scoring engine across shortlisted candidates
        recommendation = generateConsensusRecommendation(
          updatedShortlist,
          state.participants,
          { ...context, sessionMood: state.activeMood },
        );
        winner = recommendation ? recommendation.winner.item : updatedShortlist[0];
      }

      return {
        ...state,
        shortlist: updatedShortlist,
        skipped: updatedSkipped,
        currentIndex: state.currentIndex + 1,
        winner,
        recommendation,
        isVotingComplete: isComplete,
      };
    }
    case 'VOTE_SKIP': {
      // Prevent duplicate skips of the same item
      if (state.skipped.some((item) => item.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        skipped: [...state.skipped, action.payload],
        currentIndex: state.currentIndex + 1,
      };
    }
    case 'SET_MOOD': {
      return {
        ...state,
        activeMood: action.payload,
        currentIndex: 0,
      };
    }
    case 'SET_WINNER': {
      const recommendation = generateConsensusRecommendation(
        [action.payload, ...state.shortlist.filter((s) => s.id !== action.payload.id)],
        state.participants,
        { ...context, sessionMood: state.activeMood },
      );

      return {
        ...state,
        winner: action.payload,
        recommendation,
        isVotingComplete: true,
      };
    }
    case 'SET_RECOMMENDATION': {
      return {
        ...state,
        recommendation: action.payload,
        winner: action.payload.winner.item,
        isVotingComplete: true,
      };
    }
    case 'TOGGLE_PARTICIPANT': {
      const updatedParticipants = state.participants.map((p) =>
        p.id === action.payload ? { ...p, hasVoted: !p.hasVoted } : p,
      );
      return {
        ...state,
        participants: updatedParticipants,
      };
    }
    case 'RESET_VOTING': {
      return {
        ...initialConsensusState,
      };
    }
    default:
      return state;
  }
}

interface ConsensusContextType {
  state: ConsensusState;
  items: MediaItem[];
  rankedItems: CandidateEvaluation[];
  shortlist: (item: MediaItem) => void;
  skip: (item: MediaItem) => void;
  setMood: (mood: string) => void;
  setWinner: (item: MediaItem) => void;
  toggleParticipant: (id: string) => void;
  triggerConsensusNow: () => void;
  reset: () => void;
}

const ConsensusContext = createContext<ConsensusContextType | undefined>(undefined);

export const ConsensusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentContext = useMemo(() => createInitialContext(), []);
  const [state, dispatch] = useReducer(
    (s: ConsensusState, a: ConsensusAction) => consensusReducer(s, a, currentContext),
    initialConsensusState,
  );

  const rawItems = mediaCatalog as MediaItem[];

  // Pre-calculate full candidate rankings using the Scoring Engine
  const rankedItems = useMemo(() => {
    return rankCandidates(rawItems, state.participants, {
      ...currentContext,
      sessionMood: state.activeMood,
    });
  }, [rawItems, state.participants, currentContext, state.activeMood]);

  const items = useMemo(() => {
    return rankedItems.map((r) => r.item);
  }, [rankedItems]);

  const shortlist = (item: MediaItem) => dispatch({ type: 'VOTE_SHORTLIST', payload: item });
  const skip = (item: MediaItem) => dispatch({ type: 'VOTE_SKIP', payload: item });
  const setMood = (mood: string) => dispatch({ type: 'SET_MOOD', payload: mood });
  const setWinner = (item: MediaItem) => dispatch({ type: 'SET_WINNER', payload: item });
  const toggleParticipant = (id: string) => dispatch({ type: 'TOGGLE_PARTICIPANT', payload: id });
  const reset = () => dispatch({ type: 'RESET_VOTING' });

  const triggerConsensusNow = () => {
    const candidates = state.shortlist.length > 0 ? state.shortlist : rawItems.slice(0, 5);
    const rec = generateConsensusRecommendation(candidates, state.participants, {
      ...currentContext,
      sessionMood: state.activeMood,
    });
    if (rec) {
      dispatch({ type: 'SET_RECOMMENDATION', payload: rec });
    }
  };

  return (
    <ConsensusContext.Provider
      value={{
        state,
        items,
        rankedItems,
        shortlist,
        skip,
        setMood,
        setWinner,
        toggleParticipant,
        triggerConsensusNow,
        reset,
      }}
    >
      {children}
    </ConsensusContext.Provider>
  );
};

export function useConsensus(): ConsensusContextType {
  const context = useContext(ConsensusContext);
  if (!context) {
    throw new Error('useConsensus must be used within a ConsensusProvider');
  }
  return context;
}
