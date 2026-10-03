/**
 * AutonomousInsightReporter.ts
 *
 * Vega OS Real-Time Intelligence Layer.
 *
 * This module aggregates signals from all autonomous agents (Context Analyst,
 * Household Synthesizer, Predictive Cache, Generative Motion) and composes a
 * structured insight report that surfaces as:
 *   - Ambient screen ticker data
 *   - Cloud telemetry pushed to Xano (history + analytics)
 *   - Runway/Higgsfield motion-loop context triggers
 *
 * Runs on a 5-minute cadence inside the headless service.
 */

import { ViewingContext, VotingParticipant, MediaItem } from '../types';
import { aiRecommender, AIRecommendation } from '../services/AIRecommenderService';
import { getAmbientTheme } from '../utils/time-of-day';

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface TrendSignal {
  dimension: 'genre' | 'mood' | 'runtime' | 'platform' | 'context';
  label: string;
  strength: number;       // 0.0 – 1.0
  direction: 'rising' | 'stable' | 'declining';
}

export interface InsightReport {
  sessionId: string;
  generatedAt: string;
  viewingContext: ViewingContext;
  householdSize: number;

  // AI Recommendation snapshot
  topRecommendation: AIRecommendation | null;

  // Trend signals extracted from recent activity
  trendSignals: TrendSignal[];

  // Natural-language summary ready to display on ambient screen
  narrativeSummary: string;

  // Motion cue for Runway / Higgsfield — describes the scene mood
  generativeMotionPrompt: string;

  // Health score: 0-100 composite of model latency, cache hit rate, data freshness
  systemHealthScore: number;

  // Diagnostics
  diagnostics: {
    modelLatencyMs: number;
    cacheHitRate: number;
    dataFreshnessSeconds: number;
  };
}

// ---------------------------------------------------------------------------
// Internal trend memory (rolling 10-window)
// ---------------------------------------------------------------------------

const TREND_WINDOW = 10;
const genreHistory: string[] = [];
const moodHistory: string[] = [];

function recordActivity(item: MediaItem): void {
  genreHistory.push(...(item.tags ?? []));
  moodHistory.push(item.mood);
  if (genreHistory.length > TREND_WINDOW * 5) genreHistory.splice(0, 5);
  if (moodHistory.length > TREND_WINDOW) moodHistory.splice(0, 1);
}

function computeTrendSignals(recent: MediaItem[]): TrendSignal[] {
  const signals: TrendSignal[] = [];

  // Genre frequency map
  const genreCount: Record<string, number> = {};
  for (const item of recent) {
    for (const tag of item.tags ?? []) {
      genreCount[tag] = (genreCount[tag] ?? 0) + 1;
    }
  }

  const total = recent.length || 1;
  const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
  for (const [label, count] of sortedGenres.slice(0, 3)) {
    signals.push({
      dimension: 'genre',
      label,
      strength: Math.min(1.0, count / total),
      direction: count >= total * 0.6 ? 'rising' : count >= total * 0.3 ? 'stable' : 'declining',
    });
  }

  // Mood frequency
  const moodCount: Record<string, number> = {};
  for (const item of recent) {
    moodCount[item.mood] = (moodCount[item.mood] ?? 0) + 1;
  }
  const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
  if (topMood) {
    signals.push({
      dimension: 'mood',
      label: topMood[0],
      strength: Math.min(1.0, topMood[1] / total),
      direction: 'stable',
    });
  }

  // Platform diversity signal
  const platforms = new Set(recent.map(i => i.streamingPlatform));
  signals.push({
    dimension: 'platform',
    label: `${platforms.size} platform${platforms.size !== 1 ? 's' : ''} active`,
    strength: Math.min(1.0, platforms.size / 4),
    direction: 'stable',
  });

  return signals;
}

function buildNarrativeSummary(
  report: Omit<InsightReport, 'narrativeSummary' | 'generativeMotionPrompt'>,
): string {
  const { trendSignals, householdSize, viewingContext, topRecommendation } = report;
  const topGenre = trendSignals.find(s => s.dimension === 'genre');
  const topMood = trendSignals.find(s => s.dimension === 'mood');

  const timeStr = viewingContext.timeOfDay;
  const weather = viewingContext.weatherCondition;
  const topTitle = topRecommendation?.topPick.item.title ?? 'a curated pick';
  const confidence = topRecommendation?.topPick.matchPercentage ?? 0;

  let narrative = `🎬 Vega OS — ${timeStr.charAt(0).toUpperCase() + timeStr.slice(1)} Report.\n`;
  narrative += `Household of ${householdSize} viewer${householdSize !== 1 ? 's' : ''}. `;

  if (topGenre) {
    narrative += `Trending genre: ${topGenre.label} (${Math.round(topGenre.strength * 100)}% affinity). `;
  }
  if (topMood) {
    narrative += `Dominant mood: ${topMood.label}. `;
  }

  narrative += `Weather context: ${weather}. `;
  narrative += `Top AI pick: "${topTitle}" at ${confidence}% consensus confidence.`;

  return narrative;
}

