/**
 * ScoringEngine.ts
 *
 * Deterministic Multi-Factor Scoring & Recommendation Engine for Aura Vega TV.
 * Implements the mathematical specification from Sprint 3.
 *
 * Factors:
 *  1. Voter Affinity Score (Weight: 0.35)
 *  2. Critical Quality Acclaim (Weight: 0.25)
 *  3. Contextual Environmental Alignment (Weight: 0.25)
 *  4. Runtime / Session Fit (Weight: 0.15)
 *
 * Exclusions & Vetoes:
 *  - Disliked genres apply a -50 penalty per voter.
 *  - Explicit exclusions lower candidate match percentage to prevent friction.
 *
 * Determinism:
 *  - No random variables.
 *  - Strict tie-breaker sequence: Affinity -> Quality -> Alphabetical.
 */

import {
  MediaItem,
  VotingParticipant,
  ViewingContext,
  ScoreBreakdown,
  CandidateEvaluation,
  RecommendationResult,
} from '../types';

/**
 * Weights for the composite score calculation.
 * Sum = 1.00
 */
export const SCORING_WEIGHTS = {
  AFFINITY: 0.35,
  QUALITY: 0.25,
  CONTEXT: 0.25,
  RUNTIME: 0.15,
} as const;

/**
 * Parses runtime string like "2h 49m", "1h 56m", "118 min", or numbers into minutes.
 */
export function parseRuntimeMinutes(runtimeStr?: string): number {
  if (!runtimeStr) return 110; // Default average feature length

  const hoursMatch = runtimeStr.match(/(\d+)\s*h/i);
  const minutesMatch = runtimeStr.match(/(\d+)\s*m/i);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const mins = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return hours * 60 + mins;
  }

  const numOnlyMatch = runtimeStr.match(/\d+/);
  if (numOnlyMatch) {
    return parseInt(numOnlyMatch[0], 10);
  }

  return 110;
}

/**
 * Computes normalized critical quality score (0 - 100)
 * Blends IMDb (scale 0-10) and Rotten Tomatoes (scale 0-100).
 */
export function computeQualityScore(item: MediaItem): number {
  const rawImdb = typeof item.imdbScore === 'number' && !isNaN(item.imdbScore) ? item.imdbScore : 7.0;
  const rawRt = typeof item.rottenTomatoes === 'number' && !isNaN(item.rottenTomatoes) ? item.rottenTomatoes : 75;

  // Normalized IMDb = imdb * 10
  const normImdb = Math.min(100, Math.max(0, rawImdb * 10));
  const normRt = Math.min(100, Math.max(0, rawRt));

  return Math.round(0.5 * normImdb + 0.5 * normRt);
}

/**
 * Computes voter affinity score (0 - 100) and penalties across all active participants.
 */
export function computeAffinityScore(
  item: MediaItem,
  participants: VotingParticipant[],
): {
  score: number;
  penalty: number;
  isVetoed: boolean;
  positiveReasons: string[];
  negativeReasons: string[];
} {
  if (!participants || participants.length === 0) {
    return {
      score: 70, // Baseline neutral affinity
      penalty: 0,
      isVetoed: false,
      positiveReasons: ['General audience recommendation'],
      negativeReasons: [],
    };
  }

  // Filter to active voters who have not been toggled inactive
  const activeParticipants = participants.filter((p) => p.hasVoted !== false);
  const votersToEvaluate = activeParticipants.length > 0 ? activeParticipants : participants;

  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const itemMood = (item.mood || '').toLowerCase();

  let totalVoterSatisfaction = 0;
  let totalPenalty = 0;
  let isVetoed = false;
  const positiveReasons: string[] = [];
  const negativeReasons: string[] = [];

  const agreeingVoters: string[] = [];
  const conflictingVoters: string[] = [];

  for (const voter of votersToEvaluate) {
    const preferredGenres = (voter.preferredGenres || ['sci-fi', 'action']).map((g) => g.toLowerCase());
    const preferredMoods = (voter.preferredMoods || []).map((m) => m.toLowerCase());
    const dislikedGenres = (voter.dislikedGenres || []).map((d) => d.toLowerCase());

    // 1. Check for veto / disliked genres
    const hasDislikedGenre = dislikedGenres.some((disliked) =>
      tags.some((tag) => tag.includes(disliked)) || itemMood.includes(disliked),
    );

    if (hasDislikedGenre) {
      totalPenalty += 40;
      conflictingVoters.push(voter.name);
      negativeReasons.push(`${voter.name} dislikes this genre category`);
    }

    // 2. Count matching preferred genres
    const matchedCount = preferredGenres.filter((genre) =>
      tags.some((tag) => tag.includes(genre)) || itemMood.includes(genre),
    ).length;

    // 3. Check mood affinity
    const moodMatched = preferredMoods.some((m) => itemMood.includes(m));

    let voterScore = 40; // Base score
    if (matchedCount > 0) {
      // High reward for genre alignment: 70 for 1 match, 85 for 2 matches
      voterScore = 60 + Math.min(25, matchedCount * 15);
    }

    if (moodMatched) {
      voterScore += 15;
    }

    // Only count as agreeing if the voter does NOT have a genre conflict —
    // prevents contradictory explainability ("matches Bob" + "Bob dislikes this").
    if ((matchedCount > 0 || moodMatched) && !hasDislikedGenre) {
      agreeingVoters.push(voter.name);
    }

    totalVoterSatisfaction += Math.min(100, voterScore);
  }

  const avgAffinity = Math.round(totalVoterSatisfaction / votersToEvaluate.length);

  // Summarize group consensus reasons
  if (agreeingVoters.length === votersToEvaluate.length && votersToEvaluate.length > 1) {
    positiveReasons.push(`Unanimous match: All ${votersToEvaluate.length} viewers enjoy this genre`);
  } else if (agreeingVoters.length > 0) {
    positiveReasons.push(`Matches preferences for ${agreeingVoters.join(' & ')}`);
  }

  // If majority has a conflict, flag as veto
  if (conflictingVoters.length >= Math.ceil(votersToEvaluate.length / 2) && conflictingVoters.length > 0) {
    isVetoed = true;
  }

  return {
    score: Math.max(0, avgAffinity),
    penalty: totalPenalty,
    isVetoed,
    positiveReasons,
    negativeReasons,
  };
}

