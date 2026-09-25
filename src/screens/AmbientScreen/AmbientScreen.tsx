import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlanceBar } from './GlanceBar';
import { AmbientCanvas } from './AmbientCanvas';
import { DoorbellPip } from './DoorbellPip';
import { FocusGuide } from '../../components/FocusGuide';
import { colors, tvSafeLayout } from '../../styles/tokens';

interface AmbientScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

export const AmbientScreen: React.FC<AmbientScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* 10-foot Safe Zone Container */}
      <View style={styles.safeZone}>
        <FocusGuide>
          <GlanceBar
            onEnterConsensus={() => navigation.navigate('Consensus')}
            onOpenSettings={() => navigation.navigate('Settings')}
          />
        </FocusGuide>

        <AmbientCanvas />

        {/* Smart doorbell overlay */}
        <DoorbellPip />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safeZone: {
    flex: 1,
    paddingHorizontal: tvSafeLayout.overscanHorizontal,
    paddingVertical: tvSafeLayout.overscanVertical,
  },
});
