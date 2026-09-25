/**
 * Aura Vega TV - Global TypeScript Definitions
 * Follows DATA-MODEL.md and API-CONTRACTS.md
 */

export interface MediaItem {
  id: string;
  title: string;
  year: number;
  rating: string;
  runtime: string; // e.g., "2h 49m"
  runtimeMinutes?: number; // Parsed runtime in minutes (e.g., 169)
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
  preferredGenres?: string[];
  preferredMoods?: string[];
  dislikedGenres?: string[];
}

export interface ViewingContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weatherCondition: string;
  temperature: number;
  targetMaxRuntimeMinutes?: number;
  sessionMood?: string;
}

export interface ScoreBreakdown {
  affinityScore: number;       // 0-100 (Weight: 0.35)
  qualityScore: number;        // 0-100 (Weight: 0.25)
  contextScore: number;        // 0-100 (Weight: 0.25)
  runtimeScore: number;        // 0-100 (Weight: 0.15)
  penalty: number;             // Direct reduction (e.g. dislikes)
  totalScore: number;          // 0-100 clamped
  isVetoed: boolean;
}

export interface CandidateEvaluation {
  item: MediaItem;
  breakdown: ScoreBreakdown;
  matchPercentage: number;
  rank: number;
  positiveFactors: string[];
  negativeFactors: string[];
  summaryReason: string;
}

export interface RecommendationResult {
  winner: CandidateEvaluation;
  shortlistRankings: CandidateEvaluation[];
  evaluatedCandidatesCount: number;
  generatedAt: string;
  contextSummary: string;
}

export interface ConsensusState {
  shortlist: MediaItem[];
  skipped: MediaItem[];
  currentIndex: number;
  winner: MediaItem | null;
  activeMood: string;
  participants: VotingParticipant[];
  isVotingComplete: boolean;
  recommendation: RecommendationResult | null;
  evaluations: Map<string, CandidateEvaluation>;
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
  VideoPlayer: { item: MediaItem };
};
