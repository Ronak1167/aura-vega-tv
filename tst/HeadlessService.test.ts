import {
  ContentPersonalizationHeadlessService,
  onStartService,
  onStopService,
} from '../src/headless/ContentPersonalizationHeadlessService';

describe('Vega Headless Service Lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    onStopService();
  });

  it('should maintain a singleton instance', () => {
    const instance1 = ContentPersonalizationHeadlessService.getInstance();
    const instance2 = ContentPersonalizationHeadlessService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should start and run periodic sync without errors', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    onStartService();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[HeadlessService] Starting background content synchronization'),
    );

    // Fast-forward 60s timer
    jest.advanceTimersByTime(60000);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[HeadlessService] Synced personalized media recommendations'),
    );

    const service = ContentPersonalizationHeadlessService.getInstance();
    expect(service.getCachedRecommendations().length).toBeGreaterThan(0);
    expect(service.getLastSyncTimestamp()).not.toBeNull();

    onStopService();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[HeadlessService] Stopped background content synchronization'),
    );

    consoleSpy.mockRestore();
  });
});
