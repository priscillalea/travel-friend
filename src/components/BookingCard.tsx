import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookingItem } from '../domain/itinerary';
import { colors, radii, spacing, typography } from '../theme';
import { StatusChip } from './StatusChip';

export interface BookingCardProps {
  booking: BookingItem;
  onActionPress?: (bookingId: string) => void;
}

/**
 * BookingCard (Seção 4.8 / docs/design/trocado_v3_2_reservas.png):
 * Cartões de voo (REC -- LHR), hotel e seguro viagem com StatusChip e ação para pendências.
 */
export function BookingCard({ booking, onActionPress }: BookingCardProps) {
  const isFlight = booking.type === 'flight' && booking.flightOrigin && booking.flightDestination;

  return (
    <View style={styles.card} testID={`booking-card-${booking.id}`}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>{booking.headerLabel}</Text>
        <StatusChip
          label={booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
          variant={booking.status}
        />
      </View>

      {isFlight ? (
        <View style={styles.flightRouteRow}>
          <Text style={styles.iataCode}>{booking.flightOrigin}</Text>
          <View style={styles.flightDashedLine} />
          <Text style={styles.iataCode}>{booking.flightDestination}</Text>
        </View>
      ) : (
        <Text style={styles.title}>{booking.title}</Text>
      )}

      <Text style={styles.subtitle}>{booking.subtitle}</Text>

      {booking.actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onActionPress?.(booking.id)}
          style={styles.actionButton}
          testID={`booking-action-${booking.id}`}
        >
          <Text style={styles.actionButtonText}>{booking.actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerLabel: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.secondary,
  },
  flightRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  iataCode: {
    ...typography.screenTitle,
    fontSize: 28,
    color: colors.text.primary,
  },
  flightDashedLine: {
    flex: 1,
    borderBottomWidth: 2,
    borderColor: colors.border.dashed,
    borderStyle: 'dashed',
  },
  title: {
    ...typography.cardTitle,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  actionButton: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  actionButtonText: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.action.primaryText,
  },
});
