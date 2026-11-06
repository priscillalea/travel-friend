import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { TotalBar } from '../../src/components/TotalBar';
import { useTripPhase } from '../../src/context/PhaseContext';
import {
  EXAMPLE_LIST_ID,
  formatRateTimestamp,
  InMemoryShoppingListStorage,
  parseUserPriceToMinor,
  ShoppingListService,
  ShoppingListView,
} from '../../src/domain/lists';
import { CURRENCY_SYMBOLS, FxRateRepository, LiveFxRateProvider } from '../../src/domain/money';
import { colors, layout, radii, spacing, typography } from '../../src/theme';

export default function ListasTabScreen() {
  const { phase, setPhase } = useTripPhase();

  const { service, fxRepository } = useMemo(() => {
    const fxRepo = new FxRateRepository({
      provider: new LiveFxRateProvider(),
    });
    const listService = new ShoppingListService({
      storage: new InMemoryShoppingListStorage(),
      fxRepository: fxRepo,
    });
    return { service: listService, fxRepository: fxRepo };
  }, []);

  const [listView, setListView] = useState<ShoppingListView | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshView = useCallback(async () => {
    const view = await service.getListView(EXAMPLE_LIST_ID);
    setListView(view);
  }, [service]);

  useEffect(() => {
    let active = true;
    service
      .seedExampleListIfEmpty(EXAMPLE_LIST_ID)
      .then(() => service.getListView(EXAMPLE_LIST_ID))
      .then((view) => {
        if (active) {
          setListView(view);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [service]);

  const handleAddItem = async () => {
    setErrorMessage(null);
    try {
      const priceMinor = parseUserPriceToMinor(newItemPrice);
      await service.addItem({
        listId: EXAMPLE_LIST_ID,
        name: newItemName,
        quantity: 1,
        unitPriceMinor: priceMinor,
      });
      setNewItemName('');
      setNewItemPrice('');
      await refreshView();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao adicionar item.');
    }
  };

  const handleIncrement = async (itemId: string) => {
    await service.updateItemQuantity(EXAMPLE_LIST_ID, itemId, 1);
    await refreshView();
  };

  const handleDecrement = async (itemId: string) => {
    await service.updateItemQuantity(EXAMPLE_LIST_ID, itemId, -1);
    await refreshView();
  };

  const handleInvertCurrencies = async () => {
    await service.invertCurrencies(EXAMPLE_LIST_ID);
    await refreshView();
  };

  const handleToggleFreeze = async () => {
    await service.toggleFreezeRate(EXAMPLE_LIST_ID);
    await refreshView();
  };

  const handleRefreshLiveRate = async () => {
    if (!listView) return;
    await fxRepository.getRate(listView.list.sourceCurrency, listView.list.targetCurrency, {
      forceRefresh: true,
    });
    await refreshView();
  };

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

        <View style={styles.headerBlock}>
          <Text style={styles.title}>{list.storeName}</Text>
          <Text style={styles.subtitle}> Valores de exemplo · funciona sem internet</Text>
        </View>

        <CurrencyPair
          sourceCurrency={list.sourceCurrency}
          targetCurrency={list.targetCurrency}
          onInvert={handleInvertCurrencies}
        />

        <View style={styles.rateBar}>
          <Pressable onPress={handleRefreshLiveRate} style={styles.rateTextGroup}>
            <Text style={styles.rateLabel}>
              {sourceSymbol}1 = {targetSymbol} {formattedRateValue} · atualizada às{' '}
              {formatRateTimestamp(activeRate)}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isRateFrozen }}
            onPress={handleToggleFreeze}
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
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
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
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  phaseSwitch: {
    marginBottom: spacing.sm,
  },
  headerBlock: {
    marginBottom: spacing.sm,
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
