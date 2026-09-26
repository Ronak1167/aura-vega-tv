/**
 * VideoPlayerScreen.tsx
 *
 * Full-screen video playback using the official Vega W3C Media APIs:
 *   - @amazon-devices/react-native-w3cmedia  (KeplerVideoSurfaceView)
 *   - VideoPlayer from the headless sub-path (HTMLMediaElement-compatible class)
 *
 * Architecture: URL Mode (Option 1 per react_native_for_vega_media_player_architecture.md)
 *
 *   App renders KeplerVideoSurfaceView as a React component.
 *   The onSurfaceViewCreated callback fires with a native surfaceHandle.
 *   App:
 *     1. calls videoPlayer.initialize()
 *     2. calls videoPlayer.setSurfaceHandle(handle)
 *     3. sets videoPlayer.src
 *     4. calls videoPlayer.play()
 *
 *   On component unmount:
 *     1. calls videoPlayer.clearSurfaceHandle(handle)
 *     2. calls videoPlayer.deinitialize()
 *
 * IMPORTANT: VideoPlayer is a TS class, NOT a React component.
 * Import path: '@amazon-devices/react-native-w3cmedia/dist/headless'
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  BackHandler,
  SafeAreaView,
} from 'react-native';
import { KeplerVideoSurfaceView } from '@amazon-devices/react-native-w3cmedia';
// VideoPlayer lives in the headless sub-path — not the default export
import { VideoPlayer } from '@amazon-devices/react-native-w3cmedia/dist/headless';
import { CaptionOverlay } from '../../components/CaptionOverlay';
import { FocusableCard } from '../../components/FocusableCard';
import { colors } from '../../styles/tokens';
import { MediaItem } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface VideoPlayerScreenProps {
  route: {
    params: {
      item: MediaItem;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  const { item } = route.params;

  // VideoPlayer instance held in a ref — not in state (avoids re-renders)
  const videoRef = useRef<VideoPlayer | null>(null);
  const surfaceHandleRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Surface lifecycle ─────────────────────────────────────────────────────

  const onSurfaceViewCreated = useCallback(
    async (surfaceHandle: string) => {
      surfaceHandleRef.current = surfaceHandle;

      const player = new VideoPlayer();
      videoRef.current = player;

      try {
        await player.initialize();
        player.setSurfaceHandle(surfaceHandle);

        // Wire up W3C event listeners
        player.addEventListener('play', () => setIsPlaying(true));
        player.addEventListener('pause', () => setIsPlaying(false));
        player.addEventListener('ended', () => setIsPlaying(false));
        player.addEventListener('durationchange', () =>
          setDuration(player.duration),
        );
        player.addEventListener('timeupdate', () =>
          setCurrentTime(player.currentTime),
        );
        player.addEventListener('error', () =>
          setError('Playback error. Content unavailable.'),
        );

        // Use the trailerUrl if present; fall back to a known-good test stream
        const src =
          item.trailerUrl ??
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

        player.autoplay = false;
        player.src = src;
        await player.play();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Failed to start playback: ${msg}`);
      }
    },
    [item],
  );

  const onSurfaceViewDestroyed = useCallback(async (surfaceHandle: string) => {
    const player = videoRef.current;
    if (player) {
      try {
        player.clearSurfaceHandle(surfaceHandle);
        await player.deinitialize();
      } catch {
        // Ignore cleanup errors
      }
      videoRef.current = null;
    }
    surfaceHandleRef.current = null;
  }, []);

  // ── Playback controls ─────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    const player = videoRef.current;
    if (!player) { return; }
    if (player.paused) {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }, []);

  const handleSeekBack = useCallback(() => {
    const player = videoRef.current;
    if (!player) { return; }
    player.currentTime = Math.max(0, player.currentTime - 10);
  }, []);

  const handleSeekForward = useCallback(() => {
    const player = videoRef.current;
    if (!player) { return; }
    player.currentTime = Math.min(player.duration, player.currentTime + 10);
  }, []);

  const handleExit = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRetry = useCallback(async () => {
    setError(null);
    const player = videoRef.current;
    if (player && surfaceHandleRef.current) {
      try {
        const src =
          item.trailerUrl ??
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        player.src = src;
        await player.play();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Failed to restart playback: ${msg}`);
      }
    } else if (surfaceHandleRef.current) {
      await onSurfaceViewCreated(surfaceHandleRef.current);
    }
  }, [item, onSurfaceViewCreated]);

  // Back-button hardware handler
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });
    return () => sub.remove();
  }, [handleExit]);

  // ── Progress helpers ──────────────────────────────────────────────────────

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) { return '0:00'; }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressRatio =
    duration > 0 ? Math.min(1, currentTime / duration) : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Video surface — fills the screen */}
      <KeplerVideoSurfaceView
        style={StyleSheet.absoluteFill}
        onSurfaceViewCreated={onSurfaceViewCreated}
        onSurfaceViewDestroyed={onSurfaceViewDestroyed}
      />

      {/* Caption overlay — honours OS accessibility settings */}
      <CaptionOverlay currentCue={null} />

      {/* Error state */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Playback Interrupted</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <FocusableCard
              style={styles.retryBtn}
              onPress={handleRetry}
              accentColor={colors.accentCyan}
              hasTVPreferredFocus
            >
              <Text style={styles.retryBtnText}>🔄 Retry Playback</Text>
            </FocusableCard>
            <FocusableCard
              style={styles.exitBtnCard}
              onPress={handleExit}
              accentColor={colors.textSecondary}
            >
              <Text style={styles.exitBtnText}>← Return to Consensus</Text>
            </FocusableCard>
          </View>
        </View>
      )}

      {/* Control overlay — shown at bottom */}
      {!error && (
        <SafeAreaView style={styles.controlsContainer}>
          {/* Title bar */}
          <View style={styles.titleBar}>
            <FocusableCard style={styles.exitBtnCard} onPress={handleExit} accentColor={colors.accentCyan}>
              <Text style={styles.exitBtnText}>← Back</Text>
            </FocusableCard>
            <Text style={styles.titleText} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.controlRow}>
            <FocusableCard style={styles.controlCard} onPress={handleSeekBack} accentColor={colors.accentCyan}>
              <Text style={styles.controlIcon}>⏪ 10s</Text>
            </FocusableCard>

            <FocusableCard
              style={styles.playPauseCard}
              onPress={handlePlayPause}
              hasTVPreferredFocus
              accentColor={colors.accentAmber}
            >
              <Text style={styles.playPauseIcon}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </FocusableCard>

            <FocusableCard style={styles.controlCard} onPress={handleSeekForward} accentColor={colors.accentCyan}>
              <Text style={styles.controlIcon}>10s ⏩</Text>
            </FocusableCard>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressRatio * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 12, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    zIndex: 10,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 600,
  },
  errorActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: colors.accentCyan,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bgDeep,
  },
  exitBtnCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  exitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 60,
    paddingBottom: 40,
    paddingTop: 16,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  controlIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  playPauseCard: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playPauseIcon: {
    fontSize: 32,
    color: colors.bgDeep,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    minWidth: 48,
    textAlign: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentCyan,
    borderRadius: 2,
  },
});
