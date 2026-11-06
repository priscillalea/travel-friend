import {
  convertMoney,
  createMoney,
  divideAndRoundBigInt,
  formatMoney,
  FxRate,
  Money,
  subtractMoney,
  sumMoney,
} from '../money';
import {
  BeforeTripBudgetSummary,
  BudgetCategorySummary,
  CardFeeConfig,
  DuringTripBudgetSummary,
  Expense,
  PaymentComparisonResult,
} from './types';

/**
 * Configuração ILUSTRATIVA padrão de taxas do cartão (Seção 4.6 e Seção 8: sempre configurável).
 * Com £11,50 (1150p) a 7,24 (R$ 83,26):
 * - IOF 3,50% (350 bps) + spread 0% -> 8326 * 1.035 = 8617,41 -> R$ 86,17 (8617 centavos)
 * - Maquininha DCC (977,66 bps ~ 9,78%) -> R$ 91,40 (9140 centavos)
 * - Diferença: R$ 5,23 (523 centavos)
 */
export const DEFAULT_CARD_FEE_CONFIG: CardFeeConfig = Object.freeze({
  iofBps: 350,
  spreadBps: 0,
  merchantDccMarkupBps: 978,
});

/**
 * Gastos ILUSTRATIVOS de exemplo durante a viagem em Londres (trocado_v2_1_orcamento.png):
 * Comida £92 + Compras £85 + Transporte £61 = £238 de £400.
 */
export const EXAMPLE_DURING_TRIP_EXPENSES: readonly Expense[] = Object.freeze([
  {
    id: 'exp-food-1',
    tripId: 'trip-london-example',
    category: 'comida',
    amount: createMoney(9200, 'GBP'), // £92
    date: '2026-12-13',
    paymentMethod: 'card_local',
  },
  {
    id: 'exp-shopping-1',
    tripId: 'trip-london-example',
    category: 'compras',
    amount: createMoney(8500, 'GBP'), // £85
    date: '2026-12-14',
    paymentMethod: 'card_local',
  },
  {
    id: 'exp-transport-1',
    tripId: 'trip-london-example',
    category: 'transporte',
    amount: createMoney(6100, 'GBP'), // £61
    date: '2026-12-15',
    paymentMethod: 'card_local',
  },
]);

/**
 * Calcula o resumo de orçamento Durante a Viagem com projeção de ritmo (Seção 4.5 / trocado_v2_1_orcamento.png).
 */
export function calculateDuringTripBudget(params: {
  destination?: string;
  totalDays?: number;
  elapsedDays?: number;
  totalBudget?: Money;
  spentToday?: Money;
  expenses?: readonly Expense[];
  fxRate: FxRate;
}): DuringTripBudgetSummary {
  const destination = params.destination ?? 'Londres';
  const totalDays = params.totalDays ?? 5;
  const elapsedDays = params.elapsedDays ?? 3.067; // 238 / 3.067 * 5 = 388 (£12 abaixo de £400)
  const totalBudget = params.totalBudget ?? createMoney(40_000, 'GBP'); // £400
  const expenses = params.expenses ?? EXAMPLE_DURING_TRIP_EXPENSES;
  const spentToday = params.spentToday ?? createMoney(3400, 'GBP'); // £34

  const spentSoFar = sumMoney(
    expenses.map((e) => e.amount),
    totalBudget.currency,
  );
  const spentConverted = convertMoney(spentSoFar, params.fxRate);
  const dailyLimit = createMoney(
    Math.round(totalBudget.amountMinor / totalDays),
    totalBudget.currency,
  );

  const projectedTotalMinor =
    Math.round(((spentSoFar.amountMinor / elapsedDays) * totalDays) / 100) * 100;
  const projectedRemaining = subtractMoney(
    totalBudget,
    createMoney(projectedTotalMinor, totalBudget.currency),
  );

  const absRemainingMajor = Math.round(Math.abs(projectedRemaining.amountMinor) / 100);
  const paceMessage =
    projectedRemaining.amountMinor >= 0
      ? `Neste ritmo, terminas a viagem £${absRemainingMajor} abaixo do orçamento.`
      : `Neste ritmo, vais passar £${absRemainingMajor} do orçamento.`;

  const byCategory = (cat: Expense['category']) =>
    sumMoney(
      expenses.filter((e) => e.category === cat).map((e) => e.amount),
      totalBudget.currency,
    );

  const foodAmount = byCategory('comida');
  const shoppingAmount = byCategory('compras');
  const transportAmount = byCategory('transporte');

  const categories: BudgetCategorySummary[] = [
    {
      category: 'comida',
      label: 'Comida',
      amount: foodAmount,
      progressRatio: Math.min(1, foodAmount.amountMinor / 15_000),
      barColorToken: 'poupanca',
    },
    {
      category: 'compras',
      label: 'Compras',
      amount: shoppingAmount,
      progressRatio: Math.min(1, shoppingAmount.amountMinor / 15_000),
      barColorToken: 'sol',
    },
    {
      category: 'transporte',
      label: 'Transporte',
      amount: transportAmount,
      progressRatio: Math.min(1, transportAmount.amountMinor / 15_000),
      barColorToken: 'mar',
    },
  ];

  return {
    destination,
    totalDays,
    elapsedDays,
    totalBudget,
    spentSoFar,
    spentConverted,
    spentToday,
    dailyLimit,
    progressRatio: Math.min(1, spentSoFar.amountMinor / totalBudget.amountMinor),
    categories,
    projectedRemaining,
    paceMessage,
  };
}

