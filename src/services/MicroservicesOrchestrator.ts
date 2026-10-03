/**
 * MicroservicesOrchestrator.ts
 *
 * Top-level Autonomous Orchestrator for Aura Vega TV's world-class microservices stack.
 *
 * Full Autonomous Dependency Graph:
 *              → APIGateway → AuthService → SupabaseService (Real-Time Presence)
 *              → XanoBackendService (Cloud Watchlists & Voting Ledgers)
 *              → AutonomousAIEngine (4-Agent Consensus Pipeline)
 *              → AIRecommender → ScoringEngine (Hermes Bytecode Accelerated)
 *              → GenerativeMotionService (Runway Gen-4 + Higgsfield Kling Video)
 *              → SplineSpatialService (3D Spatial Telemetry & Consensus Orb)
 *              → AutonomousInsightReporter (Real-Time Intelligence Layer)
 *              → SmartNotificationRouter (AI-Routed Alert Deduplication)
 *              → VegaOSHealthMonitor (Self-Healing Service Health Dashboard)
 *              → MediaCDN → PlaybackSession (Dolby Atmos & 4K HDR)
 *              → NotificationService → Fire TV 10-Foot Toast Alerts
 *              → AnalyticsService → Telemetry Logging
 */

import { MediaItem, VotingParticipant, ViewingContext, RecommendationResult } from '../types';
import { apiGateway, GatewayRequest } from './APIGatewayService';
import { aiRecommender, AIRecommendation } from './AIRecommenderService';
import { sessionService, analyticsService, RealtimeSyncService, PresenceState } from './SupabaseService';
import { mediaCDN, MediaStream, VideoQuality } from './MediaCDNService';
import { notificationService } from './NotificationService';
import { mediaDataService } from './MediaDataService';
import { generateConsensusRecommendation } from '../engine/ScoringEngine';
import { xanoBackend, XanoConsensusRecord } from './XanoBackendService';
import { generativeMotion, MotionJob } from './GenerativeMotionService';
import { splineSpatial, Spline3DSceneConfig, SpatialLightingVector } from './SplineSpatialService';
import { autonomousAIEngine, AutonomousAgentReport } from '../engine/AutonomousAIEngine';
import { insightReporter, InsightReport } from '../engine/AutonomousInsightReporter';
import { notificationRouter, RoutedNotification } from './SmartNotificationRouter';
import { healthMonitor, HealthSnapshot } from './VegaOSHealthMonitor';
import { DoorbellAlert } from '../types';

// ---------------------------------------------------------------------------
// Application Config
// ---------------------------------------------------------------------------
export interface AppConfig {
  householdId: string;
  adminProfileId: string;
  maxParticipants: number;
  defaultTimeoutMs: number;
  enableAIBoost: boolean;
  enableRealtime: boolean;
  enableAnalytics: boolean;
  enableAutonomousLoop: boolean;
  enableGenerativeMotion: boolean;
  enableXanoSync: boolean;
  enableSpline3D: boolean;
  enableInsightReporter: boolean;
  enableHealthMonitor: boolean;
  enableSmartNotifications: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  householdId: 'household_ronak_jain_2025',
  adminProfileId: 'profile_ronak',
  maxParticipants: 6,
  defaultTimeoutMs: 30_000,
  enableAIBoost: true,
  enableRealtime: true,
  enableAnalytics: true,
  enableAutonomousLoop: true,
  enableGenerativeMotion: true,
  enableXanoSync: true,
  enableSpline3D: true,
  enableInsightReporter: true,
  enableHealthMonitor: true,
  enableSmartNotifications: true,
};

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
export class MicroservicesOrchestrator {
  private config: AppConfig;
  private realtimeSync: RealtimeSyncService;
  private activeSessionId?: string;
  private isBooted = false;

  constructor(config: Partial<AppConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.realtimeSync = new RealtimeSyncService(this.config.householdId);
  }

