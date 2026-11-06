import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { PriceVoteCard } from '../../src/components/PriceVoteCard';
import { PriceVoteChoice, SyncQueueService } from '../../src/domain/sync';
import { colors, layout, radii, spacing, typography } from '../../src/theme';

export default function ComerTabScreen() {
  const syncService = useMemo(() => new SyncQueueService(), []);
  const [isOffline, setIsOffline] = useState(true);
  const [pricePoint, setPricePoint] = useState(() => syncService.getPricePoint());
  const [pendingSyncCount, setPendingSyncCount] = useState(() => syncService.getPendingCount());
  const [lastVoted, setLastVoted] = useState<PriceVoteChoice | null>(null);

  const packs = syncService.getOfflinePacks();
  const londonPack = packs[0];

  const handleVote = (choice: PriceVoteChoice) => {
    const updated = syncService.submitPriceVote(choice);
    setPricePoint(updated);
    setPendingSyncCount(syncService.getPendingCount());
    setLastVoted(choice);
  };

  const handleToggleConnection = async () => {
    if (isOffline) {
      syncService.setConnectionStatus('online');
      await syncService.flushQueue();
      setIsOffline(false);
      setPendingSyncCount(syncService.getPendingCount());
    } else {
      syncService.setConnectionStatus('offline');
      setIsOffline(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <OfflineBanner
          isOffline={isOffline}
          rateLabel="£1 = R$ 7,24"
          ageLabel="há 2 h"
          style={styles.banner}
        />

        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>{'Disponível\nsem internet'}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={handleToggleConnection}
            style={styles.syncTogglePill}
            testID="toggle-connection-button"
          >
            <Text style={styles.syncToggleText}>
              {isOffline ? 'Simular sinal' : 'Voltar offline'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.packCard} testID="offline-pack-londres">
          <View style={[styles.packThumb, styles.packThumbMap]} />
          <View style={styles.packInfo}>
            <Text style={styles.packTitle}>{londonPack.city}</Text>
            <Text style={styles.packSubtitle}>Mapa, {londonPack.placesCount} lugares e preços</Text>
            <Text style={styles.packMeta}>Baixado · {londonPack.sizeMb} MB</Text>
          </View>
        </View>

        <View style={styles.packCard} testID="offline-pack-local-data">
          <View style={[styles.packThumb, styles.packThumbLocal]} />
          <View style={styles.packInfo}>
            <Text style={styles.packTitle}>Listas e orçamento</Text>
            <Text style={styles.packSubtitle}>Tudo salvo no celular</Text>
            <Text style={styles.packMeta}>
              {pendingSyncCount > 0
                ? `${pendingSyncCount} item(ns) na fila · sincroniza quando voltar o sinal`
                : 'Sincroniza quando voltar o sinal'}
            </Text>
          </View>
        </View>

        <PriceVoteCard pricePoint={pricePoint} onVote={handleVote} lastVotedChoice={lastVoted} />
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  banner: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  screenTitle: {
    ...typography.screenTitle,
    fontSize: 32,
    lineHeight: 36,
    color: colors.text.primary,
  },
  syncTogglePill: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: 4,
  },
  syncToggleText: {
    ...typography.labelStrong,
    color: colors.brand.primary,
  },
  packCard: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardLg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  packThumb: {
    width: 68,
    height: 68,
    borderRadius: radii.cardSm,
  },
  packThumbMap: {
    backgroundColor: colors.background.secondary,
  },
  packThumbLocal: {
    backgroundColor: '#EDE4C7',
  },
  packInfo: {
    flex: 1,
    gap: 3,
  },
  packTitle: {
    ...typography.cardTitle,
    fontWeight: '700',
    color: colors.text.primary,
  },
  packSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  packMeta: {
    ...typography.label,
    color: colors.text.secondary,
  },
});
