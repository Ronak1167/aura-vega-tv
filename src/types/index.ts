/**
 * Aura Vega TV - Global TypeScript Definitions
 * Follows DATA-MODEL.md and API-CONTRACTS.md
 */

export interface MediaItem {
  id: string;
  title: string;
  year: number;
  rating: string;
  runtime: string;
  imdbScore: number;
  rottenTomatoes: number;
  mood: string;
  synopsis: string;
  streamingPlatform: 'Prime Video' | 'Netflix' | 'Max' | 'Apple TV+';
  backdropUrl: string;
  trailerUrl?: string;
  director?: string;
  cast?: string[];
  tags: string[];
}

export type VoteAction = 'shortlist' | 'skip' | 'reset';

export interface VotingParticipant {
  id: string;
  name: string;
  avatarColor: string;
  hasVoted: boolean;
}

export interface ConsensusState {
  shortlist: MediaItem[];
  skipped: MediaItem[];
  currentIndex: number;
  winner: MediaItem | null;
  activeMood: string;
  participants: VotingParticipant[];
  isVotingComplete: boolean;
}

export interface WeatherTelemetry {
  temperature: number;
  condition: string;
  conditionCode: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'storm' | 'clear_night';
  high: number;
  low: number;
  humidity: number;
  airQualityIndex: number;
  location: string;
  lastUpdated: string;
}

export interface DoorbellAlert {
  id: string;
  timestamp: string;
  cameraName: string;
  eventDescription: string;
  snapshotUrl: string;
  status: 'active' | 'dismissed';
  visitorType: 'delivery' | 'family' | 'guest' | 'motion';
}

export type RootStackParamList = {
  Ambient: undefined;
  Consensus: undefined;
  Settings: undefined;
};
