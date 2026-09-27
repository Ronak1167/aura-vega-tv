import React, { useState, useMemo } from 'react';
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
  const {
    state,
    items,
    rankedItems,
    shortlist,
    skip,
    setMood,
    setWinner,
    triggerConsensusNow,
    toggleParticipant,
    reset,
  } = useConsensus();

  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWinnerDismissed, setIsWinnerDismissed] = useState(false);

  const moods = ['All', 'Sci-Fi', 'Blockbuster', 'Drama', 'Comedy', 'Oscar Winner'];

  // Map of item ID -> match percentage
  const matchMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of rankedItems) {
      map[r.item.id] = r.matchPercentage;
    }
    return map;
  }, [rankedItems]);

  const filteredItems = useMemo(() => {
    if (state.activeMood === 'All') return items;
    const target = state.activeMood.toLowerCase();
    return items.filter((i) => {
      const itemMood = (i.mood || '').toLowerCase();
      const itemTags = (i.tags || []).map((t) => t.toLowerCase());
      return itemMood.includes(target) || itemTags.some((t) => t.includes(target));
    });
  }, [items, state.activeMood]);

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
                <Text style={styles.liveSessionText}>
                  {state.participants.filter((p) => p.hasVoted).length} Voters Active
                </Text>
              </View>
            </View>
            <Text style={styles.screenSubtitle}>
              Multi-viewer recommendation engine evaluated across preferences, critical acclaim, and context
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

        {/* Mood & Voters Row */}
        <View style={styles.filterSectionRow}>
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

          {/* Active Voter Badges */}
          <View style={styles.votersRow}>
            <Text style={styles.votersLabel}>VOTERS:</Text>
            {state.participants.map((p) => (
              <FocusableCard
                key={p.id}
                onPress={() => toggleParticipant(p.id)}
                style={[
                  styles.voterBadge,
                  !p.hasVoted && styles.voterBadgeInactive,
                ]}
                accentColor={p.avatarColor}
              >
                <View style={[styles.voterDot, { backgroundColor: p.avatarColor }]} />
                <Text style={styles.voterText}>{p.name}</Text>
              </FocusableCard>
            ))}
          </View>
        </View>

        {/* Co-Viewing Progress Tally & Action Bar */}
        <View style={styles.tallyBar}>
          <View style={styles.tallyCounts}>
            <Text style={styles.tallyText}>
              Shortlisted: <Text style={styles.tallyHighlight}>{state.shortlist.length}</Text> / 3 for Consensus
            </Text>
            <Text style={styles.tallyDivider}>|</Text>
            <Text style={styles.tallyText}>
              Passed: <Text style={styles.tallyMuted}>{state.skipped.length}</Text>
            </Text>
          </View>

          <View style={styles.consensusActions}>
            <FocusableCard
              onPress={() => {
                setIsWinnerDismissed(false);
                triggerConsensusNow();
              }}
              style={styles.triggerConsensusBtn}
              accentColor={colors.accentAmber}
            >
              <Text style={styles.triggerConsensusText}>⚡ Evaluate Consensus Now</Text>
            </FocusableCard>

            {state.shortlist.length > 0 && (
              <FocusableCard
                onPress={() => {
                  setIsWinnerDismissed(false);
                  setWinner(state.shortlist[0]);
                }}
                style={styles.forceConsensusBtn}
                accentColor={colors.accentCyan}
              >
                <Text style={styles.forceConsensusText}>
                  Top Pick: {state.shortlist[0].title}
                </Text>
              </FocusableCard>
            )}
          </View>
        </View>

        {/* Horizontal Media Deck with Match Percentage Badges */}
        <MediaDeck
          items={filteredItems}
          matchMap={matchMap}
          onSelectItem={handleSelectItem}
          onShortlist={shortlist}
          onSkip={skip}
        />

        {/* Modals */}
        <DetailModal
          item={selectedItem}
          visible={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onWatchNow={(item) => {
            setIsDetailOpen(false);
            navigation.navigate('VideoPlayer', { item });
          }}
          onShortlist={(item) => {
            shortlist(item);
            setIsDetailOpen(false);
          }}
          onSkip={(item) => {
            skip(item);
            setIsDetailOpen(false);
          }}
        />

        <WinnerModal
          winner={state.winner}
          recommendation={state.recommendation}
          visible={state.isVotingComplete && state.winner !== null && !isWinnerDismissed}
          onWatchNow={(item) => {
            navigation.navigate('VideoPlayer', { item });
          }}
          onReset={() => {
            setIsWinnerDismissed(false);
            reset();
          }}
          onDismiss={() => setIsWinnerDismissed(true)}
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
    marginBottom: spacing.md,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.2,
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
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: colors.accentCyan,
  },
  moodPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  moodPillTextActive: {
    color: colors.accentCyan,
    fontWeight: '800',
  },
  votersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  votersLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginRight: spacing.sm,
    letterSpacing: 0.5,
  },
  voterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: spacing.xs,
  },
  voterBadgeInactive: {
    opacity: 0.4,
  },
  voterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  voterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tallyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 20, 32, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.md,
  },
  tallyCounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tallyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tallyHighlight: {
    color: colors.accentCyan,
    fontWeight: '800',
  },
  tallyDivider: {
    color: colors.textMuted,
    marginHorizontal: 12,
  },
  tallyMuted: {
    color: colors.textMuted,
  },
  consensusActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerConsensusBtn: {
    backgroundColor: 'rgba(255, 153, 0, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentAmber,
    marginRight: spacing.sm,
  },
  triggerConsensusText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accentAmber,
  },
  forceConsensusBtn: {
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },
  forceConsensusText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accentCyan,
  },
});
