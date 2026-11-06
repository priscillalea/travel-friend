import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { colors, typography } from '../../src/theme';

export default function ListasTabScreen() {
  return (
    <ScreenShell
      title="Listas & Plano"
      subtitle="Cada trocado conta — base visual da Etapa 1."
      badgeText="Aba 1"
    >
      <Text style={styles.description}>
        Estrutura base pronta para receber as listas com conversão de moeda (Etapa 3) e o plano da
        viagem (Etapa 8).
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  description: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