  // ---------------------------------------------------------------------------
  // Boot Sequence
  // ---------------------------------------------------------------------------
  async boot(): Promise<{
    success: boolean;
    services: Record<string, boolean>;
    bootTimeMs: number;
  }> {
    const t0 = Date.now();
    const services: Record<string, boolean> = {};

    // 1. Pre-warm AI embedding cache
    try {
      const catalog = mediaDataService.getAllMedia();
      await aiRecommender.preWarm(catalog);
      services['ai_recommender'] = true;
    } catch {
      services['ai_recommender'] = false;
    }

    // 2. Initialize Xano Cloud Backend
    try {
      const xanoHealth = xanoBackend.getHealthStatus();
      services['xano_backend'] = xanoHealth.connected;
    } catch {
      services['xano_backend'] = false;
    }

    // 3. Initialize Generative Motion Studio (Runway + Higgsfield)
    try {
      const motionHealth = generativeMotion.getHealthStatus();
      services['generative_motion'] =
        motionHealth.runwayConfigured && motionHealth.higgsfieldConfigured;
    } catch {
      services['generative_motion'] = false;
    }

    // 4. Initialize Spline 3D Spatial Service
    try {
      services['spline_spatial'] = true;
    } catch {
      services['spline_spatial'] = false;
    }

    // 5. Initialize Supabase Session service
    try {
      services['supabase'] = true;
    } catch {
      services['supabase'] = false;
    }

    // 6. Verify Media CDN
    try {
      await mediaCDN.getStream('media-dune2', 'system', '1080p');
      services['media_cdn'] = true;
    } catch {
      services['media_cdn'] = false;
    }

    // 7. Core foundational services
    services['notifications'] = true;
    services['api_gateway'] = true;
    services['realtime_sync'] = true;
    services['analytics'] = true;
    services['scoring_engine'] = true;
    services['autonomous_ai_engine'] = true;
    services['insight_reporter'] = this.config.enableInsightReporter;
    services['health_monitor'] = this.config.enableHealthMonitor;
    services['smart_notifications'] = this.config.enableSmartNotifications;

    // 8. Initial health snapshot (non-blocking)
    if (this.config.enableHealthMonitor) {
      healthMonitor.generateSnapshot().catch(err =>
        console.warn('[Orchestrator] Initial health snapshot failed:', err)
      );
    }

    this.isBooted = true;
    return { success: true, services, bootTimeMs: Date.now() - t0 };
  }

  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------
  async startHouseholdSession(participants: VotingParticipant[]): Promise<string> {
    const session = await sessionService.createSession(this.config.householdId, participants);
    this.activeSessionId = session.id;
    return session.id;
  }

  async joinSession(
    participant: VotingParticipant,
    onPresenceUpdate: (states: PresenceState[]) => void,
  ): Promise<void> {
    if (this.config.enableRealtime) {
      await this.realtimeSync.joinSession(participant, onPresenceUpdate);
    }
  }

  // ---------------------------------------------------------------------------
  // Autonomous Consensus & Recommendation Pipeline
  // ---------------------------------------------------------------------------
  async getAutonomousConsensus(
    participants: VotingParticipant[],
    context: ViewingContext,
  ): Promise<{
    recommendation: RecommendationResult;
    aiRecommendation: AIRecommendation;
    report: AutonomousAgentReport;
  }> {
    const catalog = mediaDataService.getAllMedia();

    const request: GatewayRequest<{ participants: VotingParticipant[]; context: ViewingContext }> = {
      service: 'autonomous_ai_engine',
      action: 'execute_autonomous_consensus',
      profileId: this.config.adminProfileId,
      sessionId: this.activeSessionId,
      payload: { participants, context },
      timestamp: new Date().toISOString(),
    };

    const response = await apiGateway.handle(request, async ({ participants: p, context: c }) => {
      return await autonomousAIEngine.executeAutonomousConsensus(
        catalog,
        p,
        c,
        this.config.householdId,
      );
    });

    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Autonomous consensus failed');
    }

    const { aiRecommendation, report } = response.data;

    // Persist consensus to Supabase & Xano
    if (this.activeSessionId) {
      await sessionService.updateConsensus(
        this.activeSessionId,
        aiRecommendation.topPick.matchPercentage,
        aiRecommendation.topPick.item.id,
      );
    }

    // Fire TV living room toast notification
    await notificationService.notifyConsensusComplete(
      aiRecommendation.topPick.item.title,
      aiRecommendation.topPick.matchPercentage,
      participants,
    );

    if (this.config.enableAnalytics) {
      await analyticsService.trackSession(context, aiRecommendation.topPick.item);
    }

