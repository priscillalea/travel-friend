import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CURRENCY_SYMBOLS, CurrencyCode } from '../domain/money';
import { colors, radii, spacing, typography } from '../theme';

export interface CurrencyPairProps {
  sourceCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  onInvert: () => void;
}

/**
 * Seletor CurrencyPair ("Tenho" / Etiqueta e "Quero ver em") com botão de inverter (Seção 4.1).
 */
export function CurrencyPair({ sourceCurrency, targetCurrency, onInvert }: CurrencyPairProps) {
  return (
    <View style={styles.container} testID="currency-pair">
      <View style={styles.currencyBox}>
        <Text style={styles.caption}>Etiqueta em</Text>
        <Text style={styles.code}>
          {sourceCurrency} ({CURRENCY_SYMBOLS[sourceCurrency]})
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Inverter moedas"
        onPress={onInvert}
        style={styles.invertButton}
        testID="invert-currencies-button"
      >
        <Text style={styles.invertIcon}>⇄</Text>
        <Text style={styles.invertText}>Inverter</Text>
      </Pressable>

      <View style={[styles.currencyBox, styles.currencyBoxRight]}>
        <Text style={styles.caption}>Quero ver em</Text>
        <Text style={styles.code}>
          {targetCurrency} ({CURRENCY_SYMBOLS[targetCurrency]})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.card,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencyBox: {
    flex: 1,
    gap: 2,
  },
  currencyBoxRight: {
    alignItems: 'flex-end',
  },
  caption: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  code: {
    ...typography.cardSubtitle,
    color: colors.text.primary,
  },
  invertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  invertIcon: {
    ...typography.labelStrong,
    color: colors.brand.primary,
  },
  invertText: {
    ...typography.labelStrong,
    color: colors.brand.primary,
  },
});
