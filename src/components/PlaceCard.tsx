import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/money';
import { CheapFoodOption } from '../domain/places';
import { colors, layout, radii, spacing, typography } from '../theme';

export interface PlaceCardProps {
  option: CheapFoodOption;
  isSelected?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}

/**
 * Cartão de opção de lugar no Mapa de Comida Barata (Seção 4.2):
 * Preço original e convertido, tempo a pé, confirmações e selo de economia (verde poupanca).
 */
export function PlaceCard({ option, isSelected = false, onPress, isLast = false }: PlaceCardProps) {
  const { place, pricePoint, walkMinutes, convertedPrice, savingsOriginal, isBestValue } = option;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !isLast && styles.dashedBorder, isSelected && styles.rowSelected]}
      testID={`place-card-${place.id}`}
    >
      <View style={styles.leftColumn}>
        <View style={styles.titleRow}>
          <Text style={styles.placeName}>{place.name}</Text>
          {isBestValue ? (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>Melhor opção</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.itemName}>{pricePoint.itemName}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {walkMinutes} min a pé · {pricePoint.confirmations} confirmações
          </Text>
          {savingsOriginal ? (
            <Text style={styles.savingsText}>
              Economiza {formatMoney(savingsOriginal, 'pt-BR')}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.originalPrice}>{formatMoney(pricePoint.price, 'pt-BR')}</Text>
        <Text style={styles.convertedPrice}>{formatMoney(convertedPrice, 'pt-BR')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.tabIcon,
  },
  rowSelected: {
    backgroundColor: colors.background.screen,
  },
  dashedBorder: {
    borderBottomWidth: layout.dashedBorderWidth,
    borderColor: colors.border.dashed,
    borderStyle: 'dashed',
  },
  leftColumn: {
    flex: 1,
    gap: 3,
    paddingRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  placeName: {
    ...typography.cardSubtitle,
    color: colors.text.primary,
  },
  bestBadge: {
    backgroundColor: colors.brand.savings,
    borderRadius: radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bestBadgeText: {
    ...typography.labelSmall,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  itemName: {
    ...typography.label,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  savingsText: {
    ...typography.labelSmall,
    fontWeight: '700',
    color: colors.text.savings,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  originalPrice: {
    ...typography.moneyRow,
    color: colors.text.primary,
  },
  convertedPrice: {
    ...typography.labelStrong,
    color: colors.text.secondary,
  },
});