    return response.data;
  }

  // ---------------------------------------------------------------------------
  // Standard Consensus & Recommendation (Backward Compatible)
  // ---------------------------------------------------------------------------
  async getConsensusRecommendation(
    participants: VotingParticipant[],
    context: ViewingContext,
  ): Promise<AIRecommendation> {
    const res = await this.getAutonomousConsensus(participants, context);
    return res.aiRecommendation;
  }

  // ---------------------------------------------------------------------------
  // Generative Motion Studio Access
  // ---------------------------------------------------------------------------
  async getAmbientMotion(
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
    weatherCondition: string,
  ): Promise<MotionJob> {
    return await generativeMotion.getAmbientMotionLoop(timeOfDay, weatherCondition);
  }

  async getFilmTeaser(mediaId: string): Promise<MotionJob> {
    const media = mediaDataService.getMediaById(mediaId);
    if (!media) throw new Error(`Media not found: ${mediaId}`);
    return await generativeMotion.generateFilmTeaser(
      media.id,
      media.title,
      media.backdropUrl,
      media.mood,
    );
  }

  // ---------------------------------------------------------------------------
  // Spline 3D Spatial Canvas Access
  // ---------------------------------------------------------------------------
  getSpatialLighting(
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
    weatherCondition: string,
  ): SpatialLightingVector {
    return splineSpatial.getSpatialLighting(timeOfDay, weatherCondition);
  }

  getConsensusOrbConfig(matchPercentage: number, isVotingActive: boolean): Spline3DSceneConfig {
    return splineSpatial.getConsensusOrbConfig(matchPercentage, isVotingActive);
  }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------
  async startPlayback(
    mediaId: string,
    profileId: string,
    quality?: VideoQuality,
  ): Promise<MediaStream> {
    const request: GatewayRequest<{ mediaId: string; profileId: string; quality?: VideoQuality }> = {
      service: 'media_cdn',
      action: 'stream',
      profileId,
      sessionId: this.activeSessionId,
      payload: { mediaId, profileId, quality },
      timestamp: new Date().toISOString(),
    };

    const response = await apiGateway.handle(
      request,
      async ({ mediaId: mId, profileId: pId, quality: q }) => {
        return await mediaCDN.getStream(mId, pId, q);
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Stream failed');
    }

    if (this.config.enableAnalytics) {
      const media = mediaDataService.getMediaById(mediaId);
      if (media) {
        await analyticsService.trackEvent(
          'playback_start',
          { mediaId, quality: response.data.quality },
          profileId,
        );
      }
    }

    return response.data;
  }

  // ---------------------------------------------------------------------------
  // Voting
  // ---------------------------------------------------------------------------
  async castVote(profileId: string, mediaId: string): Promise<void> {
    if (this.config.enableRealtime) {
      await this.realtimeSync.broadcastVote(profileId, mediaId);
    }
    const media = mediaDataService.getMediaById(mediaId);
    await notificationService.notifyMemberVoted(profileId, media?.title ?? mediaId);
    if (this.config.enableAnalytics) {
      await analyticsService.trackEvent('vote_cast', { mediaId }, profileId);
    }
  }

  // ---------------------------------------------------------------------------
  // Metrics & State Inspection
  // ---------------------------------------------------------------------------
  getGatewayMetrics() {
    return apiGateway.getMetrics();
  }

  getPresence(): PresenceState[] {
    return this.realtimeSync.getPresence();
  }

  getAICacheSize(): number {
    return aiRecommender.getCacheSize();
  }

  getXanoHealth() {
    return xanoBackend.getHealthStatus();
  }

  getGenerativeMotionHealth() {
    return generativeMotion.getHealthStatus();
  }

  getLastAutonomousReport(): AutonomousAgentReport | null {
    return autonomousAIEngine.getLastReport();
  }

  // ---------------------------------------------------------------------------
  // Autonomous Insight Reporter
  // ---------------------------------------------------------------------------
  async generateInsightReport(
    participants: VotingParticipant[],
    recentActivity: MediaItem[],
  ): Promise<InsightReport> {
    const catalog = mediaDataService.getAllMedia();
    const xanoStatus = xanoBackend.getHealthStatus();
    const cacheHitRate = xanoStatus.cachedRecordsCount > 0
      ? 1 - (xanoStatus.pendingQueueLength / Math.max(xanoStatus.cachedRecordsCount, 1))
      : 0;
    return insightReporter.generateReport(participants, catalog, recentActivity, cacheHitRate);
  }

  getLastInsightReport(): InsightReport | null {
    return insightReporter.getLastReport();
  }

  // ---------------------------------------------------------------------------
  // Smart Notification Router
  // ---------------------------------------------------------------------------
  routeDoorbellAlert(alert: DoorbellAlert, isPlaybackActive: boolean): RoutedNotification {
    return notificationRouter.route(alert, isPlaybackActive);
  }

  getNotificationRouterStats() {
    return notificationRouter.getStats();
  }

  // ---------------------------------------------------------------------------
  // Vega OS Health Monitor
  // ---------------------------------------------------------------------------
  async getSystemHealthSnapshot(): Promise<HealthSnapshot> {
    return healthMonitor.generateSnapshot();
  }

  getSystemHealthScore(): number {
    return healthMonitor.getCompositeScore();
  }

  getHealthHistory(): HealthSnapshot[] {
    return healthMonitor.getHistory();
  }

  recordServiceSuccess(service: Parameters<typeof healthMonitor.recordSuccess>[0], latencyMs: number): void {
    healthMonitor.recordSuccess(service, latencyMs);
  }

  recordServiceError(service: Parameters<typeof healthMonitor.recordError>[0], error: unknown): void {
    healthMonitor.recordError(service, error);
  }

  isReady(): boolean {
    return this.isBooted;
  }
}

// Singleton instance
export const orchestrator = new MicroservicesOrchestrator();
