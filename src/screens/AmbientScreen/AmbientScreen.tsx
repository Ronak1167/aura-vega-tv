import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GlanceBar } from './GlanceBar';
import { AmbientCanvas } from './AmbientCanvas';
import { DoorbellPip } from './DoorbellPip';
import { InsightTicker } from './InsightTicker';
import { HealthPanel } from './HealthPanel';
import { FocusGuide } from '../../components/FocusGuide';
import { colors, tvSafeLayout, spacing } from '../../styles/tokens';

interface AmbientScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

export const AmbientScreen: React.FC<AmbientScreenProps> = ({ navigation }) => {
  const [showHealthHud, setShowHealthHud] = useState(false);

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

        {/* Ambient Bottom Intelligence & Health Stack */}
        <View style={styles.bottomIntelligenceStack}>
          <FocusGuide>
            <InsightTicker
              onPressDetails={() => navigation.navigate('Consensus')}
            />
            <HealthPanel
              onToggleExpand={() => setShowHealthHud(prev => !prev)}
            />
          </FocusGuide>
        </View>

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
    justifyContent: 'space-between',
  },
  bottomIntelligenceStack: {
    position: 'absolute',
    bottom: tvSafeLayout.overscanVertical,
    left: tvSafeLayout.overscanHorizontal,
    right: tvSafeLayout.overscanHorizontal,
    zIndex: 10,
  },
});
