import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii } from '../theme';

export interface BudgetBarProps {
  /** Valor entre 0 e 1 */
  progressRatio: number;
  fillColor?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

/**
 * Barra de progresso do orçamento (Seção 3 — BudgetBar).
 */
export function BudgetBar({
  progressRatio,
  fillColor = colors.brand.accent,
  trackColor = '#2A5777',
  height = 10,
  style,
}: BudgetBarProps) {
  const clamped = Math.max(0, Math.min(1, progressRatio));
  const widthPercent = `${Math.round(clamped * 100)}%` as const;

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height }, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: widthPercent,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radii.pill,
  },
});
