import React from 'react';
import { StatusBar } from 'react-native';
import { enableScreens, enableFreeze } from '@amazon-devices/react-native-screens';
import { NavigationContainer } from '@amazon-devices/react-navigation__native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './AppProvider';
import { RootNavigator } from './RootNavigator';

// TV performance optimization mandatory on Vega OS
enableScreens();
enableFreeze();

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar hidden={true} />
      <AppProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;
