import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TicketPass } from '../domain/itinerary';
import { colors, radii, spacing, typography } from '../theme';

export interface TicketCardProps {
  ticket: TicketPass;
  isBrightnessBoosted?: boolean;
  onPressQr?: () => void;
}

/**
 * TicketCard (Seção 4.9 / docs/design/trocado_v3_3_tickets.png):
 * Ingresso em mar (#0B3C5D) com picote tracejado, entalhe lateral, QR Code offline e brilho automático.
 */
export function TicketCard({ ticket, isBrightnessBoosted = false, onPressQr }: TicketCardProps) {
  return (
    <View style={styles.card} testID="main-ticket-card">
      <Text style={styles.categoryLabel}>{ticket.categoryLabel}</Text>
      <Text style={styles.title}>{ticket.title}</Text>
      <Text style={styles.dateTimeLocation}>{ticket.dateTimeLocationLabel}</Text>

      <View style={styles.perforationRow}>
        <View style={styles.leftNotch} />
        <View style={styles.dashedLine} />
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.offlineInfoColumn}>
          <Text style={styles.offlineCaption}>Funciona offline</Text>
          <Text style={styles.offlineInstruction}>Mostra na entrada</Text>
          {isBrightnessBoosted ? (
            <Text style={styles.brightnessBadge} testID="qr-brightness-indicator">
              ☀ Brilho máximo ativo
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="QR Code do ingresso"
          onPress={onPressQr}
          style={styles.qrBox}
          testID="ticket-qr-code-box"
        >
          {ticket.qrMatrix.map((row, rowIdx) => (
            <View key={`qr-row-${rowIdx}`} style={styles.qrRow}>
              {row.map((cell, colIdx) => (
                <View
                  key={`qr-cell-${rowIdx}-${colIdx}`}
                  style={[styles.qrCell, cell === 1 ? styles.qrCellDark : styles.qrCellLight]}
                />
              ))}
            </View>
          ))}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryLabel: {
    ...typography.label,
    fontSize: 14,
    color: '#A7C2D6',
    marginBottom: 4,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 28,
    color: colors.text.inverse,
    marginBottom: 4,
  },
  dateTimeLocation: {
    ...typography.body,
    color: '#D5E4EE',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  leftNotch: {
    position: 'absolute',
    left: -32,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.screen,
  },
  dashedLine: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderColor: '#4E7996',
    borderStyle: 'dashed',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  offlineInfoColumn: {
    flex: 1,
    gap: 4,
  },
  offlineCaption: {
    ...typography.label,
    fontSize: 14,
    color: '#A7C2D6',
  },
  offlineInstruction: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  brightnessBadge: {
    ...typography.labelSmall,
    color: colors.brand.accent,
    marginTop: 4,
  },
  qrBox: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardSm,
    padding: 12,
    gap: 3,
  },
  qrRow: {
    flexDirection: 'row',
    gap: 3,
  },
  qrCell: {
    width: 14,
    height: 14,
  },
  qrCellDark: {
    backgroundColor: colors.tinta,
  },
  qrCellLight: {
    backgroundColor: colors.background.card,
  },
});
