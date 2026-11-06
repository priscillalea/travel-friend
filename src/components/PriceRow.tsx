import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ComputedListItem } from '../domain/lists';
import { formatMoney } from '../domain/money';
import { colors, layout, radii, spacing, typography } from '../theme';

export interface PriceRowProps {
  entry: ComputedListItem;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  isLast?: boolean;
}

/**
 * Linha de item da lista (Seção 4.1):
 * Nome, quantidade, preço original (em destaque) e convertido (abaixo),
 * separados pelo picote tracejado da marca.
 */
export function PriceRow({ entry, onIncrement, onDecrement, isLast = false }: PriceRowProps) {
  const { item, lineOriginal, lineConverted } = entry;

  return (
    <View style={[styles.row, !isLast && styles.dashedBorder]} testID={`price-row-${item.id}`}>
      <View style={styles.leftColumn}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.qtyRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Diminuir quantidade de ${item.name}`}
            onPress={() => onDecrement(item.id)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </Pressable>
          <Text style={styles.qtyLabel}>{item.quantity}x</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Aumentar quantidade de ${item.name}`}
            onPress={() => onIncrement(item.id)}
            style={styles.qtyButton}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.originalPrice}>{formatMoney(lineOriginal, 'pt-BR')}</Text>
        <Text style={styles.convertedPrice}>{formatMoney(lineConverted, 'pt-BR')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  dashedBorder: {
    borderBottomWidth: layout.dashedBorderWidth,
    borderColor: colors.border.dashed,
    borderStyle: 'dashed',
  },
  leftColumn: {
    flex: 1,
    gap: 6,
    paddingRight: spacing.sm,
  },
  itemName: {
    ...typography.cardSubtitle,
    color: colors.text.primary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  qtyButton: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.background.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    ...typography.labelStrong,
    color: colors.text.primary,
  },
  qtyLabel: {
    ...typography.labelStrong,
    color: colors.text.secondary,
    minWidth: 22,
    textAlign: 'center',
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
