import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { MediaItem } from '../../types';
import { MediaCard } from './MediaCard';
import { FocusGuide } from '../../components/FocusGuide';

interface MediaDeckProps {
  items: MediaItem[];
  onSelectItem: (item: MediaItem) => void;
  onShortlist?: (item: MediaItem) => void;
  onSkip?: (item: MediaItem) => void;
}

export const MediaDeck: React.FC<MediaDeckProps> = ({
  items,
  onSelectItem,
  onShortlist,
  onSkip,
}) => {
  return (
    <FocusGuide style={styles.deckContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <MediaCard
            key={item.id}
            item={item}
            hasTVPreferredFocus={index === 0}
            onPress={() => onSelectItem(item)}
            onShortlist={() => onShortlist?.(item)}
            onSkip={() => onSkip?.(item)}
          />
        ))}
      </ScrollView>
    </FocusGuide>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingRight: 80,
  },
});
