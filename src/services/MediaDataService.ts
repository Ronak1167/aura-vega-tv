import mediaCatalog from '../data/media-catalog.json';
import { MediaItem } from '../types';

/**
 * Service for querying and retrieving media items for Couch Consensus.
 */
class MediaDataService {
  private catalog: MediaItem[] = mediaCatalog as MediaItem[];

  public getAllMedia(): MediaItem[] {
    return [...this.catalog];
  }

  public getMediaById(id: string): MediaItem | undefined {
    return this.catalog.find((item) => item.id === id);
  }

  public getMediaByMood(mood: string): MediaItem[] {
    if (!mood || mood === 'All') return this.getAllMedia();
    const target = mood.toLowerCase();
    return this.catalog.filter(
      (item) =>
        item.mood.toLowerCase().includes(target) ||
        item.tags.some((t) => t.toLowerCase().includes(target)),
    );
  }

  public getAvailableMoods(): string[] {
    return ['All', 'Sci-Fi', 'Blockbuster', 'Drama', 'Comedy', 'Oscar Winner'];
  }
}

export const mediaDataService = new MediaDataService();
