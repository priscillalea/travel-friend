import { FxRate, Money } from '../money';

export type ExpenseCategory = 'comida' | 'compras' | 'transporte' | 'passeios';

export interface Expense {
  readonly id: string;
  readonly tripId: string;
  readonly category: ExpenseCategory;
  readonly amount: Money;
  readonly date: string;
  readonly paymentMethod: 'card_local' | 'card_dcc' | 'cash';
}

export interface BudgetCategorySummary {
  readonly category: ExpenseCategory;
  readonly label: string;
  readonly amount: Money;
  /** Proporção de 0.0 a 1.0 para a barra visual */
  readonly progressRatio: number;
  readonly barColorToken: 'poupanca' | 'sol' | 'mar' | 'ceu';
}

export interface DuringTripBudgetSummary {
  readonly destination: string;
  readonly totalDays: number;
  readonly elapsedDays: number;
  readonly totalBudget: Money;
  readonly spentSoFar: Money;
  readonly spentConverted: Money;
  readonly spentToday: Money;
  readonly dailyLimit: Money;
  readonly progressRatio: number;
  readonly categories: readonly BudgetCategorySummary[];
  /** Diferença projetada ao fim da viagem (> 0 significa abaixo do orçamento = economia) */
  readonly projectedRemaining: Money;
  readonly paceMessage: string;
}

export interface BeforeTripBudgetSummary {
  readonly totalDays: number;
  readonly plannedTotal: Money;
  readonly plannedConverted: Money;
  readonly weeksUntilTrip: number;
  readonly weeklySavingsTarget: Money;
  readonly targetDateLabel: string;
  readonly categories: readonly BudgetCategorySummary[];
}

export interface CardFeeConfig {
  /** Taxa de IOF em pontos-base (ex: 350 = 3,50%) — configurável, nunca fixa no código */
  readonly iofBps: number;
  /** Spread do cartão em pontos-base (ex: 0 = 0,00%) */
  readonly spreadBps: number;
  /** Markup da maquininha (DCC) em pontos-base (ex: 978 = ~9,78% sobre o câmbio base) */
  readonly merchantDccMarkupBps: number;
}

export interface PaymentComparisonResult {
  readonly purchaseAmount: Money;
  readonly fxRate: FxRate;
  readonly cardConfig: CardFeeConfig;
  readonly payInLocalCurrencyTotal: Money;
  readonly payInHomeCurrencyDccTotal: Money;
  readonly difference: Money;
  readonly recommendedChoice: 'local' | 'dcc';
  readonly isEstimate: true;
}
