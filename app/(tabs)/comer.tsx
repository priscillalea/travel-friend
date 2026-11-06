import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '../../src/components/BottomSheet';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { PlaceCard } from '../../src/components/PlaceCard';
import { PriceVoteCard } from '../../src/components/PriceVoteCard';
import { useShoppingList } from '../../src/context/ShoppingListContext';
import { createFxRate, formatMoney } from '../../src/domain/money';
import {
  CheapFoodOption,
  EXAMPLE_USER_LOCATION_SOHO,
  LocalPlacesApiService,
  WalkComparisonSummary,
} from '../../src/domain/places';
import { PriceVoteChoice, SyncQueueService } from '../../src/domain/sync';
import { colors, layout, radii, spacing, typography } from '../../src/theme';

type ComerSubMode = 'mapa' | 'offline';

const PRICE_CEILING_FILTERS: ReadonlyArray<{ label: string; maxMinor?: number }> = [
  { label: 'Perto de mim', maxMinor: undefined },
  { label: 'Até £3,50', maxMinor: 350 },
  { label: 'Até £5', maxMinor: 500 },
];

const PIN_POSITIONS: ReadonlyArray<{ top: `${number}%`; left: `${number}%` }> = [
  { top: '38%', left: '42%' },
  { top: '54%', left: '24%' },
  { top: '26%', left: '64%' },
  { top: '62%', left: '66%' },
  { top: '22%', left: '22%' },
];

