import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

export interface OfflineBannerProps {
  rateLabel?: string;
  ageLabel?: string;
  isOffline?: boolean;
  style?: ViewStyle;
}

/**
 * OfflineBanner (Seção 4.5b / docs/design/trocado_v2_3_offline.png):
 * "Sem internet · cotação de há 2 h (£1 = R$ 7,24)"
 */
export function OfflineBanner({
  rateLabel = '£1 = R$ 7,24',
  ageLabel = 'há 2 h',
  isOffline = true,
  style,
}: OfflineBannerProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, !isOffline && styles.containerOnline, style]}
      testID="offline-banner"
    >
      <View style={[styles.dot, !isOffline && styles.dotOnline]} />
      <Text style={styles.text}>
        {isOffline
          ? `Sem internet · cotação de ${ageLabel} (${rateLabel})`
          : `Conectado · cotação sincronizada (${rateLabel})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.tinta,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  containerOnline: {
    backgroundColor: colors.brand.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.accent,
  },
  dotOnline: {
    backgroundColor: colors.brand.savings,
  },
  text: {
    flex: 1,
    ...typography.labelStrong,
    fontSize: 14,
    lineHeight: 19,
    color: colors.text.inverse,
  },
});
