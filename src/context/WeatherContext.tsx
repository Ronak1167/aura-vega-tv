import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WeatherTelemetry } from '../types';
import { weatherService } from '../services/WeatherService';

interface WeatherContextType {
  weather: WeatherTelemetry;
  unit: 'F' | 'C';
  toggleUnit: () => void;
  refresh: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherTelemetry>({
    temperature: 72,
    condition: 'Partly Cloudy',
    conditionCode: 'partly_cloudy',
    high: 78,
    low: 64,
    humidity: 45,
    airQualityIndex: 28,
    location: 'Seattle, WA',
    lastUpdated: new Date().toISOString(),
  });
  const [unit, setUnit] = useState<'F' | 'C'>('F');

  const refresh = async () => {
    const updated = await weatherService.fetchCurrentWeather();
    setWeather(updated);
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'F' ? 'C' : 'F'));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, unit, toggleUnit, refresh }}>
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather(): WeatherContextType {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
