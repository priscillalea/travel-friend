import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BudgetCategorySummary, formatWholeCurrency } from '../domain/budget';
import { colors, radii, spacing, typography } from '../theme';
import { BudgetBar } from './BudgetBar';

export interface CategoryCardProps {
  item: BudgetCategorySummary;
  onPress?: () => void;
}

const BAR_COLOR_MAP: Record<BudgetCategorySummary['barColorToken'], string> = {
  poupanca: colors.brand.savings,
  sol: colors.brand.accent,
  mar: colors.brand.primary,
  ceu: '#5D93B3',
};

/**
 * Cartão de categoria de orçamento (Seção 3 — CategoryCard / trocado_v2_1_orcamento.png & trocado_v3_4_orcamento.png).
 */
export function CategoryCard({ item, onPress }: CategoryCardProps) {
  const fillColor = BAR_COLOR_MAP[item.barColorToken];

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={styles.card}
      testID={`category-card-${item.category}`}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.amount}>{formatWholeCurrency(item.amount)}</Text>
      </View>

      <BudgetBar
        progressRatio={item.progressRatio}
        fillColor={fillColor}
        trackColor={colors.background.screen}
        height={8}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 10,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.cardSubtitle,
    color: colors.text.primary,
  },
  amount: {
    ...typography.moneyRow,
    color: colors.text.primary,
  },
});
