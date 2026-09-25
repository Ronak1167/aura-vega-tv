import { getAmbientTheme } from '../src/utils/time-of-day';

describe('time-of-day - Ambient Living Room Theme Engine', () => {
  it('should return dawn theme for morning hours (6 AM)', () => {
    const morningDate = new Date(2026, 8, 25, 6, 30, 0);
    const theme = getAmbientTheme(morningDate);

    expect(theme.period).toBe('dawn');
    expect(theme.greeting).toBe('Good Morning');
    expect(theme.gradientColors).toHaveLength(3);
    expect(theme.particleSpeed).toBeGreaterThan(0);
  });

  it('should return day theme for afternoon hours (12 PM)', () => {
    const middayDate = new Date(2026, 8, 25, 12, 0, 0);
    const theme = getAmbientTheme(middayDate);

    expect(theme.period).toBe('day');
    expect(theme.greeting).toBe('Good Afternoon');
  });

  it('should return golden_hour theme for early evening (6 PM)', () => {
    const eveningDate = new Date(2026, 8, 25, 18, 15, 0);
    const theme = getAmbientTheme(eveningDate);

    expect(theme.period).toBe('golden_hour');
    expect(theme.greeting).toBe('Good Evening');
  });

  it('should return night theme for late night (10 PM)', () => {
    const nightDate = new Date(2026, 8, 25, 22, 0, 0);
    const theme = getAmbientTheme(nightDate);

    expect(theme.period).toBe('night');
    expect(theme.greeting).toBe('Good Night');
  });
});
