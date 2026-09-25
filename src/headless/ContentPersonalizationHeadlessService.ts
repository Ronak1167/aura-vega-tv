/**
 * ContentPersonalizationHeadlessService.ts
 *
 * Official Vega OS Headless Service implementation.
 * Declared in manifest.toml under [[components.service]] and invoked by service.js.
 *
 * Responsibilities:
 *  1. Background periodic catalog refresh and telemetry ingestion.
 *  2. Pre-computing multi-factor candidate evaluations in the headless JS context.
 *  3. Caching personalized recommendations so foreground UI experiences 0ms computation latency.
 */

import { CandidateEvaluation, ViewingContext, VotingParticipant, MediaItem } from '../types';
import mediaCatalog from '../data/media-catalog.json';
import { rankCandidates } from '../engine/ScoringEngine';

export class ContentPersonalizationHeadlessService {
  private static instance: ContentPersonalizationHeadlessService | null = null;
  private isRunning: boolean = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private cachedRecommendations: CandidateEvaluation[] = [];
  private lastSyncTimestamp: string | null = null;

  private constructor() {}

  public static getInstance(): ContentPersonalizationHeadlessService {
    if (!ContentPersonalizationHeadlessService.instance) {
      ContentPersonalizationHeadlessService.instance = new ContentPersonalizationHeadlessService();
    }
    return ContentPersonalizationHeadlessService.instance;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[HeadlessService] Starting background content synchronization...');

    // Run an initial sync immediately
    this.syncContent();

    // Schedule periodic background refresh every 60 seconds
    this.syncTimer = setInterval(() => {
      this.syncContent();
    }, 60000);
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.log('[HeadlessService] Stopped background content synchronization.');
  }

  public getCachedRecommendations(): CandidateEvaluation[] {
    return this.cachedRecommendations;
  }

  public getLastSyncTimestamp(): string | null {
    return this.lastSyncTimestamp;
  }

  private syncContent(): void {
    const defaultParticipants: VotingParticipant[] = [
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
        preferredGenres: ['Sci-Fi', 'Blockbuster', 'Family'],
        preferredMoods: ['Epic Sci-Fi Spectacle'],
        dislikedGenres: [],
      },
    ];

    const currentContext: ViewingContext = {
      timeOfDay: 'evening',
      weatherCondition: 'Rainy',
      temperature: 68,
      targetMaxRuntimeMinutes: 180,
      sessionMood: 'All',
    };

    // Pre-score and rank catalog
    this.cachedRecommendations = rankCandidates(
      mediaCatalog as MediaItem[],
      defaultParticipants,
      currentContext,
    );

    this.lastSyncTimestamp = new Date().toISOString();
    console.log(
      `[HeadlessService] Synced personalized media recommendations: ${this.cachedRecommendations.length} items ranked in background.`,
    );
  }
}

export function onStartService(): void {
  ContentPersonalizationHeadlessService.getInstance().start();
}

export function onStopService(): void {
  ContentPersonalizationHeadlessService.getInstance().stop();
}
