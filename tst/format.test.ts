import { formatTime, formatDate, formatTemp } from '../src/utils/format';

describe('format - Living Room Presentation Formatters', () => {
  it('should format 12-hour time correctly with AM/PM', () => {
    const morning = new Date(2026, 8, 25, 9, 5, 0);
    const timeMorning = formatTime(morning);
    expect(timeMorning.time).toBe('9:05');
    expect(timeMorning.period).toBe('AM');

    const evening = new Date(2026, 8, 25, 21, 45, 0);
    const timeEvening = formatTime(evening);
    expect(timeEvening.time).toBe('9:45');
    expect(timeEvening.period).toBe('PM');
  });

  it('should format date strings properly', () => {
    const fixedDate = new Date(2026, 8, 25, 12, 0, 0); // Friday, Sept 25, 2026
    const formatted = formatDate(fixedDate);
    expect(formatted).toContain('September 25');
  });

  it('should format temperatures in Fahrenheit and Celsius', () => {
    expect(formatTemp(72, 'F')).toBe('72°F');
    expect(formatTemp(68, 'C')).toBe('20°C');
  });
});