/**
 * Computes contextual environmental alignment score (0 - 100)
 * Evaluates time-of-day, weather condition, and active session mood.
 */
export function computeContextScore(
  item: MediaItem,
  context: ViewingContext,
): {
  score: number;
  reasons: string[];
} {
  let score = 70; // Baseline
  const reasons: string[] = [];
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const mood = (item.mood || '').toLowerCase();
  const runtime = parseRuntimeMinutes(item.runtime);

  // Time of Day Alignment
  switch (context.timeOfDay) {
    case 'night': {
      if (runtime <= 120) {
        score += 15;
        reasons.push('Fits late-night viewing window under 2 hours');
      } else {
        score -= 15;
        reasons.push('Lengthy runtime for late-night viewing');
      }
      break;
    }
    case 'evening': {
      // Prime feature film window
      score += 15;
      reasons.push('Ideal prime-time evening feature');
      break;
    }
    case 'afternoon': {
      if (tags.some((t) => ['action', 'adventure', 'sci-fi', 'family'].includes(t))) {
        score += 10;
        reasons.push('Great afternoon entertainment');
      }
      break;
    }
    case 'morning': {
      if (tags.some((t) => ['documentary', 'animation', 'comedy'].includes(t))) {
        score += 10;
        reasons.push('Light daytime watch');
      }
      break;
    }
  }

  // Weather Condition Alignment
  const weather = (context.weatherCondition || '').toLowerCase();
  if (weather.includes('rain') || weather.includes('storm') || weather.includes('cloud')) {
    if (mood.includes('cosmic') || mood.includes('noir') || tags.includes('sci-fi') || tags.includes('drama')) {
      score += 15;
      reasons.push('Atmospheric cozy vibe matches today’s overcast weather');
    }
  } else if (weather.includes('clear') || weather.includes('sun')) {
    if (tags.includes('action') || tags.includes('blockbuster')) {
      score += 10;
      reasons.push('Vibrant blockbuster pick for clear weather');
    }
  }

  // Session Mood Filter Override
  if (context.sessionMood && context.sessionMood !== 'All') {
    const selectedMood = context.sessionMood.toLowerCase();
    const hasTagMatch = tags.some((t) => t.includes(selectedMood));
    const hasMoodMatch = mood.includes(selectedMood);

    if (hasTagMatch || hasMoodMatch) {
      score += 20;
      reasons.push(`Directly matches selected ${context.sessionMood} mood`);
    } else {
      score -= 30;
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  };
}

/**
 * Computes runtime score based on user-defined or default threshold.
 */
export function computeRuntimeScore(
  runtimeMinutes: number,
  context: ViewingContext,
): {
  score: number;
  reason?: string;
} {
  const targetMax =
    context.targetMaxRuntimeMinutes && context.targetMaxRuntimeMinutes > 0
      ? context.targetMaxRuntimeMinutes
      : context.timeOfDay === 'night'
      ? 120
      : 180;

  if (runtimeMinutes <= targetMax) {
    return {
      score: 100,
      reason: `Comfortably within your ${targetMax}m time limit`,
    };
  }

  const overage = runtimeMinutes - targetMax;
  const decay = overage * 1.2;
  const finalScore = Math.max(20, Math.round(100 - decay));

  return {
    score: finalScore,
    reason: `${overage}m longer than preferred ${targetMax}m window`,
  };
}

/**
 * Evaluates a single MediaItem candidate against voters and context.
 */
export function evaluateCandidate(
  item: MediaItem,
  participants: VotingParticipant[],
  context: ViewingContext,
): CandidateEvaluation {
  const runtimeMinutes = parseRuntimeMinutes(item.runtime);
  const quality = computeQualityScore(item);
  const affinity = computeAffinityScore(item, participants);
  const ctx = computeContextScore(item, context);
  const runtime = computeRuntimeScore(runtimeMinutes, context);

  // Calculate weighted total
  const rawTotal =
    affinity.score * SCORING_WEIGHTS.AFFINITY +
    quality * SCORING_WEIGHTS.QUALITY +
    ctx.score * SCORING_WEIGHTS.CONTEXT +
    runtime.score * SCORING_WEIGHTS.RUNTIME -
    affinity.penalty;

  // Vetoed items are capped at 30; minimum is 1 (not 0) to avoid a misleading "0% MATCH" badge.
  const totalScore = affinity.isVetoed
    ? Math.min(30, Math.max(1, Math.round(rawTotal)))
    : Math.min(100, Math.max(0, Math.round(rawTotal)));

  const breakdown: ScoreBreakdown = {
    affinityScore: affinity.score,
    qualityScore: quality,
    contextScore: ctx.score,
    runtimeScore: runtime.score,
    penalty: affinity.penalty,
    totalScore,
    isVetoed: affinity.isVetoed,
  };

  const positiveFactors = [...affinity.positiveReasons, ...ctx.reasons];
  if (quality >= 85) {
    positiveFactors.push(`Critical favorite (${item.rottenTomatoes}% Rotten Tomatoes • ${item.imdbScore} IMDb)`);
  }
  if (runtime.reason && runtime.score >= 80) {
    positiveFactors.push(runtime.reason);
  }

  const negativeFactors = [...affinity.negativeReasons];
  if (runtime.score < 70 && runtime.reason) {
    negativeFactors.push(runtime.reason);
  }

  // Generate top summary reason based on active participants
  const activeVoters = (participants || []).filter((p) => p.hasVoted !== false);
  const displayVoters = activeVoters.length > 0 ? activeVoters : participants;

  let summaryReason = '';
  if (affinity.isVetoed) {
    summaryReason = 'Conflicting preferences among viewers';
  } else if (totalScore >= 88) {
    summaryReason = `Unanimous Top Match for ${displayVoters.map((p) => p.name).join(' & ')}`;
  } else if (totalScore >= 75) {
    summaryReason = `Strong High-Rating Choice (${item.mood})`;
  } else {
    summaryReason = `Alternative Option (${item.streamingPlatform})`;
  }

  return {
    item: {
      ...item,
      runtimeMinutes,
    },
    breakdown,
    matchPercentage: totalScore,
    rank: 1, // Set during rankCandidates
    positiveFactors,
    negativeFactors,
    summaryReason,
  };
}

/**
 * Evaluates and ranks an array of MediaItems with deterministic tie-breaking.
 */
export function rankCandidates(
  items: MediaItem[],
  participants: VotingParticipant[],
  context: ViewingContext,
): CandidateEvaluation[] {
  if (!items || items.length === 0) return [];

  const evaluated = items.map((item) => evaluateCandidate(item, participants, context));

  // Deterministic Sorting:
  // 1. Total score descending
  // 2. Affinity score descending
  // 3. Quality score descending
  // 4. Title alphabetical ascending
  evaluated.sort((a, b) => {
    if (b.breakdown.totalScore !== a.breakdown.totalScore) {
      return b.breakdown.totalScore - a.breakdown.totalScore;
    }
    if (b.breakdown.affinityScore !== a.breakdown.affinityScore) {
      return b.breakdown.affinityScore - a.breakdown.affinityScore;
    }
    if (b.breakdown.qualityScore !== a.breakdown.qualityScore) {
      return b.breakdown.qualityScore - a.breakdown.qualityScore;
    }
    const titleA = a.item?.title || '';
    const titleB = b.item?.title || '';
    return titleA.localeCompare(titleB);
  });

  // Assign ranks
  return evaluated.map((cand, index) => ({
    ...cand,
    rank: index + 1,
  }));
}

/**
 * Generates the final consensus recommendation result from shortlisted items.
 */
export function generateConsensusRecommendation(
  candidates: MediaItem[],
  participants: VotingParticipant[],
  context: ViewingContext,
): RecommendationResult | null {
  if (!candidates || candidates.length === 0) return null;

  const ranked = rankCandidates(candidates, participants, context);
  const winner = ranked[0];

  const contextSummary = `${context.timeOfDay.toUpperCase()} • ${context.weatherCondition} • ${context.temperature}°`;

  return {
    winner,
    shortlistRankings: ranked,
    evaluatedCandidatesCount: candidates.length,
    generatedAt: new Date().toISOString(),
    contextSummary,
  };
}
