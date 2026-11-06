import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CurrencyPair } from '../../src/components/CurrencyPair';
import { PhaseSwitch } from '../../src/components/PhaseSwitch';
import { PriceRow } from '../../src/components/PriceRow';
import { StatusChip } from '../../src/components/StatusChip';
import { TotalBar } from '../../src/components/TotalBar';
import { useItinerary } from '../../src/context/ItineraryContext';
import { useTripPhase } from '../../src/context/PhaseContext';
import { useShoppingList } from '../../src/context/ShoppingListContext';
import { formatWholeCurrency } from '../../src/domain/budget';
import { formatRateTimestamp, parseUserPriceToMinor } from '../../src/domain/lists';
import { CURRENCY_SYMBOLS } from '../../src/domain/money';
import { colors, layout, radii, spacing, typography } from '../../src/theme';

export default function ListasTabScreen() {
  const router = useRouter();
  const { phase, setPhase } = useTripPhase();
  const { days, selectedDayId, setSelectedDayId, dayPlan } = useItinerary();
  const {
    listView,
    addItem,
    incrementItem,
    decrementItem,
    invertCurrencies,
    toggleFreezeRate,
    refreshLiveRate,
  } = useShoppingList();

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddItem = async () => {
    setErrorMessage(null);
    try {
      const priceMinor = parseUserPriceToMinor(newItemPrice);
      await addItem({
        name: newItemName,
        unitPriceMinor: priceMinor,
        quantity: 1,
      });
      setNewItemName('');
      setNewItemPrice('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao adicionar item.');
    }
  };

  // Fase "Antes": Plano da viagem (trocado_v3_0_plano.png)
  if (phase === 'antes') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.planContainer}
          showsVerticalScrollIndicator={false}
        >
          <PhaseSwitch value={phase} onChange={setPhase} style={styles.phaseSwitch} />

          <Text style={styles.planTitle}>{'Londres\n12 a 17 dez'}</Text>

          <View style={styles.daysRow}>
            {days.map((d) => {
              const isSelected = d.id === selectedDayId;
              return (
                <Pressable
                  key={d.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedDayId(d.id)}
                  style={[styles.dayPill, isSelected && styles.dayPillActive]}
                  testID={`plan-day-${d.dayOfMonth}`}
                >
                  <Text style={[styles.dayCaption, isSelected && styles.dayCaptionActive]}>
                    Dia {d.dayNumber}
                  </Text>
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                    {d.dayOfMonth}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.timelineCard} testID="day-plan-timeline">
            {dayPlan.stops.map((stop, idx) => {
              const isLast = idx === dayPlan.stops.length - 1;
              const isFree = stop.cost.amountMinor === 0;
              return (
                <View key={stop.id}>
                  <View style={[styles.stopRow, !isLast && styles.dashedBorder]}>
                    <Text style={styles.stopTime}>{stop.time}</Text>

                    <View style={styles.stopCenter}>
                      <Text style={styles.stopTitle}>{stop.title}</Text>
                      <Text style={styles.stopSubtitle}>{stop.subtitle}</Text>
                      {stop.isReserved ? (
                        <StatusChip
                          label="Reservado"
                          variant="confirmed"
                          style={styles.reservedChip}
                        />
                      ) : null}
                    </View>

                    <Text style={styles.stopCost}>
                      {isFree ? 'Grátis' : formatWholeCurrency(stop.cost)}
                    </Text>
                  </View>

                  {stop.walkMinutesToNext ? (
                    <Text style={styles.walkBetweenLabel}>{stop.walkMinutesToNext} min a pé</Text>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={styles.planTotalBar} testID="plan-day-total-bar">
            <Text style={styles.planTotalLabel}>Previsto para o dia {dayPlan.day.dayOfMonth}</Text>
            <Text style={styles.planTotalValue}>{formatWholeCurrency(dayPlan.totalPlanned)}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!listView) {
    return null;
  }

  const { list, activeRate, isRateFrozen, items, totalItemsCount, totalOriginal, totalConverted } =
    listView;
  const sourceSymbol = CURRENCY_SYMBOLS[list.sourceCurrency];
  const targetSymbol = CURRENCY_SYMBOLS[list.targetCurrency];
  const formattedRateValue = activeRate.rate.toFixed(2).replace('.', ',');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PhaseSwitch value={phase} onChange={setPhase} style={styles.phaseSwitch} />

        <View style={styles.headerRow}>
          <View style={styles.headerBlock}>
            <Text style={styles.title}>{list.storeName}</Text>
            <Text style={styles.subtitle}>Valores de exemplo · funciona sem internet</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escanear etiqueta com a câmera"
            onPress={() => router.push('/scanner')}
            style={styles.scanButton}
            testID="open-scanner-button"
          >
            <Text style={styles.scanButtonText}>Escanear etiqueta</Text>
          </Pressable>
        </View>

        <CurrencyPair
          sourceCurrency={list.sourceCurrency}
          targetCurrency={list.targetCurrency}
          onInvert={invertCurrencies}
        />

        <View style={styles.rateBar}>
          <Pressable onPress={refreshLiveRate} style={styles.rateTextGroup}>
            <Text style={styles.rateLabel}>
              {sourceSymbol}1 = {targetSymbol} {formattedRateValue} · atualizada às{' '}
              {formatRateTimestamp(activeRate)}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isRateFrozen }}
            onPress={toggleFreezeRate}
            style={[styles.freezeChip, isRateFrozen && styles.freezeChipActive]}
            testID="freeze-rate-button"
          >
            <Text style={[styles.freezeChipText, isRateFrozen && styles.freezeChipTextActive]}>
              {isRateFrozen ? 'Cotação congelada' : 'Congelar cotação'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.listCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((entry, idx) => (
            <PriceRow
              key={entry.item.id}
              entry={entry}
              onIncrement={incrementItem}
              onDecrement={decrementItem}
              isLast={idx === items.length - 1}
            />
          ))}

          <View style={styles.addRow}>
            <TextInput
              placeholder="Novo item (ex: Chocolate)"
              placeholderTextColor={colors.text.secondary}
              value={newItemName}
              onChangeText={setNewItemName}
              style={[styles.input, styles.inputName]}
              testID="new-item-name-input"
            />
            <TextInput
              placeholder={`${sourceSymbol} 0,00`}
              placeholderTextColor={colors.text.secondary}
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="decimal-pad"
              style={[styles.input, styles.inputPrice]}
              testID="new-item-price-input"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Adicionar item à lista"
              onPress={handleAddItem}
              style={styles.addButton}
              testID="add-item-button"
            >
              <Text style={styles.addButtonText}>+ Adicionar</Text>
            </Pressable>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </ScrollView>

        <View style={styles.totalBarWrapper}>
          <TotalBar
            totalConverted={totalConverted}
            totalOriginal={totalOriginal}
            totalItemsCount={totalItemsCount}
          />
        </View>
      </View>
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
  planContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  phaseSwitch: {
    marginBottom: spacing.sm,
  },
  planTitle: {
    ...typography.screenTitle,
    fontSize: 32,
    lineHeight: 35,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dayPill: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: radii.cardSm,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayPillActive: {
    backgroundColor: colors.action.primaryBg,
  },
  dayCaption: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  dayCaptionActive: {
    ...typography.labelStrong,
    fontSize: 12,
    color: colors.action.primaryText,
  },
  dayNumber: {
    ...typography.cardTitle,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  dayNumberActive: {
    color: colors.action.primaryText,
  },
  timelineCard: {
    backgroundColor: colors.background.card,
    borderRadius: radii.cardLg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.md,
  },
  dashedBorder: {
    borderBottomWidth: layout.dashedBorderWidth,
    borderColor: colors.border.dashed,
    borderStyle: 'dashed',
  },
  stopTime: {
    ...typography.labelStrong,
    color: colors.brand.primary,
    width: 44,
  },
  stopCenter: {
    flex: 1,
    gap: 3,
  },
  stopTitle: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.text.primary,
  },
  stopSubtitle: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.secondary,
  },
  reservedChip: {
    marginTop: 4,
  },
  stopCost: {
    ...typography.moneyRow,
    color: colors.text.primary,
  },
  walkBetweenLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginLeft: 60,
    marginTop: 4,
  },
  planTotalBar: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTotalLabel: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.action.primaryText,
  },
  planTotalValue: {
    ...typography.valueMedium,
    fontSize: 28,
    color: colors.action.primaryText,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerBlock: {
    flex: 1,
  },
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  scanButtonText: {
    ...typography.labelStrong,
    color: colors.text.inverse,
  },
  rateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  rateTextGroup: {
    flex: 1,
  },
  rateLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  freezeChip: {
    backgroundColor: colors.background.card,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  freezeChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  freezeChipText: {
    ...typography.labelSmall,
    color: colors.text.primary,
  },
  freezeChipTextActive: {
    ...typography.labelStrong,
    fontSize: 12,
    color: colors.text.inverse,
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: layout.dashedBorderWidth,
    borderColor: colors.border.dashed,
    borderStyle: 'dashed',
  },
  input: {
    backgroundColor: colors.background.screen,
    borderRadius: radii.tabIcon,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    ...typography.body,
    color: colors.text.primary,
  },
  inputName: {
    flex: 1,
  },
  inputPrice: {
    width: 82,
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  addButtonText: {
    ...typography.labelStrong,
    color: colors.action.primaryText,
  },
  errorText: {
    ...typography.labelSmall,
    color: colors.brand.primary,
    marginTop: spacing.xs,
  },
  totalBarWrapper: {
    marginTop: spacing.sm,
  },
});
