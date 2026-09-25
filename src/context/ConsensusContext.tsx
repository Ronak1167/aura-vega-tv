import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MediaItem, ConsensusState, VotingParticipant } from '../types';
import mediaCatalog from '../data/media-catalog.json';

type ConsensusAction =
  | { type: 'VOTE_SHORTLIST'; payload: MediaItem }
  | { type: 'VOTE_SKIP'; payload: MediaItem }
  | { type: 'SET_MOOD'; payload: string }
  | { type: 'SET_WINNER'; payload: MediaItem }
  | { type: 'RESET_VOTING' };

const INITIAL_PARTICIPANTS: VotingParticipant[] = [
  { id: 'user-1', name: 'Ronak', avatarColor: '#00E5FF', hasVoted: false },
  { id: 'user-2', name: 'Family', avatarColor: '#FF9900', hasVoted: false },
];

export const initialConsensusState: ConsensusState = {
  shortlist: [],
  skipped: [],
  currentIndex: 0,
  winner: null,
  activeMood: 'All',
  participants: INITIAL_PARTICIPANTS,
  isVotingComplete: false,
};

export function consensusReducer(state: ConsensusState, action: ConsensusAction): ConsensusState {
  switch (action.type) {
    case 'VOTE_SHORTLIST': {
      const updatedShortlist = [...state.shortlist, action.payload];
      // If we reach 3 items or match consensus condition, declare top as winner candidate
      const isComplete = updatedShortlist.length >= 3;
      return {
        ...state,
        shortlist: updatedShortlist,
        currentIndex: state.currentIndex + 1,
        winner: isComplete ? updatedShortlist[0] : state.winner,
        isVotingComplete: isComplete,
      };
    }
    case 'VOTE_SKIP': {
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
      return {
        ...state,
        winner: action.payload,
        isVotingComplete: true,
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
  shortlist: (item: MediaItem) => void;
  skip: (item: MediaItem) => void;
  setMood: (mood: string) => void;
  setWinner: (item: MediaItem) => void;
  reset: () => void;
}

const ConsensusContext = createContext<ConsensusContextType | undefined>(undefined);

export const ConsensusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(consensusReducer, initialConsensusState);
  const items = mediaCatalog as MediaItem[];

  const shortlist = (item: MediaItem) => dispatch({ type: 'VOTE_SHORTLIST', payload: item });
  const skip = (item: MediaItem) => dispatch({ type: 'VOTE_SKIP', payload: item });
  const setMood = (mood: string) => dispatch({ type: 'SET_MOOD', payload: mood });
  const setWinner = (item: MediaItem) => dispatch({ type: 'SET_WINNER', payload: item });
  const reset = () => dispatch({ type: 'RESET_VOTING' });

  return (
    <ConsensusContext.Provider
      value={{
        state,
        items,
        shortlist,
        skip,
        setMood,
        setWinner,
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
