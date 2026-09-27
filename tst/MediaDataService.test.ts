import { mediaDataService } from '../src/services/MediaDataService';

describe('MediaDataService - Catalog & Content Personalization', () => {
  it('should load all curated catalog media items', () => {
    const all = mediaDataService.getAllMedia();
    expect(all.length).toBeGreaterThanOrEqual(6);
    expect(all[0]).toHaveProperty('title');
    expect(all[0]).toHaveProperty('backdropUrl');
  });

  it('should find media by exact ID', () => {
    const item = mediaDataService.getMediaById('media-interstellar');
    expect(item).toBeDefined();
    expect(item?.title).toContain('Interstellar');
  });

  it('should filter media items by mood and tags using substring match', () => {
    const scifi = mediaDataService.getMediaByMood('Sci-Fi');
    expect(scifi.length).toBeGreaterThan(0);
    scifi.forEach((item) => {
      const target = 'sci-fi';
      const matches =
        item.mood.toLowerCase().includes(target) ||
        item.tags.some((t) => t.toLowerCase().includes(target));
      expect(matches).toBe(true);
    });
  });

  it('should return available mood options', () => {
    const moods = mediaDataService.getAvailableMoods();
    expect(moods).toContain('All');
    expect(moods).toContain('Sci-Fi');
  });
});
