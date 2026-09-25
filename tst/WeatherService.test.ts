import { weatherService } from '../src/services/WeatherService';

describe('WeatherService Telemetry', () => {
  it('should fetch initial weather telemetry', async () => {
    const weather = await weatherService.fetchCurrentWeather();
    expect(weather).toBeDefined();
    expect(weather.location).toBe('Seattle, WA');
    expect(typeof weather.temperature).toBe('number');
    expect(weather.temperature).toBeGreaterThan(0);
    expect(weather.condition).toBe('Partly Cloudy');
    expect(weather.airQualityIndex).toBe(28);
  });

  it('should update simulated weather telemetry properly', () => {
    const updated = weatherService.updateSimulatedWeather({
      temperature: 68,
      condition: 'Clear Night',
      conditionCode: 'clear_night',
    });

    expect(updated.temperature).toBe(68);
    expect(updated.condition).toBe('Clear Night');
    expect(updated.conditionCode).toBe('clear_night');
    expect(updated.location).toBe('Seattle, WA'); // preserved
  });
});
