import { WeatherTelemetry } from '../types';

/**
 * Service for managing weather and environmental telemetry.
 */
class WeatherService {
  private currentWeather: WeatherTelemetry = {
    temperature: 72,
    condition: 'Partly Cloudy',
    conditionCode: 'partly_cloudy',
    high: 78,
    low: 64,
    humidity: 45,
    airQualityIndex: 28,
    location: 'Seattle, WA',
    lastUpdated: new Date().toISOString(),
  };

  public async fetchCurrentWeather(): Promise<WeatherTelemetry> {
    // In production, fetch from OpenWeather or Fire TV local telemetry
    this.currentWeather.lastUpdated = new Date().toISOString();
    return { ...this.currentWeather };
  }

  public updateSimulatedWeather(updates: Partial<WeatherTelemetry>): WeatherTelemetry {
    this.currentWeather = {
      ...this.currentWeather,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    return { ...this.currentWeather };
  }
}

export const weatherService = new WeatherService();
