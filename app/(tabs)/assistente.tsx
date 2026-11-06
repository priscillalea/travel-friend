import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PhaseSwitch } from '../../src/components/PhaseSwitch';
import { StatusChip } from '../../src/components/StatusChip';
import { TicketCard } from '../../src/components/TicketCard';
import { useItinerary } from '../../src/context/ItineraryContext';
import { useTripPhase } from '../../src/context/PhaseContext';
import { TicketQrBrightnessManager } from '../../src/domain/itinerary';
import { colors, layout, radii, spacing, typography } from '../../src/theme';

export default function AssistenteTabScreen() {
  const { phase, setPhase } = useTripPhase();
  const { mainTicket, secondaryVouchers } = useItinerary();
  const brightnessManager = useMemo(() => new TicketQrBrightnessManager(), []);
  const [isBrightnessBoosted, setIsBrightnessBoosted] = useState(false);

  // Aumenta o brilho automaticamente ao abrir a tela com o QR Code (Seção 4.9)
  useEffect(() => {
    let active = true;
    brightnessManager
      .boostBrightnessForQr()
      .then(() => {
        if (active) {
          setIsBrightnessBoosted(true);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      brightnessManager.restoreBrightness().catch(() => undefined);
    };
  }, [brightnessManager]);

  const handleToggleQrBrightness = async () => {
    if (isBrightnessBoosted) {
      await brightnessManager.restoreBrightness();
      setIsBrightnessBoosted(false);
    } else {
      await brightnessManager.boostBrightnessForQr();
      setIsBrightnessBoosted(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <PhaseSwitch value={phase} onChange={setPhase} style={styles.phaseSwitch} />

        <Text style={styles.screenTitle}>Tickets</Text>

        <TicketCard
          ticket={mainTicket}
          isBrightnessBoosted={isBrightnessBoosted}
          onPressQr={handleToggleQrBrightness}
        />

        {secondaryVouchers.map((voucher) => (
          <View key={voucher.id} style={styles.voucherCard} testID={`voucher-${voucher.id}`}>
            <View style={styles.voucherLeft}>
              <Text style={styles.voucherTitle}>{voucher.title}</Text>
              <Text style={styles.voucherSubtitle}>{voucher.subtitle}</Text>
            </View>
            <StatusChip label={voucher.badgeLabel} variant="confirmed" />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  phaseSwitch: {
    marginBottom: spacing.md,
  },
  screenTitle: {
    ...typography.screenTitle,
    fontSize: 32,
    lineHeight: 36,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  voucherCard: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardLg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  voucherLeft: {
    flex: 1,
    gap: 3,
  },
  voucherTitle: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.text.primary,
  },
  voucherSubtitle: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.secondary,
  },
});
