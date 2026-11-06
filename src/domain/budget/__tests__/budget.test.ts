import { createFxRate, createMoney, formatMoney } from '../../money';
import {
  calculateBeforeTripBudget,
  calculateDuringTripBudget,
  compareRealPaymentCost,
} from '../index';

describe('Orçamento e Custo Real do Pagamento — Etapa 7 (Seções 4.5, 4.6 e 4.10)', () => {
  const fxRate = createFxRate('GBP', 'BRL', '7.24', '2026-11-06T09:00:00.000Z');

  it('calcula o orçamento durante a viagem (£238 de £400 = R$ 1.723) e projeção de ritmo (£12 abaixo)', () => {
    const summary = calculateDuringTripBudget({ fxRate });

    expect(summary.spentSoFar).toEqual({ amountMinor: 23_800, currency: 'GBP' });
    expect(summary.totalBudget).toEqual({ amountMinor: 40_000, currency: 'GBP' });
    // £238 * 7.24 = R$ 1.723,12 (172312 centavos)
    expect(summary.spentConverted.amountMinor).toBe(172_312);
    expect(summary.dailyLimit).toEqual({ amountMinor: 8000, currency: 'GBP' });
    expect(summary.projectedRemaining).toEqual({ amountMinor: 1200, currency: 'GBP' });
    expect(summary.paceMessage).toBe('Neste ritmo, terminas a viagem £12 abaixo do orçamento.');
  });

  it('calcula o orçamento antes da viagem (£400 = R$ 2.896 e meta semanal de R$ 579)', () => {
    const before = calculateBeforeTripBudget({ fxRate });

    expect(before.plannedTotal).toEqual({ amountMinor: 40_000, currency: 'GBP' });
    expect(before.plannedConverted).toEqual({ amountMinor: 289_600, currency: 'BRL' });
    expect(before.weeklySavingsTarget).toEqual({ amountMinor: 57_900, currency: 'BRL' });
  });

  it('compara pagar em libras (£11,50 -> R$ 86,17 com IOF 3,5%) vs. reais na maquininha (R$ 91,40, diferença R$ 5,23)', () => {
    const comparison = compareRealPaymentCost({
      purchaseAmount: createMoney(1150, 'GBP'),
      fxRate,
    });

    expect(formatMoney(comparison.payInLocalCurrencyTotal, 'pt-BR')).toBe('R$ 86,17');
    expect(formatMoney(comparison.payInHomeCurrencyDccTotal, 'pt-BR')).toBe('R$ 91,40');
    expect(formatMoney(comparison.difference, 'pt-BR')).toBe('R$ 5,23');
    expect(comparison.recommendedChoice).toBe('local');
    expect(comparison.isEstimate).toBe(true);
  });
});
