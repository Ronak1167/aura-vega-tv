/**
 * GenerativeMotionService.test.ts
 *
 * Test suite for GenerativeMotionService (Runway + Higgsfield integration).
 */

import { generativeMotion } from '../src/services/GenerativeMotionService';

describe('GenerativeMotionService', () => {
  it('should maintain a singleton instance and report configured health', () => {
    const health = generativeMotion.getHealthStatus();
    expect(health).toBeDefined();
    expect(health.runwayConfigured).toBe(true);
    expect(health.higgsfieldConfigured).toBe(true);
    expect(health.activeProviders).toContain('runway-gen4-turbo');
    expect(health.activeProviders).toContain('higgsfield-kling-video');
  });

  it('should generate an ambient dynamic motion loop according to time and weather', async () => {
    const job = await generativeMotion.getAmbientMotionLoop('evening', 'Rainy');
    expect(job).toBeDefined();
    expect(job.status).toBe('completed');
    expect(job.videoUrl).toBeTruthy();
    expect(job.durationSeconds).toBe(10);
  });

  it('should generate a film motion teaser loop for media candidates', async () => {
    const job = await generativeMotion.generateFilmTeaser(
      'media-interstellar',
      'Interstellar',
      'https://images.unsplash.com/test-backdrop.jpg',
      'Cosmic & Mind-Bending',
    );

    expect(job).toBeDefined();
    expect(job.provider).toBe('higgsfield');
    expect(job.type).toBe('film_teaser');
    expect(job.videoUrl).toBeTruthy();
  });
});
