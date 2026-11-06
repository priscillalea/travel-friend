export type CurrencyCode = 'BRL' | 'GBP' | 'EUR' | 'USD' | 'CHF' | 'JPY';

export type SupportedLocale = 'pt-BR' | 'en-GB';

export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'FLOOR' | 'CEIL';

/**
 * Representação monetária imutável na menor unidade da moeda (centavos, pence, etc.).
 * Regra: nunca armazenar valores monetários em ponto flutuante.
 */
export interface Money {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

/**
 * Cotação com carimbo de tempo (Seção 5, Princípio 3).
 * Toda conversão registra qual cotação foi usada e quando foi obtida.
 */
export interface FxRate {
  /** Par formatado como "GBP/BRL" */
  readonly pair: `${CurrencyCode}/${CurrencyCode}`;
  readonly base: CurrencyCode;
  readonly quote: CurrencyCode;
  /** Representação decimal exata da taxa (ex: "7.24") */
  readonly rateText: string;
  /** Valor numérico para exibição */
  readonly rate: number;
  /** Timestamp ISO-8601 de quando a cotação foi obtida */
  readonly obtainedAt: string;
}

export interface ConversionRecord {
  readonly original: Money;
  readonly converted: Money;
  readonly fxRate: FxRate;
  readonly convertedAt: string;
}

