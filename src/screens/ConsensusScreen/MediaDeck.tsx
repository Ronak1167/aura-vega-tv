/**
 * MediaDeck.tsx  — Sprint 2 Rewrite (Carousel v2 API)
 *
 * Replaces the original ScrollView/FlatList with the official Vega Carousel
 * from @amazon-devices/vega-carousel (v2 API).
 *
 * API reference: vega_carousel_v2_api.md
 *
 * v2 uses a `dataAdapter` interface instead of `data`/`renderItem`/`keyProvider`:
 *   dataAdapter.getItem(index)       → ItemT | undefined
 *   dataAdapter.getItemCount()       → number
 *   dataAdapter.getItemKey(info)     → string | undefined
 *   dataAdapter.notifyDataError(err) → boolean
 *
 * renderItem still receives CarouselRenderInfo { item, index }
 */
import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Carousel,
  CarouselItemDataAdapter,
  CarouselRenderInfo,
} from '@amazon-devices/vega-carousel';
import { MediaItem } from '../../types';
import { MediaCard } from './MediaCard';

// ─────────────────────────────────────────────────────────────────────────────
// Constants  (must match MediaCard's cardContainer dimensions)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_SPACING = 16; // itemPadding on each side

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface MediaDeckProps {
  items: MediaItem[];
  matchMap?: Record<string, number>;
  onSelectItem: (item: MediaItem) => void;
  onShortlist?: (item: MediaItem) => void;
  onSkip?: (item: MediaItem) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export const MediaDeck: React.FC<MediaDeckProps> = ({
  items,
  matchMap,
  onSelectItem,
  onShortlist,
  onSkip,
}) => {
  /**
   * dataAdapter — implements CarouselItemDataAdapter<MediaItem, string>
   * Must be stable (useMemo) so Carousel doesn't remount on every render.
   */
  const dataAdapter = useMemo<CarouselItemDataAdapter<MediaItem, string>>(
    () => ({
      getItem: (index: number) => items[index],
      getItemCount: () => items.length,
      getItemKey: ({ item }: CarouselRenderInfo<MediaItem>) => item.id,
      notifyDataError: () => false, // no retry — log and skip broken items
    }),
    [items],
  );

  /**
   * renderItem — receives CarouselRenderInfo<MediaItem> = { item, index }
   */
  const renderItem = useCallback(
    ({ item }: CarouselRenderInfo<MediaItem>) => (
      <MediaCard
        item={item}
        matchPercentage={matchMap ? matchMap[item.id] : undefined}
        onPress={() => onSelectItem(item)}
        onShortlist={() => onShortlist?.(item)}
        onSkip={() => onSkip?.(item)}
      />
    ),
    [onSelectItem, onShortlist, onSkip, matchMap],
  );

  return (
    <View style={styles.deckContainer}>
      <Carousel<MediaItem>
        dataAdapter={dataAdapter}
        renderItem={renderItem}
        orientation="horizontal"
        hasPreferredFocus
        renderedItemsCount={8}
        numOffsetItems={2}
        containerStyle={styles.carouselContainer}
        itemStyle={{
          itemPadding: CARD_SPACING,
          itemPaddingOnSelection: CARD_SPACING,
          selectedItemScaleFactor: 1.04,
          pressedItemScaleFactor: 0.97,
        }}
        animationDuration={{
          itemScrollDuration: 0.25,
          itemPressedDuration: 0.1,
          containerSelectionChangeDuration: 0.2,
        }}
        selectionStrategy="anchored"
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    marginVertical: 12,
  },
  carouselContainer: {
    paddingRight: 80,
  },
});
