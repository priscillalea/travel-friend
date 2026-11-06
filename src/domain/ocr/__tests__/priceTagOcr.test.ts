import {
  DevicePriceTagOcrEngine,
  EXAMPLE_PRICE_TAG_SAMPLES,
  extractMonetaryAmountFromText,
  parsePriceTagText,
} from '../index';

describe('Escanear etiqueta — OCR no dispositivo (Etapa 4 e Critério MVP)', () => {
  it('extrai valores monetários nos formatos £2.50, 2,50, £2 e R$ 18,10 como inteiros na menor unidade', () => {
    const dotFormat = extractMonetaryAmountFromText('Gorro de malha\n£2.50', 'GBP');
    expect(dotFormat?.money).toEqual({ amountMinor: 250, currency: 'GBP' });
    expect(dotFormat?.hasExplicitSymbol).toBe(true);

    const commaNoSymbol = extractMonetaryAmountFromText('Sacola\n2,50', 'GBP');
    expect(commaNoSymbol?.money).toEqual({ amountMinor: 250, currency: 'GBP' });
    expect(commaNoSymbol?.hasExplicitSymbol).toBe(false);

    const wholePound = extractMonetaryAmountFromText('Camiseta\n£2', 'GBP');
    expect(wholePound?.money).toEqual({ amountMinor: 200, currency: 'GBP' });

    const brlFormat = extractMonetaryAmountFromText('Protetor solar R$ 18,10', 'GBP');
    expect(brlFormat?.money).toEqual({ amountMinor: 1810, currency: 'BRL' });
  });

  it('marca needsConfirmation=true quando a confiança do OCR é baixa (< 0.8)', () => {
    const highConf = parsePriceTagText('Gorro de malha\n£2.50', 'GBP', 0.96);
    expect(highConf?.needsConfirmation).toBe(false);
    expect(highConf?.itemName).toBe('Gorro de malha');

    const lowConf = parsePriceTagText('Água mineral 500ml\n0,85', 'GBP', 0.72);
    expect(lowConf?.needsConfirmation).toBe(true);
    expect(lowConf?.detectedMoney).toEqual({ amountMinor: 85, currency: 'GBP' });
  });

  it('atende ao critério de aceite do MVP: escaneia 10 etiquetas com >= 80% de acerto no primeiro disparo', async () => {
    const engine = new DevicePriceTagOcrEngine();
    const expectedMinorAmounts = [250, 300, 400, 390, 85, 150, 600, 499, 250, 1990];

    let hits = 0;
    for (let i = 0; i < EXAMPLE_PRICE_TAG_SAMPLES.length; i++) {
      const sample = EXAMPLE_PRICE_TAG_SAMPLES[i];
      const parsed = await engine.recognizePriceTag(sample, 'GBP');
      if (parsed && parsed.detectedMoney.amountMinor === expectedMinorAmounts[i]) {
        hits += 1;
      }
    }

    const accuracy = hits / EXAMPLE_PRICE_TAG_SAMPLES.length;
    expect(EXAMPLE_PRICE_TAG_SAMPLES).toHaveLength(10);
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
    expect(hits).toBe(10);
  });
});
