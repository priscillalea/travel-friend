import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, layout, radii, spacing } from '../theme';

export interface BottomSheetProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Painel inferior (BottomSheet — Seção 3 do TROCADO_SPEC.md):
 * - Fundo branco (#FFFFFF)
 * - Raio superior 28
 * - Alça superior de 40x5
 * - Sombra suave para cima
 */
export function BottomSheet({ children, style }: BottomSheetProps) {
  return (
    <View style={[styles.container, style]} testID="bottom-sheet">
      <View style={styles.handleWrapper}>
        <View style={styles.handle} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.bottomSheet,
    borderTopLeftRadius: radii.bottomSheet,
    borderTopRightRadius: radii.bottomSheet,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    shadowColor: '#0A1B2A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  handleWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  handle: {
    width: layout.bottomSheetHandleWidth,
    height: layout.bottomSheetHandleHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.border.dashed,
  },
});