export default function ComerTabScreen() {
  const { listView } = useShoppingList();
  const placesService = useMemo(() => new LocalPlacesApiService(), []);
  const syncService = useMemo(() => new SyncQueueService(), []);

  const [subMode, setSubMode] = useState<ComerSubMode>('mapa');
  const [maxPriceMinor, setMaxPriceMinor] = useState<number | undefined>(undefined);
  const [options, setOptions] = useState<readonly CheapFoodOption[]>([]);
  const [comparison, setComparison] = useState<WalkComparisonSummary | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Estado da visão Offline & Comunidade (Etapa 5)
  const [isOffline, setIsOffline] = useState(true);
  const [pricePoint, setPricePoint] = useState(() => syncService.getPricePoint());
  const [pendingSyncCount, setPendingSyncCount] = useState(() => syncService.getPendingCount());
  const [lastVoted, setLastVoted] = useState<PriceVoteChoice | null>(null);

  const activeRate =
    listView?.activeRate ?? createFxRate('GBP', 'BRL', '7.24', '2026-11-06T09:00:00.000Z');

  useEffect(() => {
    let active = true;
    placesService
      .searchPlacesByArea({
        userLocation: EXAMPLE_USER_LOCATION_SOHO,
        maxPriceMinor,
        fxRate: activeRate,
      })
      .then((res) => {
        if (!active) return;
        setOptions(res.options);
        setComparison(res.comparison);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [placesService, maxPriceMinor, activeRate]);

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

  if (subMode === 'offline') {
    const londonPack = syncService.getOfflinePacks()[0];
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.offlineContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSwitchBar}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSubMode('mapa')}
              style={styles.modeChip}
            >
              <Text style={styles.modeChipText}>← Voltar ao Mapa</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleToggleConnection}
              style={styles.modeChip}
              testID="toggle-connection-button"
            >
              <Text style={styles.modeChipText}>
                {isOffline ? 'Simular sinal' : 'Voltar offline'}
              </Text>
            </Pressable>
          </View>

          <OfflineBanner
            isOffline={isOffline}
            rateLabel="£1 = R$ 7,24"
            ageLabel="há 2 h"
            style={styles.banner}
          />

          <Text style={styles.offlineScreenTitle}>{'Disponível\nsem internet'}</Text>

          <View style={styles.packCard} testID="offline-pack-londres">
            <View style={[styles.packThumb, styles.packThumbMap]} />
            <View style={styles.packInfo}>
              <Text style={styles.packTitle}>{londonPack.city}</Text>
              <Text style={styles.packSubtitle}>
                Mapa, {londonPack.placesCount} lugares e preços
              </Text>
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

  return (
    <SafeAreaView style={styles.mapSafeArea}>
      <View style={styles.mapCanvas} testID="cheap-food-map-canvas">
        <View style={styles.mapRoadHorizontal} />
        <View style={styles.mapRoadVertical} />
        <View style={styles.mapParkPatch} />

        <View style={styles.mapTopOverlay}>
          <View style={styles.filtersRow}>
            {PRICE_CEILING_FILTERS.map((filter) => {
              const isActive = maxPriceMinor === filter.maxMinor;
              return (
                <Pressable
                  key={filter.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setMaxPriceMinor(filter.maxMinor)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setSubMode('offline')}
            style={styles.offlineModeButton}
            testID="open-offline-panel-button"
          >
            <Text style={styles.offlineModeButtonText}>Offline & Votos</Text>
          </Pressable>
        </View>

        <View style={styles.userDot}>
          <View style={styles.userDotInner} />
        </View>

        {options.map((opt, idx) => {
          const pos = PIN_POSITIONS[idx % PIN_POSITIONS.length];
          const isSelected = selectedPlaceId === opt.place.id;
          return (
            <Pressable
              key={opt.place.id}
              onPress={() => setSelectedPlaceId(opt.place.id)}
              style={[
                styles.mapPin,
                { top: pos.top, left: pos.left },
                opt.isBestValue ? styles.mapPinBest : styles.mapPinStandard,
                isSelected && styles.mapPinSelected,
              ]}
              testID={`map-pin-${opt.place.id}`}
            >
              <Text
                style={[
                  styles.mapPinText,
                  opt.isBestValue ? styles.mapPinTextBest : styles.mapPinTextStandard,
                ]}
              >
                {formatMoney(opt.pricePoint.price, 'pt-BR')}
              </Text>
            </Pressable>
          );
        })}

        <Text style={styles.osmAttribution}>OpenStreetMap · Soho, Londres (Dados fictícios)</Text>
      </View>

      <BottomSheet style={styles.mapBottomSheet}>
        {comparison ? (
          <View style={styles.comparisonBanner} testID="walk-comparison-banner">
            <Text style={styles.comparisonText}>{comparison.message}</Text>
          </View>
        ) : null}

        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
          {options.map((opt, idx) => (
            <PlaceCard
              key={opt.place.id}
              option={opt}
              isSelected={selectedPlaceId === opt.place.id}
              onPress={() => setSelectedPlaceId(opt.place.id)}
              isLast={idx === options.length - 1}
            />
          ))}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  mapSafeArea: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scroll: {
    flex: 1,
  },
  offlineContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  topSwitchBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modeChip: {
    backgroundColor: colors.background.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  modeChipText: {
    ...typography.labelStrong,
    color: colors.brand.primary,
  },
  banner: {
    marginBottom: spacing.lg,
  },
  offlineScreenTitle: {
    ...typography.screenTitle,
    fontSize: 32,
    lineHeight: 36,
    color: colors.text.primary,
    marginBottom: spacing.lg,
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
  mapCanvas: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    position: 'relative',
    overflow: 'hidden',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    top: '46%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#E1EEF5',
    transform: [{ rotate: '-6deg' }],
  },
  mapRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '48%',
    width: 16,
    backgroundColor: '#E1EEF5',
    transform: [{ rotate: '8deg' }],
  },
  mapParkPatch: {
    position: 'absolute',
    top: '18%',
    right: '10%',
    width: 110,
    height: 85,
    borderRadius: 24,
    backgroundColor: '#BFE0D4',
  },
  mapTopOverlay: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    zIndex: 5,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  filterChip: {
    backgroundColor: colors.background.card,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
  },
  filterChipText: {
    ...typography.labelStrong,
    color: colors.text.primary,
  },
  filterChipTextActive: {
    color: colors.text.inverse,
  },
  offlineModeButton: {
    backgroundColor: colors.tinta,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  offlineModeButtonText: {
    ...typography.labelSmall,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  userDot: {
    position: 'absolute',
    top: '44%',
    left: '46%',
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(11, 60, 93, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDotInner: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  mapPin: {
    position: 'absolute',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#0A1B2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  mapPinBest: {
    backgroundColor: colors.brand.savings,
  },
  mapPinStandard: {
    backgroundColor: colors.action.primaryBg,
  },
  mapPinSelected: {
    borderWidth: 2,
    borderColor: colors.tinta,
  },
  mapPinText: {
    ...typography.labelStrong,
    fontWeight: '800',
  },
  mapPinTextBest: {
    color: colors.text.inverse,
  },
  mapPinTextStandard: {
    color: colors.action.primaryText,
  },
  osmAttribution: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  mapBottomSheet: {
    maxHeight: '54%',
    paddingBottom: spacing.md,
  },
  comparisonBanner: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.cardSm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  comparisonText: {
    ...typography.labelStrong,
    color: colors.action.primaryText,
  },
  optionsList: {
    flexGrow: 0,
  },
});
