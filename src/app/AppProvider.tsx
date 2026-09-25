import React, { ReactNode } from 'react';
import { WeatherProvider } from '../context/WeatherContext';
import { AlertProvider } from '../context/AlertContext';
import { ConsensusProvider } from '../context/ConsensusContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <WeatherProvider>
      <AlertProvider>
        <ConsensusProvider>
          {children}
        </ConsensusProvider>
      </AlertProvider>
    </WeatherProvider>
  );
};
