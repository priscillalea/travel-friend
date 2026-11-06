import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenShell } from '../../src/components/ScreenShell';
import { colors, typography } from '../../src/theme';

export default function ComerTabScreen() {
  return (
    <ScreenShell
      title="Comer & Passeios"
      subtitle="Mapa de comida barata e passeios por perto."
      badgeText="Aba 2"
    >
      <Text style={styles.description}>
        Estrutura base pronta para o mapa offline com votos da comunidade (Etapa 6) e passeios
        (Etapa 8).
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
