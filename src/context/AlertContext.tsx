import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DoorbellAlert } from '../types';

interface AlertContextType {
  activeAlert: DoorbellAlert | null;
  triggerDoorbellEvent: (alert?: Partial<DoorbellAlert>) => void;
  dismissAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeAlert, setActiveAlert] = useState<DoorbellAlert | null>(null);

  const triggerDoorbellEvent = (customAlert?: Partial<DoorbellAlert>) => {
    const alert: DoorbellAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cameraName: 'Front Porch Camera',
      eventDescription: 'Person detected at front door',
      snapshotUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      visitorType: 'guest',
      ...customAlert,
    };
    setActiveAlert(alert);
  };

  const dismissAlert = () => {
    setActiveAlert(null);
  };

  return (
    <AlertContext.Provider value={{ activeAlert, triggerDoorbellEvent, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
