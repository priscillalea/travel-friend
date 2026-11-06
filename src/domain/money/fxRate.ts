import { divideAndRoundBigInt, parseDecimalToFraction } from './money';
import { CurrencyCode, FxRate } from './types';

export function formatPair(
  base: CurrencyCode,
  quote: CurrencyCode,
): `${CurrencyCode}/${CurrencyCode}` {
  return `${base}/${quote}`;
}

/**
 * Cria um FxRate validado com carimbo de tempo ISO-8601.
 */
export function createFxRate(
  base: CurrencyCode,
  quote: CurrencyCode,
  rateInput: string | number,
  obtainedAt: string | Date = new Date(),
): FxRate {
  const rateText = typeof rateInput === 'number' ? rateInput.toString() : rateInput.trim();
  parseDecimalToFraction(rateText);
  const numericRate = Number(rateText);
  const timestamp = typeof obtainedAt === 'string' ? obtainedAt : obtainedAt.toISOString();

  if (Number.isNaN(Date.parse(timestamp))) {
    throw new RangeError(`Carimbo de tempo inválido em FxRate: "${timestamp}".`);
  }

  return Object.freeze({
    pair: formatPair(base, quote),
    base,
    quote,
    rateText,
    rate: numericRate,
    obtainedAt: timestamp,
  });
}

/**
 * Inverte um par de cotação (ex: GBP/BRL -> BRL/GBP) mantendo precisão fixa de 8 casas decimais
 * e preservando o carimbo de tempo original.
 */
export function invertFxRate(fxRate: FxRate, precisionDecimals = 8): FxRate {
  const { numerator, denominator } = parseDecimalToFraction(fxRate.rateText);
  const scale = 10n ** BigInt(precisionDecimals);
  const scaledInverse = divideAndRoundBigInt(denominator * scale, numerator, 'HALF_UP');
  const intPart = scaledInverse / scale;
  const fracPart = (scaledInverse % scale).toString().padStart(precisionDecimals, '0');
  const trimmedFrac = fracPart.replace(/0+$/, '');
  const inverseText = trimmedFrac.length > 0 ? `${intPart}.${trimmedFrac}` : `${intPart}`;

  return createFxRate(fxRate.quote, fxRate.base, inverseText, fxRate.obtainedAt);
}

/**
 * Calcula a idade da cotação em minutos a partir do seu carimbo de tempo.
 */
export function getFxRateAgeMinutes(fxRate: FxRate, now: Date = new Date()): number {
  const obtainedMs = Date.parse(fxRate.obtainedAt);
  const diffMs = Math.max(0, now.getTime() - obtainedMs);
  return Math.floor(diffMs / 60_000);
}

/**
 * Interface plugável para provedores de cotação (remoto, mock ou fixture).
 */
export interface FxRateProvider {
  fetchRate(base: CurrencyCode, quote: CurrencyCode): Promise<FxRate>;
}

/**
 * Interface de armazenamento para o cache local de cotações (memória ou SQLite).
 */
export interface FxRateCacheStore {
  get(pair: `${CurrencyCode}/${CurrencyCode}`): Promise<FxRate | null>;
  set(rate: FxRate): Promise<void>;
  getAll(): Promise<FxRate[]>;
  clear(): Promise<void>;
}

export class InMemoryFxRateCacheStore implements FxRateCacheStore {
  private readonly store = new Map<`${CurrencyCode}/${CurrencyCode}`, FxRate>();

  async get(pair: `${CurrencyCode}/${CurrencyCode}`): Promise<FxRate | null> {
    return this.store.get(pair) ?? null;
  }

  async set(rate: FxRate): Promise<void> {
    this.store.set(rate.pair, rate);
  }

