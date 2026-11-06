import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BudgetBar } from '../../src/components/BudgetBar';
import { CategoryCard } from '../../src/components/CategoryCard';
import { PhaseSwitch } from '../../src/components/PhaseSwitch';
import { useTripPhase } from '../../src/context/PhaseContext';
import { useShoppingList } from '../../src/context/ShoppingListContext';
import {
  calculateBeforeTripBudget,
  calculateDuringTripBudget,
  compareRealPaymentCost,
  formatWholeCurrency,
} from '../../src/domain/budget';
import { createFxRate, createMoney, formatMoney } from '../../src/domain/money';
import { colors, layout, radii, spacing, typography } from '../../src/theme';

type DuringSubView = 'orcamento' | 'pagamento';

export default function ViagemTabScreen() {
  const { phase, setPhase } = useTripPhase();
  const { listView } = useShoppingList();

  const [duringSubView, setDuringSubView] = useState<DuringSubView>('orcamento');
  const [selectedPaymentChoice, setSelectedPaymentChoice] = useState<'local' | 'dcc' | null>(null);
  const [foodPlannedMinor, setFoodPlannedMinor] = useState(12_000); // £120 editável

  const fxRate = useMemo(
    () => listView?.activeRate ?? createFxRate('GBP', 'BRL', '7.24', '2026-11-06T09:00:00.000Z'),
    [listView?.activeRate],
  );

  const duringBudget = useMemo(() => calculateDuringTripBudget({ fxRate }), [fxRate]);

  const beforeBudget = useMemo(
    () =>
      calculateBeforeTripBudget({
        fxRate,
        plannedAllocationsMinor: {
          comida: foodPlannedMinor,
          passeios: 11_000,
          transporte: 7_000,
          compras: 10_000,
        },
      }),
    [fxRate, foodPlannedMinor],
  );

  const paymentComparison = useMemo(
    () =>
      compareRealPaymentCost({
        purchaseAmount: createMoney(1150, 'GBP'), // £11,50
        fxRate,
      }),
    [fxRate],
  );

  // Fase "Antes": Orçamento antes da viagem (trocado_v3_4_orcamento.png)
  if (phase === 'antes') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <PhaseSwitch value={phase} onChange={setPhase} style={styles.phaseSwitch} />

          <Text style={styles.screenTitle}>{'Quanto\nvai custar?'}</Text>

          <View style={styles.heroCard} testID="before-trip-budget-hero">
            <Text style={styles.heroCaption}>Previsto para {beforeBudget.totalDays} dias</Text>

            <View style={styles.heroAmountsRow}>
              <Text style={styles.heroMainAmount}>
                {formatWholeCurrency(beforeBudget.plannedTotal)}
              </Text>
              <Text style={styles.heroSecondaryAmount}>
                {formatWholeCurrency(beforeBudget.plannedConverted)}
              </Text>
            </View>

            <BudgetBar
              progressRatio={0.48}
              fillColor={colors.brand.accent}
              trackColor="#2A5777"
              height={10}
              style={styles.heroBar}
            />

            <Text style={styles.heroSavingsGoal}>
              Juntar {formatWholeCurrency(beforeBudget.weeklySavingsTarget)} por semana até{' '}
              {beforeBudget.targetDateLabel}
            </Text>
          </View>

          {beforeBudget.categories.map((cat) => (
            <CategoryCard
              key={cat.category}
              item={cat}
              onPress={
                cat.category === 'comida'
                  ? () => setFoodPlannedMinor((prev) => (prev === 12_000 ? 13_000 : 12_000))
                  : undefined
              }
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Sub-tela "Custo real do pagamento" (trocado_v2_2_pagamento.png)
  if (duringSubView === 'pagamento') {
    const iofPercentLabel = (paymentComparison.cardConfig.iofBps / 100)
      .toFixed(1)
      .replace('.', ',');

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSubSwitch}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDuringSubView('orcamento')}
              style={styles.subChip}
            >
              <Text style={styles.subChipText}>← Voltar ao Orçamento</Text>
            </Pressable>
          </View>

          <Text style={styles.screenTitle}>
            {`Como pagar\n${formatMoney(paymentComparison.purchaseAmount, 'pt-BR')}?`}
          </Text>
          <Text style={styles.paymentSubtitle}>
            A maquininha vai perguntar a moeda. Escolhe com isto em mente.
          </Text>

          <View style={styles.localOptionCard} testID="payment-option-local">
            <Text style={styles.optionHeader}>Pagar em libras (£)</Text>
            <Text style={styles.optionPrice}>
              {formatMoney(paymentComparison.payInLocalCurrencyTotal, 'pt-BR')}
            </Text>
            <Text style={styles.optionFooter}>
              Câmbio do cartão + IOF {iofPercentLabel}%. Melhor opção.
            </Text>
          </View>

          <View style={styles.dccOptionCard} testID="payment-option-dcc">
            <Text style={styles.optionHeader}>Pagar em reais (R$) na maquininha</Text>
            <Text style={styles.optionPrice}>
              {formatMoney(paymentComparison.payInHomeCurrencyDccTotal, 'pt-BR')}
            </Text>
            <Text style={styles.optionFooter}>
              A loja converte com taxa própria. Custa{' '}
              {formatMoney(paymentComparison.difference, 'pt-BR')} a mais.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setSelectedPaymentChoice('local')}
            style={styles.confirmPaymentButton}
            testID="confirm-pay-local-button"
          >
            <Text style={styles.confirmPaymentButtonText}>Entendi, vou pagar em £</Text>
          </Pressable>

          {selectedPaymentChoice === 'local' ? (
            <Text style={styles.confirmedChoiceNote}>
              Escolha registrada: pagamento na moeda local (£).
            </Text>
          ) : null}

          <Text style={styles.disclaimerText}>
            Valores ilustrativos. O app usa as taxas do teu cartão.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fase "Durante" (padrão): Orçamento durante a viagem (trocado_v2_1_orcamento.png)
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <PhaseSwitch value={phase} onChange={setPhase} style={styles.phaseSwitch} />

        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>
            {`${duringBudget.destination}\n${duringBudget.totalDays} dias`}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setDuringSubView('pagamento')}
            style={styles.subChip}
            testID="open-payment-comparison-button"
          >
            <Text style={styles.subChipText}>Custo na maquininha →</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard} testID="during-trip-budget-hero">
          <Text style={styles.heroCaption}>Gasto até agora</Text>

          <View style={styles.heroAmountsRow}>
            <Text style={styles.heroMainAmount}>
              {formatWholeCurrency(duringBudget.spentSoFar)}
            </Text>
            <Text style={styles.heroSecondaryAmount}>
              de {formatWholeCurrency(duringBudget.totalBudget)}
            </Text>
          </View>

          <BudgetBar
            progressRatio={duringBudget.progressRatio}
            fillColor={colors.brand.accent}
            trackColor="#2A5777"
            height={10}
            style={styles.heroBar}
          />

          <View style={styles.heroBottomRow}>
            <Text style={styles.heroFooterText}>
              {formatWholeCurrency(duringBudget.spentConverted)}
            </Text>
            <Text style={styles.heroFooterText}>
              Hoje: {formatWholeCurrency(duringBudget.spentToday)} de{' '}
              {formatWholeCurrency(duringBudget.dailyLimit)}
            </Text>
          </View>
        </View>

        {duringBudget.categories.map((cat) => (
          <CategoryCard key={cat.category} item={cat} />
        ))}

        <View style={styles.paceBanner} testID="budget-pace-banner">
          <Text style={styles.paceBannerText}>{duringBudget.paceMessage}</Text>
        </View>
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
  topSubSwitch: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  screenTitle: {
    ...typography.screenTitle,
    fontSize: 32,
    lineHeight: 35,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subChip: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  subChipText: {
    ...typography.labelStrong,
    color: colors.brand.primary,
  },
  heroCard: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroCaption: {
    ...typography.body,
    color: '#A7C2D6',
    marginBottom: 4,
  },
  heroAmountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  heroMainAmount: {
    ...typography.valueLarge,
    fontSize: 42,
    lineHeight: 46,
    color: colors.text.inverse,
  },
  heroSecondaryAmount: {
    ...typography.cardTitle,
    fontSize: 20,
    color: '#A7C2D6',
  },
  heroBar: {
    marginBottom: spacing.sm,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroFooterText: {
    ...typography.labelStrong,
    fontSize: 14,
    color: colors.text.inverse,
  },
  heroSavingsGoal: {
    ...typography.labelStrong,
    fontSize: 14,
    color: colors.text.inverse,
  },
  paceBanner: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  paceBannerText: {
    ...typography.labelStrong,
    fontSize: 14,
    lineHeight: 19,
    color: colors.action.primaryText,
  },
  paymentSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  localOptionCard: {
    backgroundColor: '#EAF7F1',
    borderColor: colors.border.savings,
    borderWidth: 1.5,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  dccOptionCard: {
    backgroundColor: '#FDF6DF',
    borderColor: colors.border.accent,
    borderWidth: 1.5,
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  optionHeader: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  optionPrice: {
    ...typography.valueLarge,
    fontSize: 38,
    lineHeight: 42,
    color: colors.text.primary,
    marginBottom: 6,
  },
  optionFooter: {
    ...typography.label,
    fontSize: 14,
    color: colors.text.secondary,
  },
  confirmPaymentButton: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  confirmPaymentButtonText: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.action.primaryText,
  },
  confirmedChoiceNote: {
    ...typography.labelStrong,
    color: colors.brand.savings,
    marginBottom: spacing.xs,
  },
  disclaimerText: {
    ...typography.label,
    color: colors.text.secondary,
  },
});
