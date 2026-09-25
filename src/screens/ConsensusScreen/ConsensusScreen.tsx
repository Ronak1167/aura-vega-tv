import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useConsensus } from '../../context/ConsensusContext';
import { MediaItem } from '../../types';
import { MediaDeck } from './MediaDeck';
import { DetailModal } from './DetailModal';
import { WinnerModal } from './WinnerModal';
import { FocusableCard } from '../../components/FocusableCard';
import { colors, spacing, tvSafeLayout } from '../../styles/tokens';

interface ConsensusScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export const ConsensusScreen: React.FC<ConsensusScreenProps> = ({ navigation }) => {
  const { state, items, shortlist, skip, setMood, setWinner, reset } = useConsensus();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const moods = ['All', 'Sci-Fi', 'Blockbuster', 'Drama', 'Comedy', 'Oscar Winner'];

  const filteredItems = state.activeMood === 'All'
    ? items
    : items.filter(
        (i) => i.tags.includes(state.activeMood) || i.mood.includes(state.activeMood)
      );

  const handleSelectItem = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.safeZone}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.screenTitle}>COUCH CONSENSUS</Text>
              <View style={styles.liveSessionBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveSessionText}>2 Voters Active</Text>
              </View>
            </View>
            <Text style={styles.screenSubtitle}>
              Vote together on tonight's film without the endless scroll fatigue
            </Text>
          </View>

          {/* Header Action: Return to Ambient Hub */}
          <FocusableCard
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accentColor={colors.accentCyan}
          >
            <Text style={styles.backBtnText}>← Return to Hub (BACK)</Text>
          </FocusableCard>
        </View>

        {/* Mood Pills Selector */}
        <View style={styles.moodRow}>
          {moods.map((m) => {
            const isActive = state.activeMood === m;
            return (
              <FocusableCard
                key={m}
                onPress={() => setMood(m)}
                style={[
                  styles.moodPill,
                  isActive && styles.moodPillActive,
                ]}
                accentColor={colors.accentCyan}
              >
                <Text
                  style={[
                    styles.moodPillText,
                    isActive && styles.moodPillTextActive,
                  ]}
                >
                  {m}
                </Text>
              </FocusableCard>
            );
          })}
        </View>

        {/* Co-Viewing Progress Tally */}
        <View style={styles.tallyBar}>
          <Text style={styles.tallyText}>
            Shortlisted: <Text style={styles.tallyHighlight}>{state.shortlist.length}</Text> / 3 for Consensus
          </Text>
          <Text style={styles.tallyDivider}>|</Text>
          <Text style={styles.tallyText}>
            Passed: <Text style={styles.tallyMuted}>{state.skipped.length}</Text>
          </Text>
          {state.shortlist.length > 0 && (
            <FocusableCard
              onPress={() => setWinner(state.shortlist[0])}
              style={styles.forceConsensusBtn}
              accentColor={colors.accentAmber}
            >
              <Text style={styles.forceConsensusText}>Declare Winner ({state.shortlist[0].title})</Text>
            </FocusableCard>
          )}
        </View>

        {/* Horizontal Media Deck */}
        <MediaDeck
          items={filteredItems}
          onSelectItem={handleSelectItem}
          onShortlist={shortlist}
          onSkip={skip}
        />

        {/* Modals */}
        <DetailModal
          item={selectedItem}
          visible={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onShortlist={shortlist}
          onSkip={skip}
        />

        <WinnerModal
          winner={state.winner}
          visible={state.isVotingComplete && !!state.winner}
          onWatchNow={(item: MediaItem) => {
            // Navigate to full-screen video player with the winning item
            navigation.navigate('VideoPlayer', { item });
          }}
          onReset={reset}
        />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.5,
    marginRight: spacing.md,
  },
  liveSessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentCyan,
    marginRight: 6,
  },
  liveSessionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentCyan,
  },
  screenSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moodRow: {
    flexDirection: 'row',
    marginVertical: spacing.md,
  },
  moodPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  moodPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: colors.accentCyan,
    borderWidth: 1,
  },
  moodPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  moodPillTextActive: {
    color: colors.accentCyan,
    fontWeight: '700',
  },
  tallyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(20, 26, 41, 0.6)',
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  tallyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tallyHighlight: {
    fontWeight: '700',
    color: colors.statusLive,
  },
  tallyMuted: {
    fontWeight: '700',
    color: colors.statusAlert,
  },
  tallyDivider: {
    color: colors.glassBorder,
    marginHorizontal: spacing.md,
  },
  forceConsensusBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 153, 0, 0.2)',
    borderColor: colors.accentAmber,
    borderWidth: 1,
  },
  forceConsensusText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentAmber,
  },
});
