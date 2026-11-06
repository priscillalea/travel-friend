import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/money';
import { PricePointSummary, PriceVoteChoice } from '../domain/sync';
import { colors, radii, spacing, typography } from '../theme';

export interface PriceVoteCardProps {
  pricePoint: PricePointSummary;
  onVote: (choice: PriceVoteChoice) => void;
  lastVotedChoice?: PriceVoteChoice | null;
}

/**
 * Componente PriceVote (Seção 4.5b / docs/design/trocado_v2_3_offline.png):
 * "Greggs, Wardour St"
 * "Ainda custa £2,99?"
 * "Última confirmação há 3 dias · 41 pessoas"
 * Botões "Sim, confirmo" (poupanca #17A36B) e "Mudou" (nevoa #EEF3F6).
 */
export function PriceVoteCard({ pricePoint, onVote, lastVotedChoice }: PriceVoteCardProps) {
  return (
    <View style={styles.card} testID="price-vote-card">
      <Text style={styles.placeName}>{pricePoint.placeName}</Text>
      <Text style={styles.question}>Ainda custa {formatMoney(pricePoint.price, 'pt-BR')}?</Text>
      <Text style={styles.meta} testID="price-vote-meta">
        Última confirmação {pricePoint.lastConfirmedLabel} · {pricePoint.confirmationsCount} pessoas
      </Text>

      <View style={styles.buttonsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sim, confirmo o preço"
          onPress={() => onVote('confirm')}
          style={[styles.button, styles.confirmButton]}
          testID="price-vote-confirm-button"
        >
          <Text style={styles.confirmButtonText}>Sim, confirmo</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="O preço mudou"
          onPress={() => onVote('changed')}
          style={[styles.button, styles.changedButton]}
          testID="price-vote-changed-button"
        >
          <Text style={styles.changedButtonText}>Mudou</Text>
        </Pressable>
      </View>

      {lastVotedChoice ? (
        <Text style={styles.feedbackText}>
          {lastVotedChoice === 'confirm'
            ? 'Voto salvo no celular (aditivo na fila de sincronização).'
            : 'Relato de alteração salvo na fila offline.'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
  },
  placeName: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  question: {
    ...typography.cardTitle,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  meta: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: colors.action.confirmBg,
  },
  confirmButtonText: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.action.confirmText,
  },
  changedButton: {
    backgroundColor: colors.action.secondaryBg,
  },
  changedButtonText: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.action.secondaryText,
  },
  feedbackText: {
    ...typography.labelSmall,
    color: colors.brand.savings,
    marginTop: spacing.sm,
  },
});
