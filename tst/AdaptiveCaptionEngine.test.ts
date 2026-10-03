/**
 * AdaptiveCaptionEngine.test.ts
 *
 * Verifies adaptive caption personalization:
 *  - Preference profile creation and updates
 *  - Real-time adaptations triggered by user actions (pause, rewind)
 *  - Contextual adaptations (ambient light, genre, time of day)
 *  - Caption segment timing calculations
 *  - Household bulk configuration generation
 *  - Audit logging of adaptation events
 */

import {
  AdaptiveCaptionEngine,
  CaptionPreferenceProfile,
  CaptionRenderConfig,
} from '../src/engine/AdaptiveCaptionEngine';
import { VotingParticipant, ViewingContext } from '../src/types';

describe('AdaptiveCaptionEngine', () => {
  let engine: AdaptiveCaptionEngine;

  const mockParticipant: VotingParticipant = {
    id: 'p1',
    name: 'Ronak',
    avatarColor: '#00E5FF',
    hasVoted: true,
    preferredGenres: ['sci-fi'],
    preferredMoods: ['Blockbuster'],
    dislikedGenres: [],
  };

  const defaultContext: ViewingContext = {
    timeOfDay: 'evening',
    ambientLight: 'dim',
    weatherCondition: 'Clear',
    temperature: 72,
    temperatureF: 72,
    groupEnergy: 'medium',
  };

  beforeEach(() => {
    engine = new AdaptiveCaptionEngine();
  });

  describe('Profile Management', () => {
    it('creates a default profile for a new participant', () => {
      const profile = engine.getOrCreateProfile(mockParticipant);
      expect(profile.viewerId).toBe('p1');
      expect(profile.fontSizePx).toBe(28);
      expect(profile.readingSpeedWpm).toBe(150);
      expect(profile.language).toBe('en');
      expect(profile.style).toBe('shadow');
      expect(engine.getProfileCount()).toBe(1);
    });

    it('updates specific profile preferences and emits an adaptation event', () => {
      engine.getOrCreateProfile(mockParticipant);
      const updated = engine.updateProfile('p1', {
        fontSizePx: 36,
        style: 'bold',
        language: 'hi',
      });

      expect(updated.fontSizePx).toBe(36);
      expect(updated.style).toBe('bold');
      expect(updated.language).toBe('hi');

      const log = engine.getAdaptationLog('p1');
      expect(log.length).toBeGreaterThan(0);
      expect(log.some(e => e.field === 'fontSizePx' && e.newValue === 36)).toBe(true);
    });

    it('creates profile with defaults when updating a non-existent profile', () => {
      const profile = engine.updateProfile('viewer_new', { fontSizePx: 32 });
      expect(profile.viewerId).toBe('viewer_new');
      expect(profile.fontSizePx).toBe(32);
      expect(engine.getProfile('viewer_new')).toBeDefined();
    });
  });

  describe('Interaction-driven Adaptations (Pause & Rewind)', () => {
    it('increases font size upon hitting pause threshold (every 5 pauses)', () => {
      engine.getOrCreateProfile(mockParticipant);
      const initial = engine.getProfile('p1')?.fontSizePx ?? 28;

      let lastEvent = null;
      for (let i = 0; i < 5; i++) {
        lastEvent = engine.recordPause('p1');
      }

      expect(lastEvent).not.toBeNull();
      expect(lastEvent?.newValue).toBe(initial + 2);
      expect(engine.getProfile('p1')?.fontSizePx).toBe(initial + 2);
      expect(engine.getProfile('p1')?.pauseCount).toBe(5);

      // Multiple pauses should not exceed MAX_FONT (52)
      for (let i = 0; i < 150; i++) {
        engine.recordPause('p1');
      }
      expect(engine.getProfile('p1')?.fontSizePx).toBeLessThanOrEqual(52);
    });

    it('decreases reading speed (wpm) upon hitting rewind threshold (every 3 rewinds)', () => {
      engine.getOrCreateProfile(mockParticipant);
      const initialWpm = engine.getProfile('p1')?.readingSpeedWpm ?? 150;

      let lastEvent = null;
      for (let i = 0; i < 3; i++) {
        lastEvent = engine.recordRewind('p1');
      }

      expect(lastEvent).not.toBeNull();
      expect(lastEvent?.newValue).toBe(initialWpm - 10);
      expect(engine.getProfile('p1')?.readingSpeedWpm).toBe(initialWpm - 10);
      expect(engine.getProfile('p1')?.rewindCount).toBe(3);

      // Multiple rewinds should not fall below MIN_WPM (80)
      for (let i = 0; i < 150; i++) {
        engine.recordRewind('p1');
      }
      expect(engine.getProfile('p1')?.readingSpeedWpm).toBeGreaterThanOrEqual(80);
    });

    it('records ambient light changes and adapts opacity', () => {
      engine.getOrCreateProfile(mockParticipant);
      const event = engine.recordAmbientLightChange('p1', 'bright');
      expect(event).not.toBeNull();
      expect(event?.newValue).toBe(0.9);
      expect(engine.getProfile('p1')?.backgroundOpacity).toBe(0.9);
    });
  });

  describe('Contextual Render Config Adaptation', () => {
    it('positions captions at the top for action or sports genres to avoid HUD clutter', () => {
      engine.getOrCreateProfile(mockParticipant);
      const actionConfig = engine.getRenderConfig('p1', defaultContext, 'action');
      expect(actionConfig.overlayPosition).toBe('top');

      const dramaConfig = engine.getRenderConfig('p1', defaultContext, 'drama');
      expect(dramaConfig.overlayPosition).toBe('bottom');
    });

    it('adapts font size up at night for easier relaxed viewing', () => {
      engine.getOrCreateProfile(mockParticipant);
      const nightContext: ViewingContext = {
        ...defaultContext,
        timeOfDay: 'night',
      };

      const normalConfig = engine.getRenderConfig('p1', defaultContext);
      const nightConfig = engine.getRenderConfig('p1', nightContext);
      expect(nightConfig.adaptedFontSizePx).toBe(normalConfig.adaptedFontSizePx + 2);
    });

    it('increases opacity during stormy weather', () => {
      engine.getOrCreateProfile(mockParticipant);
      const stormyContext: ViewingContext = {
        ...defaultContext,
        weatherCondition: 'Thunderstorm',
      };

      const normalConfig = engine.getRenderConfig('p1', defaultContext);
      const stormConfig = engine.getRenderConfig('p1', stormyContext);
      expect(stormConfig.adaptedOpacity).toBeGreaterThan(normalConfig.adaptedOpacity);
    });
  });

  describe('Synchronized Segment Generation', () => {
    it('generates timed segments with reasonable durations based on reading speed', () => {
      engine.getOrCreateProfile(mockParticipant);
      const lines = [
        'Welcome back to Aura Vega TV.',
        'Tonight we have an extraordinary selection of movies for you.',
        'Enjoy the show!',
      ];

      const segments = engine.generateSegments(lines, 1000, 'p1');
      expect(segments).toHaveLength(3);
      expect(segments[0].startMs).toBe(1000);
      expect(segments[0].endMs).toBeGreaterThan(segments[0].startMs);
      expect(segments[1].startMs).toBeGreaterThan(segments[0].endMs);
      expect(segments[0].text).toBe(lines[0]);
    });
  });

  describe('Household Bulk Rendering', () => {
    it('generates configs for all active participants in the household', () => {
      const p2: VotingParticipant = {
        id: 'p2',
        name: 'Sarah',
        avatarColor: '#FF0055',
        hasVoted: true,
        preferredGenres: ['comedy'],
        preferredMoods: ['Lighthearted'],
        dislikedGenres: [],
      };

      const configs = engine.getHouseholdRenderConfigs([mockParticipant, p2], defaultContext);
      expect(configs).toHaveLength(2);
      expect(configs.map(c => c.viewerId)).toEqual(['p1', 'p2']);
    });
  });
});