function buildGenerativeMotionPrompt(context: ViewingContext, topMood?: string): string {
  const { timeOfDay, weatherCondition } = context;
  const mood = topMood ?? 'cinematic';

  const weatherMap: Record<string, string> = {
    rainy: 'rainy windowpane reflections, neon city glow, bokeh droplets',
    sunny: 'golden-hour sun rays streaming through glass, warm dust particles',
    cloudy: 'soft diffused light, cool silver tones, gentle ambient movement',
    storm: 'dramatic lightning silhouettes, electric atmosphere, deep contrast',
    clear_night: 'deep space starfield parallax, cosmic nebula drift, dark cosmos',
    partly_cloudy: 'drifting cloud shadows, shifting sunbeams, gentle transition',
  };

  const timeMap: Record<string, string> = {
    morning: 'fresh dawn atmosphere, pastel horizon, slow awakening motion',
    afternoon: 'bright natural light, energetic ambiance, crisp sharp focus',
    evening: 'warm golden dusk, city lights slowly appearing, soft fade',
    night: 'deep blue midnight hues, glowing UI elements, cinematic darkness',
  };

  const weatherDesc = weatherMap[weatherCondition.toLowerCase()] ?? weatherCondition;
  const timeDesc = timeMap[timeOfDay] ?? timeOfDay;

  return `Cinematic TV ambient loop: ${mood} mood, ${weatherDesc}, ${timeDesc}. ` +
    `Slow parallax motion, premium streaming platform aesthetic, 4K quality, `+
    `seamless loop, ultra-smooth 24fps, no text, purely atmospheric visual.`;
}

// ---------------------------------------------------------------------------
// Main reporter class
// ---------------------------------------------------------------------------

class AutonomousInsightReporter {
  private lastReport: InsightReport | null = null;
  private reportCount = 0;

  async generateReport(
    participants: VotingParticipant[],
    catalog: MediaItem[],
    recentActivity: MediaItem[],
    cacheHitRate: number,
  ): Promise<InsightReport> {
    const t0 = Date.now();
    const now = new Date().toISOString();

    // Derive timeOfDay from ambient theme period
    const ambientPeriod = getAmbientTheme().period;
    const periodToTimeOfDay: Record<string, ViewingContext['timeOfDay']> = {
      dawn: 'morning',
      day: 'afternoon',
      golden_hour: 'evening',
      night: 'night',
    };
    const timeOfDay: ViewingContext['timeOfDay'] = periodToTimeOfDay[ambientPeriod] ?? 'evening';
    const viewingContext: ViewingContext = {
      timeOfDay,
      weatherCondition: 'clear_night', // Will be overridden by WeatherService in production
      temperature: 22,
    };

    // Record activity for trend memory
    for (const item of recentActivity.slice(-5)) {
      recordActivity(item);
    }

    // Get AI recommendation for current household state
    let topRecommendation: AIRecommendation | null = null;
    try {
      topRecommendation = await aiRecommender.recommend(
        catalog.slice(0, 12), // top 12 candidates
        participants,
        viewingContext,
      );
    } catch {
      // Continue without recommendation — non-blocking
    }

    const trendSignals = computeTrendSignals(recentActivity);
    const systemHealthScore = Math.round(
      (cacheHitRate * 40) +
      ((1 - Math.min(1, (Date.now() - t0) / 2000)) * 40) +
      (topRecommendation ? 20 : 0)
    );

    const baseReport = {
      sessionId: `vega-report-${++this.reportCount}`,
      generatedAt: now,
      viewingContext,
      householdSize: participants.length,
      topRecommendation,
      trendSignals,
      systemHealthScore: Math.min(100, systemHealthScore),
      diagnostics: {
        modelLatencyMs: Date.now() - t0,
        cacheHitRate,
        dataFreshnessSeconds: 0,
      },
    };

    const topMoodSignal = trendSignals.find(s => s.dimension === 'mood');
    const narrativeSummary = buildNarrativeSummary(baseReport);
    const generativeMotionPrompt = buildGenerativeMotionPrompt(
      viewingContext,
      topMoodSignal?.label,
    );

    const report: InsightReport = {
      ...baseReport,
      narrativeSummary,
      generativeMotionPrompt,
    };

    this.lastReport = report;
    return report;
  }

  getLastReport(): InsightReport | null {
    return this.lastReport;
  }

  getReportCount(): number {
    return this.reportCount;
  }
}

export const insightReporter = new AutonomousInsightReporter();
