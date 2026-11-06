import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { colors, typography } from '../../src/theme';

export default function ViagemTabScreen() {
  return (
    <ScreenShell
      title="Viagem & Orçamento"
      subtitle="Orçamento, reservas e custo real do pagamento."
      badgeText="Aba 3"
    >
      <Text style={styles.description}>
        Estrutura base pronta para controle de orçamento, comparador de maquininha (Etapa 7) e
        reservas (Etapa 8).
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
