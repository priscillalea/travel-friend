import {
  addMoney,
  convertMoney,
  convertMoneyWithAudit,
  createFxRate,
  createMoney,
  divideAndRoundBigInt,
  FakeFxRateProvider,
  formatMoney,
  FxRateRepository,
  getFxRateAgeMinutes,
  invertFxRate,
  multiplyMoney,
  subtractMoney,
  sumMoney,
} from '../index';

describe('Módulo de dinheiro e câmbio (Etapa 2)', () => {
  describe('Money (inteiros na menor unidade)', () => {
    it('cria Money com inteiros válidos e rejeita ponto flutuante ou NaN', () => {
      const m = createMoney(250, 'GBP');
      expect(m).toEqual({ amountMinor: 250, currency: 'GBP' });

      expect(() => createMoney(2.5, 'GBP')).toThrow(RangeError);
      expect(() => createMoney(NaN, 'BRL')).toThrow(TypeError);
      expect(() => createMoney(Infinity, 'BRL')).toThrow(TypeError);
    });

    it('soma, subtrai e multiplica na mesma moeda e bloqueia moedas diferentes', () => {
      const a = createMoney(250, 'GBP');
      const b = createMoney(150, 'GBP');

      expect(addMoney(a, b)).toEqual({ amountMinor: 400, currency: 'GBP' });
      expect(subtractMoney(a, b)).toEqual({ amountMinor: 100, currency: 'GBP' });
      expect(multiplyMoney(a, 3)).toEqual({ amountMinor: 750, currency: 'GBP' });

      const brl = createMoney(1000, 'BRL');
      expect(() => addMoney(a, brl)).toThrow(/moedas diferentes/);
      expect(() => subtractMoney(a, brl)).toThrow(/moedas diferentes/);
      expect(() => multiplyMoney(a, 1.5)).toThrow(RangeError);
    });
  });

  describe('Conversão e arredondamento explícito (casos de borda)', () => {
    it('converte £2,50 x 7,24 para exatamente R$ 18,10 (1810 centavos)', () => {
      const gbp = createMoney(250, 'GBP');
      const fx = createFxRate('GBP', 'BRL', '7.24', '2026-11-06T10:00:00.000Z');
      const converted = convertMoney(gbp, fx);

      expect(converted).toEqual({ amountMinor: 1810, currency: 'BRL' });
      expect(formatMoney(converted, 'pt-BR')).toBe('R$ 18,10');
    });

    it('soma e converte corretamente uma lista de 20 itens sem erro de ponto flutuante', () => {
      const twentyItems = Array.from({ length: 20 }, (_, idx) =>
        createMoney(199 + (idx % 5) * 25, 'GBP'),
      );
      // 4 grupos de (199 + 224 + 249 + 274 + 299) = 4 * 1245 = 4980 pence (£49.80)
      const totalGbp = sumMoney(twentyItems, 'GBP');
      expect(totalGbp.amountMinor).toBe(4980);

      // 4980 * 7.24 = 36055.2 -> arredonda HALF_UP para 36055 centavos (R$ 360,55)
      const totalBrl = convertMoney(totalGbp, '7.24', 'BRL');
      expect(totalBrl).toEqual({ amountMinor: 36055, currency: 'BRL' });
    });

    it('lida com cotações de muitas casas decimais e modos de arredondamento explícitos', () => {
      const item = createMoney(333, 'GBP'); // £3.33
      // 333 * 7.24859381 = 2413.78173873 -> 2414 centavos em HALF_UP
      const halfUp = convertMoney(item, '7.24859381', 'BRL', 'HALF_UP');
      const floor = convertMoney(item, '7.24859381', 'BRL', 'FLOOR');
      const ceil = convertMoney(item, '7.24859381', 'BRL', 'CEIL');

      expect(halfUp.amountMinor).toBe(2414);
      expect(floor.amountMinor).toBe(2413);
      expect(ceil.amountMinor).toBe(2414);

      // Caso de empate exato 0.5: 15 / 10 = 1.5 e 25 / 10 = 2.5
      expect(divideAndRoundBigInt(15n, 10n, 'HALF_UP')).toBe(2n);
      expect(divideAndRoundBigInt(15n, 10n, 'HALF_EVEN')).toBe(2n);
      expect(divideAndRoundBigInt(25n, 10n, 'HALF_UP')).toBe(3n);
      expect(divideAndRoundBigInt(25n, 10n, 'HALF_EVEN')).toBe(2n);
    });

    it('registra auditoria com cotação e carimbo de tempo em convertMoneyWithAudit', () => {
      const gbp = createMoney(1150, 'GBP');
      const fx = createFxRate('GBP', 'BRL', '7.24', '2026-11-06T09:00:00.000Z');
      const now = new Date('2026-11-06T11:00:00.000Z');

      const record = convertMoneyWithAudit(gbp, fx, 'HALF_UP', now);
      expect(record.original).toEqual({ amountMinor: 1150, currency: 'GBP' });
      expect(record.converted).toEqual({ amountMinor: 8326, currency: 'BRL' });
      expect(record.fxRate.obtainedAt).toBe('2026-11-06T09:00:00.000Z');
      expect(record.convertedAt).toBe('2026-11-06T11:00:00.000Z');
    });
  });

  describe('Formatação por locale (pt-BR e en-GB)', () => {
    it('formata BRL e GBP conforme o Design System em pt-BR e en-GB', () => {
      const brl = createMoney(1810, 'BRL');
      const brlMilhar = createMoney(172300, 'BRL');
      const gbp = createMoney(250, 'GBP');

      expect(formatMoney(brl, 'pt-BR')).toBe('R$ 18,10');
      expect(formatMoney(brlMilhar, 'pt-BR')).toBe('R$ 1.723,00');
      expect(formatMoney(gbp, 'pt-BR')).toBe('£2,50');

      expect(formatMoney(gbp, 'en-GB')).toBe('£2.50');
      expect(formatMoney(brl, 'en-GB')).toBe('R$18.10');
      expect(formatMoney(brlMilhar, 'en-GB')).toBe('R$1,723.00');
    });
  });

  describe('Repositório FxRate, cache local e modo offline', () => {
    it('busca do provedor, salva em cache e usa fallback offline quando sem conexão', async () => {
      const provider = new FakeFxRateProvider();
      const repo = new FxRateRepository({
        provider,
        ttlMs: 60 * 60 * 1000, // 1 hora
      });

      const t0 = new Date('2026-11-06T09:30:00.000Z');
      const first = await repo.getRate('GBP', 'BRL', { now: t0 });
      expect(first.source).toBe('provider');
      expect(first.isStale).toBe(false);
      expect(first.fxRate.rateText).toBe('7.24');
      expect(getFxRateAgeMinutes(first.fxRate, t0)).toBe(30);

      // Dentro do TTL deve vir do cache sem bater no provedor
      const second = await repo.getRate('GBP', 'BRL', { now: t0 });
      expect(second.source).toBe('cache');
      expect(second.isStale).toBe(false);

      // Simula queda de internet após expirar TTL (2 horas depois)
      provider.setOfflineFailure(true);
      const tOffline = new Date('2026-11-06T11:30:00.000Z');
      const fallback = await repo.getRate('GBP', 'BRL', { now: tOffline });
      expect(fallback.source).toBe('cache');
      expect(fallback.isStale).toBe(true);
      expect(fallback.fxRate.rateText).toBe('7.24');
      expect(getFxRateAgeMinutes(fallback.fxRate, tOffline)).toBe(150);
    });

    it('inverte corretamente a cotação mantendo o carimbo de tempo', () => {
      const fx = createFxRate('GBP', 'BRL', '8', '2026-11-06T09:00:00.000Z');
      const inverted = invertFxRate(fx);

      expect(inverted.pair).toBe('BRL/GBP');
      expect(inverted.rateText).toBe('0.125');
      expect(inverted.obtainedAt).toBe('2026-11-06T09:00:00.000Z');
    });
  });
});