  async getAll(): Promise<FxRate[]> {
    return Array.from(this.store.values());
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Cotações ILUSTRATIVAS de exemplo para testes e fallback offline inicial.
 * (Marcadas claramente como fixture conforme docs/TROCADO_SPEC.md).
 */
export const EXAMPLE_FX_FIXTURES: Readonly<
  Record<string, { rateText: string; obtainedAt: string }>
> = Object.freeze({
  'GBP/BRL': { rateText: '7.24', obtainedAt: '2026-11-06T09:00:00.000Z' },
  'EUR/BRL': { rateText: '6.15', obtainedAt: '2026-11-06T09:00:00.000Z' },
  'USD/BRL': { rateText: '5.75', obtainedAt: '2026-11-06T09:00:00.000Z' },
  'GBP/EUR': { rateText: '1.18', obtainedAt: '2026-11-06T09:00:00.000Z' },
});

/**
 * Provedor falso configurável para testes automatizados e fixtures offline.
 */
export class FakeFxRateProvider implements FxRateProvider {
  private readonly rates = new Map<`${CurrencyCode}/${CurrencyCode}`, FxRate>();
  private shouldFail = false;

  constructor(
    initialFixtures: Record<string, { rateText: string; obtainedAt: string }> = EXAMPLE_FX_FIXTURES,
  ) {
    for (const [pairKey, value] of Object.entries(initialFixtures)) {
      const [base, quote] = pairKey.split('/') as [CurrencyCode, CurrencyCode];
      const fx = createFxRate(base, quote, value.rateText, value.obtainedAt);
      this.rates.set(fx.pair, fx);
    }
  }

  setRate(
    base: CurrencyCode,
    quote: CurrencyCode,
    rateInput: string | number,
    obtainedAt?: string | Date,
  ): FxRate {
    const fx = createFxRate(base, quote, rateInput, obtainedAt);
    this.rates.set(fx.pair, fx);
    return fx;
  }

  setOfflineFailure(offline: boolean): void {
    this.shouldFail = offline;
  }

  async fetchRate(base: CurrencyCode, quote: CurrencyCode): Promise<FxRate> {
    if (this.shouldFail) {
      throw new Error('FakeFxRateProvider: sem conexão de rede simulada.');
    }

    if (base === quote) {
      return createFxRate(base, quote, '1', new Date().toISOString());
    }

    const direct = this.rates.get(formatPair(base, quote));
    if (direct) {
      return direct;
    }

    const inverse = this.rates.get(formatPair(quote, base));
    if (inverse) {
      return invertFxRate(inverse);
    }

    throw new Error(`Cotação de exemplo não encontrada para o par ${base}/${quote}.`);
  }
}

export type FetchLike = (url: string) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

interface AwesomeApiEntry {
  bid?: string;
  create_date?: string;
  timestamp?: string;
}

interface FrankfurterResponse {
  date?: string;
  rates?: Record<string, number>;
}

/**
 * Provedor de cotação comercial em tempo real (mesma cotação comercial exibida no Google):
 * 1. Tenta AwesomeAPI (economia.awesomeapi.com.br — atualizada a cada 30s, sem chave)
 * 2. Tenta Frankfurter / Banco Central Europeu (api.frankfurter.dev) como segundo provedor
 * 3. Faz fallback opcional para FakeFxRateProvider quando totalmente offline sem cache prévio.
 */
export class LiveFxRateProvider implements FxRateProvider {
  private readonly fetchFn: FetchLike;
  private readonly fallbackProvider: FxRateProvider | null;

  constructor(options?: { fetchFn?: FetchLike; fallbackProvider?: FxRateProvider | null }) {
    this.fetchFn = options?.fetchFn ?? (globalThis.fetch as unknown as FetchLike);
    this.fallbackProvider =
      options?.fallbackProvider !== undefined ? options.fallbackProvider : new FakeFxRateProvider();
  }

  async fetchRate(base: CurrencyCode, quote: CurrencyCode): Promise<FxRate> {
    if (base === quote) {
      return createFxRate(base, quote, '1', new Date().toISOString());
    }

    // 1. Tenta AwesomeAPI (câmbio comercial em tempo real)
    try {
      const url = `https://economia.awesomeapi.com.br/json/last/${base}-${quote}`;
      const response = await this.fetchFn(url);
      if (response.ok) {
        const data = (await response.json()) as Record<string, AwesomeApiEntry>;
        const entry = data[`${base}${quote}`];
        if (entry?.bid) {
          const obtainedAt = entry.timestamp
            ? new Date(Number(entry.timestamp) * 1000).toISOString()
            : new Date().toISOString();
          return createFxRate(base, quote, entry.bid, obtainedAt);
        }
      }
    } catch {
      // Prossegue para o segundo provedor
    }

    // 2. Tenta Frankfurter (Banco Central Europeu)
    try {
      const url = `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${quote}`;
      const response = await this.fetchFn(url);
      if (response.ok) {
        const data = (await response.json()) as FrankfurterResponse;
        const rateVal = data.rates?.[quote];
        if (typeof rateVal === 'number' && rateVal > 0) {
          return createFxRate(base, quote, rateVal.toString(), new Date().toISOString());
        }
      }
    } catch {
      // Prossegue para o fallback offline se configurado
    }

    if (this.fallbackProvider) {
      return this.fallbackProvider.fetchRate(base, quote);
    }

    throw new Error(`Não foi possível obter a cotação online para ${base}/${quote}.`);
  }
}

export interface FxRateLookupResult {
  readonly fxRate: FxRate;
  readonly source: 'provider' | 'cache';
  readonly isStale: boolean;
}

export interface FxRateRepositoryOptions {
  provider: FxRateProvider;
  cache?: FxRateCacheStore;
  /** Tempo máximo em ms antes de considerar o cache defasado (padrão: 60 min) */
  ttlMs?: number;
}

/**
 * Repositório de cotações Offline-First com cache local e carimbo de tempo.
 */
export class FxRateRepository {
  private readonly provider: FxRateProvider;
  private readonly cache: FxRateCacheStore;
  private readonly ttlMs: number;

  constructor(options: FxRateRepositoryOptions) {
    this.provider = options.provider;
    this.cache = options.cache ?? new InMemoryFxRateCacheStore();
    this.ttlMs = options.ttlMs ?? 60 * 60 * 1000;
  }

  async getCachedRate(base: CurrencyCode, quote: CurrencyCode): Promise<FxRate | null> {
    const direct = await this.cache.get(formatPair(base, quote));
    if (direct) {
      return direct;
    }
    const inverse = await this.cache.get(formatPair(quote, base));
    if (inverse) {
      return invertFxRate(inverse);
    }
    return null;
  }

  async saveRateToCache(fxRate: FxRate): Promise<void> {
    await this.cache.set(fxRate);
  }

  async getRate(
    base: CurrencyCode,
    quote: CurrencyCode,
    options?: { forceRefresh?: boolean; now?: Date },
  ): Promise<FxRateLookupResult> {
    const now = options?.now ?? new Date();
    const cached = await this.getCachedRate(base, quote);

    if (cached && !options?.forceRefresh) {
      const ageMs = Math.max(0, now.getTime() - Date.parse(cached.obtainedAt));
      if (ageMs <= this.ttlMs) {
        return {
          fxRate: cached,
          source: 'cache',
          isStale: false,
        };
      }
    }

    try {
      const fresh = await this.provider.fetchRate(base, quote);
      await this.cache.set(fresh);
      return {
        fxRate: fresh,
        source: 'provider',
        isStale: false,
      };
    } catch (err) {
      if (cached) {
        return {
          fxRate: cached,
          source: 'cache',
          isStale: true,
        };
      }
      throw err;
    }
  }
}