/**
 * Calcula o orçamento Antes da Viagem (Seção 4.10 / trocado_v3_4_orcamento.png):
 * Comida £120 + Passeios £110 + Transporte £70 + Compras e extras £100 = £400 (R$ 2.896).
 * Meta semanal: Juntar R$ 579 por semana até 12 dez.
 */
export function calculateBeforeTripBudget(params: {
  totalDays?: number;
  weeksUntilTrip?: number;
  targetDateLabel?: string;
  fxRate: FxRate;
  plannedAllocationsMinor?: {
    comida: number;
    passeios: number;
    transporte: number;
    compras: number;
  };
}): BeforeTripBudgetSummary {
  const totalDays = params.totalDays ?? 5;
  const weeksUntilTrip = params.weeksUntilTrip ?? 5;
  const targetDateLabel = params.targetDateLabel ?? '12 dez';
  const alloc = params.plannedAllocationsMinor ?? {
    comida: 12_000, // £120
    passeios: 11_000, // £110
    transporte: 7_000, // £70
    compras: 10_000, // £100
  };

  const currency = params.fxRate.base;
  const categories: BudgetCategorySummary[] = [
    {
      category: 'comida',
      label: 'Comida',
      amount: createMoney(alloc.comida, currency),
      progressRatio: Math.min(1, alloc.comida / 20_000),
      barColorToken: 'poupanca',
    },
    {
      category: 'passeios',
      label: 'Passeios',
      amount: createMoney(alloc.passeios, currency),
      progressRatio: Math.min(1, alloc.passeios / 20_000),
      barColorToken: 'sol',
    },
    {
      category: 'transporte',
      label: 'Transporte',
      amount: createMoney(alloc.transporte, currency),
      progressRatio: Math.min(1, alloc.transporte / 20_000),
      barColorToken: 'mar',
    },
    {
      category: 'compras',
      label: 'Compras e extras',
      amount: createMoney(alloc.compras, currency),
      progressRatio: Math.min(1, alloc.compras / 20_000),
      barColorToken: 'ceu',
    },
  ];

  const plannedTotal = sumMoney(
    categories.map((c) => c.amount),
    currency,
  );
  const plannedConverted = convertMoney(plannedTotal, params.fxRate);

  const weeklyMinor = Number(
    divideAndRoundBigInt(BigInt(plannedConverted.amountMinor), BigInt(weeksUntilTrip), 'FLOOR'),
  );
  // Arredonda para múltiplos de 100 centavos (reais inteiros) para metas semanais claras
  const weeklyWholeReaisMinor = Math.floor(weeklyMinor / 100) * 100;
  const weeklySavingsTarget = createMoney(weeklyWholeReaisMinor, plannedConverted.currency);

  return {
    totalDays,
    plannedTotal,
    plannedConverted,
    weeksUntilTrip,
    weeklySavingsTarget,
    targetDateLabel,
    categories,
  };
}

/**
 * Compara o custo real do pagamento na moeda local vs. DCC na maquininha (Seção 4.6 / trocado_v2_2_pagamento.png).
 * Toda a aritmética é feita em inteiros na menor unidade usando BigInt.
 */
export function compareRealPaymentCost(params: {
  purchaseAmount: Money;
  fxRate: FxRate;
  cardConfig?: CardFeeConfig;
}): PaymentComparisonResult {
  const { purchaseAmount, fxRate } = params;
  const cardConfig = params.cardConfig ?? DEFAULT_CARD_FEE_CONFIG;

  const baseConverted = convertMoney(purchaseAmount, fxRate);
  const totalCardFeeBps = cardConfig.iofBps + cardConfig.spreadBps;

  // Valor no cartão na moeda local = baseConverted * (10000 + iofBps + spreadBps) / 10000
  const localMinor = Number(
    divideAndRoundBigInt(
      BigInt(baseConverted.amountMinor) * BigInt(10_000 + totalCardFeeBps),
      10_000n,
      'HALF_UP',
    ),
  );

  // Valor na maquininha em reais (DCC) = baseConverted * (10000 + merchantDccMarkupBps) / 10000
  const dccMinor = Number(
    divideAndRoundBigInt(
      BigInt(baseConverted.amountMinor) * BigInt(10_000 + cardConfig.merchantDccMarkupBps),
      10_000n,
      'HALF_UP',
    ),
  );

  const payInLocalCurrencyTotal = createMoney(localMinor, baseConverted.currency);
  const payInHomeCurrencyDccTotal = createMoney(dccMinor, baseConverted.currency);
  const difference = createMoney(Math.abs(dccMinor - localMinor), baseConverted.currency);

  return {
    purchaseAmount,
    fxRate,
    cardConfig,
    payInLocalCurrencyTotal,
    payInHomeCurrencyDccTotal,
    difference,
    recommendedChoice: localMinor <= dccMinor ? 'local' : 'dcc',
    isEstimate: true,
  };
}

export function formatWholeCurrency(money: Money): string {
  const full = formatMoney(money, 'pt-BR');
  return full.replace(/,00$/, '');
}
