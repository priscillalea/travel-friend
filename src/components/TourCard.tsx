import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TourActivity } from '../domain/itinerary';
import { colors, radii, spacing, typography } from '../theme';

export interface TourCardProps {
  tour: TourActivity;
  onAddToPlan: (tour: TourActivity) => void;
}

const BANNER_COLOR_MAP: Record<TourActivity['bannerTone'], string> = {
  blue: '#5B9AB9',
  green: '#42B386',
  gold: '#FCD25B',
};

/**
 * TourCard (Seção 4.7 / docs/design/trocado_v3_1_passeios.png):
 * Imagem de topo, nome, duração + política de cancelamento e botão amarelo com preço que adiciona ao plano.
 */
export function TourCard({ tour, onAddToPlan }: TourCardProps) {
  const bannerBg = BANNER_COLOR_MAP[tour.bannerTone];

  return (
    <View style={styles.card} testID={`tour-card-${tour.id}`}>
      <View style={[styles.banner, { backgroundColor: bannerBg }]} />

      <View style={styles.body}>
        <View style={styles.textColumn}>
          <Text style={styles.title}>{tour.title}</Text>
          <Text style={styles.subtitle}>
            {tour.durationLabel} · {tour.policyLabel}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Adicionar ${tour.title} ao plano`}
          onPress={() => onAddToPlan(tour)}
          style={styles.priceButton}
          testID={`add-tour-button-${tour.id}`}
        >
          <Text style={styles.priceButtonText}>{tour.priceButtonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardLg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  banner: {
    height: 118,
    width: '100%',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...typography.cardTitle,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceButton: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  priceButtonText: {
    ...typography.labelStrong,
    fontWeight: '700',
    color: colors.action.primaryText,
  },
});
