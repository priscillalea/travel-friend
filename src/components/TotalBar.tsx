import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney, Money } from '../domain/money';
import { colors, radii, spacing, typography } from '../theme';

export interface TotalBarProps {
  totalConverted: Money;
  totalOriginal: Money;
  totalItemsCount: number;
}

/**
 * TotalBar fixa acima da tab bar (Seção 4.1):
 * Fundo amarelo (sol #FFC93C), total convertido grande e total original.
 */
export function TotalBar({ totalConverted, totalOriginal, totalItemsCount }: TotalBarProps) {
  return (
    <View style={styles.container} testID="total-bar">
      <View style={styles.leftColumn}>
        <Text style={styles.label}>Total da lista ({totalItemsCount} itens)</Text>
        <Text style={styles.originalTotal}>Original: {formatMoney(totalOriginal, 'pt-BR')}</Text>
      </View>
      <Text style={styles.convertedTotal} testID="total-converted-value">
        {formatMoney(totalConverted, 'pt-BR')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftColumn: {
    gap: 2,
  },
  label: {
    ...typography.labelStrong,
    color: colors.action.primaryText,
  },
  originalTotal: {
    ...typography.label,
    color: colors.action.primaryText,
  },
  convertedTotal: {
    ...typography.valueMedium,
    color: colors.action.primaryText,
  },
});
