/**
 * MediaCDNService.ts
 *
 * Media Content Delivery Network service for Aura Vega TV.
 *
 * Production architecture:
 *  - AWS CloudFront + S3 for HLS/DASH video delivery
 *  - Adaptive bitrate: 4K HDR → 1080p → 720p → 480p (bandwidth-based)
 *  - Pre-signed URL generation for secure playback
 *  - Dolby Atmos audio track management
 *  - Subtitle / closed-caption delivery
 *
 * Simulator: returns sample video URLs for harness testing
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type VideoQuality = '4K_HDR' | '1080p_HDR' | '1080p' | '720p' | '480p' | '360p';
export type AudioTrack = 'dolby_atmos' | 'dolby_digital' | 'stereo' | 'mono';
export type SubtitleLanguage = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'es' | 'fr' | 'ar';

export interface MediaStream {
  mediaId: string;
  quality: VideoQuality;
  url: string;
  manifestUrl: string;  // HLS .m3u8 manifest
  signedExpiry: string;
  audioTracks: AudioTrack[];
  subtitleLanguages: SubtitleLanguage[];
  drmScheme: 'widevine' | 'fairplay' | 'playready' | 'none';
  bitrateMbps: number;
}

export interface PlaybackSession {
  sessionId: string;
  mediaId: string;
  profileId: string;
  startedAt: string;
  currentPositionMs: number;
  quality: VideoQuality;
  bufferedMs: number;
  stallCount: number;
}

export interface ThumbnailSprite {
  mediaId: string;
  spriteUrl: string;
  interval: number; // seconds per thumbnail
  count: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Bitrate → Quality mapping
// ---------------------------------------------------------------------------
const QUALITY_PROFILES: Record<VideoQuality, { bitrateMbps: number; minBandwidthMbps: number }> = {
  '4K_HDR':     { bitrateMbps: 25,  minBandwidthMbps: 35  },
  '1080p_HDR':  { bitrateMbps: 12,  minBandwidthMbps: 18  },
  '1080p':      { bitrateMbps: 8,   minBandwidthMbps: 12  },
  '720p':       { bitrateMbps: 5,   minBandwidthMbps: 7   },
  '480p':       { bitrateMbps: 2.5, minBandwidthMbps: 4   },
  '360p':       { bitrateMbps: 1,   minBandwidthMbps: 1.5 },
};

// Sample HLS streams (open-source test content for simulator)
const SAMPLE_STREAMS: Record<string, string> = {
  default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'media-dune2': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'media-interstellar': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'media-blade-runner': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'media-oppenheimer': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'media-parasite': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'media-coda': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'media-arrival': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
};

// ---------------------------------------------------------------------------
// Main CDN Service
// ---------------------------------------------------------------------------
class MediaCDNService {
  private activeSessions: Map<string, PlaybackSession> = new Map();
  private readonly cdnBase = 'https://cdn.auravega.tv';
  private readonly signedKeyId = 'av-cf-key-2025';

  /**
   * Selects the best quality tier based on available bandwidth.
   */
  selectQuality(availableBandwidthMbps: number): VideoQuality {
    const qualities: VideoQuality[] = ['4K_HDR', '1080p_HDR', '1080p', '720p', '480p', '360p'];
    for (const q of qualities) {
      if (availableBandwidthMbps >= QUALITY_PROFILES[q].minBandwidthMbps) {
        return q;
      }
    }
    return '360p';
  }

  /**
   * Generates a signed stream URL for a given media item.
   * Production: CloudFront signed URL with 4-hour expiry.
   * Simulator: Returns sample open-source stream.
   */
  async getStream(
    mediaId: string,
    profileId: string,
    requestedQuality?: VideoQuality,
    bandwidthMbps = 50,
  ): Promise<MediaStream> {
    const quality = requestedQuality ?? this.selectQuality(bandwidthMbps);
    const profile = QUALITY_PROFILES[quality];
    const expiry = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    // Use sample stream for simulator, CDN URL for production
    const sampleUrl = SAMPLE_STREAMS[mediaId] ?? SAMPLE_STREAMS.default;
    const isProduction = process.env.NODE_ENV === 'production';
    const streamUrl = isProduction
      ? `${this.cdnBase}/stream/${mediaId}/${quality.toLowerCase()}/index.m3u8?kid=${this.signedKeyId}&exp=${Date.now() + 14400000}&sig=<hmac>`
      : sampleUrl;

    return {
      mediaId,
      quality,
      url: streamUrl,
      manifestUrl: streamUrl,
      signedExpiry: expiry,
      audioTracks: quality === '4K_HDR' || quality === '1080p_HDR'
        ? ['dolby_atmos', 'dolby_digital', 'stereo']
        : ['dolby_digital', 'stereo'],
      subtitleLanguages: ['en', 'hi', 'ta', 'te', 'es', 'fr'],
      drmScheme: isProduction ? 'widevine' : 'none',
      bitrateMbps: profile.bitrateMbps,
    };
  }

  /**
   * Starts a playback session and returns session ID.
   */
  startPlayback(mediaId: string, profileId: string, quality: VideoQuality): PlaybackSession {
    const session: PlaybackSession = {
      sessionId: `play_${Date.now()}`,
      mediaId,
      profileId,
      startedAt: new Date().toISOString(),
      currentPositionMs: 0,
      quality,
      bufferedMs: 0,
      stallCount: 0,
    };
    this.activeSessions.set(session.sessionId, session);
    return session;
  }

  /**
   * Updates playback position (called every 10 seconds by player).
   */
  updatePosition(sessionId: string, positionMs: number, bufferedMs: number): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.currentPositionMs = positionMs;
      session.bufferedMs = bufferedMs;
    }
  }

  /**
   * Returns thumbnail sprite metadata for scrubbing preview.
   */
  getThumbnailSprite(mediaId: string): ThumbnailSprite {
    return {
      mediaId,
      spriteUrl: `${this.cdnBase}/thumbs/${mediaId}/sprite.jpg`,
      interval: 10,
      count: 100,
      width: 160,
      height: 90,
    };
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  terminateSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  getQualityProfiles(): typeof QUALITY_PROFILES {
    return QUALITY_PROFILES;
  }
}

export const mediaCDN = new MediaCDNService();
