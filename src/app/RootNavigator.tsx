import React from 'react';
import { createStackNavigator } from '@amazon-devices/react-navigation__stack';
import { AmbientScreen } from '../screens/AmbientScreen/AmbientScreen';
import { ConsensusScreen } from '../screens/ConsensusScreen/ConsensusScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen/VideoPlayerScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Ambient"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0B0E17' },
      }}
    >
      <Stack.Screen name="Ambient" component={AmbientScreen} />
      <Stack.Screen name="Consensus" component={ConsensusScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    </Stack.Navigator>
  );
};
