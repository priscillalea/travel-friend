import { createFxRate } from '../../money';
import { EXAMPLE_USER_LOCATION_SOHO, LocalPlacesApiService } from '../index';

describe('Mapa de comida barata e API de lugares — Etapa 6 (Seção 4.2)', () => {
  const fxRate = createFxRate('GBP', 'BRL', '7.24', '2026-11-06T09:00:00.000Z');

  it('busca lugares por área e gera o comparativo "2 min vs. caminhada extra" com economia', async () => {
    const api = new LocalPlacesApiService();
    const result = await api.searchPlacesByArea({
      userLocation: EXAMPLE_USER_LOCATION_SOHO,
      fxRate,
    });

    expect(result.options.length).toBeGreaterThanOrEqual(4);
    expect(result.comparison).not.toBeNull();
    expect(result.comparison?.message).toMatch(
      /Tens um meal deal a \d+ min a pé\. Se andares mais \d+ min, há opções melhores\./,
    );
    expect(result.comparison?.savingsOriginal.amountMinor).toBeGreaterThan(0);

    // Verifica que existem opções marcadas como melhor custo-benefício (pin verde)
    const bestOptions = result.options.filter((o) => o.isBestValue);
    expect(bestOptions.length).toBeGreaterThan(0);
  });

  it('filtra lugares pelo teto de preço (ex: até £3,50)', async () => {
    const api = new LocalPlacesApiService();
    const filtered = await api.searchPlacesByArea({
      userLocation: EXAMPLE_USER_LOCATION_SOHO,
      maxPriceMinor: 350,
      fxRate,
    });

    expect(filtered.options.length).toBeGreaterThan(0);
    for (const opt of filtered.options) {
      expect(opt.pricePoint.price.amountMinor).toBeLessThanOrEqual(350);
    }
  });

  it('registra voto da comunidade incrementando confirmações no PricePoint', async () => {
    const api = new LocalPlacesApiService();
    const updated = await api.registerPriceVote({
      pricePointId: 'pp-greggs-roll-deal',
      userId: 'user-test',
      vote: 'confirm',
    });

    expect(updated.confirmations).toBe(42);
  });
});
