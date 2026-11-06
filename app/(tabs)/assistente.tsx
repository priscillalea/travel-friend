import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { colors, typography } from '../../src/theme';

export default function AssistenteTabScreen() {
  return (
    <ScreenShell
      title="Assistente & Tickets"
      subtitle="Assistente ancorado em dados reais e ingressos offline."
      badgeText="Aba 4"
    >
      <Text style={styles.description}>
        Estrutura base pronta para os tickets com QR code offline (Etapa 8) e o assistente de IA
        (Etapa 9).
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
