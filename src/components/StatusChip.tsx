import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, typography } from '../theme';

export type StatusChipVariant = 'confirmed' | 'pending';

export interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  style?: ViewStyle;
}

/**
 * StatusChip (Seção 3 — confirmado, reservado, pendente, cartão, voucher).
 */
export function StatusChip({ label, variant = 'confirmed', style }: StatusChipProps) {
  const isConfirmed = variant === 'confirmed';

  return (
    <View style={[styles.chip, isConfirmed ? styles.chipConfirmed : styles.chipPending, style]}>
      <Text style={[styles.label, isConfirmed ? styles.labelConfirmed : styles.labelPending]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.chip,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  chipConfirmed: {
    backgroundColor: '#DEF4EA',
  },
  chipPending: {
    backgroundColor: '#FCEFC7',
  },
  label: {
    ...typography.labelStrong,
    fontSize: 12,
  },
  labelConfirmed: {
    color: colors.brand.savings,
  },
  labelPending: {
    color: '#805B00',
  },
});
