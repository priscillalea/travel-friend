import {
  ConversionRecord,
  CurrencyCode,
  FxRate,
  Money,
  RoundingMode,
  SupportedLocale,
} from './types';

export const CURRENCY_MINOR_UNITS: Record<CurrencyCode, number> = {
  BRL: 2,
  GBP: 2,
  EUR: 2,
  USD: 2,
  CHF: 2,
  JPY: 0,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  BRL: 'R$',
  GBP: '£',
  EUR: '€',
  USD: 'US$',
  CHF: 'CHF',
  JPY: '¥',
};

/**
 * Valida que um valor está representado como inteiro seguro (sem ponto flutuante).
 */
export function assertMinorUnitInteger(amountMinor: number, label = 'amountMinor'): void {
  if (typeof amountMinor !== 'number' || !Number.isFinite(amountMinor)) {
    throw new TypeError(`${label} deve ser um número finito.`);
  }
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError(
      `${label} (${amountMinor}) deve ser um inteiro na menor unidade da moeda (nunca float).`,
    );
  }
}

/**
 * Cria um objeto Money garantindo que o valor seja um inteiro na menor unidade.
 */
export function createMoney(amountMinor: number, currency: CurrencyCode): Money {
  assertMinorUnitInteger(amountMinor);
  const normalized = Object.is(amountMinor, -0) ? 0 : amountMinor;
  return Object.freeze({
    amountMinor: normalized,
    currency,
  });
}

/**
 * Soma dois valores na mesma moeda. Lança erro se as moedas forem diferentes.
 */
export function addMoney(a: Money, b: Money): Money {
  assertMinorUnitInteger(a.amountMinor, 'a.amountMinor');
  assertMinorUnitInteger(b.amountMinor, 'b.amountMinor');
  if (a.currency !== b.currency) {
    throw new Error(
      `Não é possível somar moedas diferentes sem conversão: ${a.currency} e ${b.currency}.`,
    );
  }
  return createMoney(a.amountMinor + b.amountMinor, a.currency);
}

/**
 * Subtrai dois valores na mesma moeda.
 */
export function subtractMoney(a: Money, b: Money): Money {
  assertMinorUnitInteger(a.amountMinor, 'a.amountMinor');
  assertMinorUnitInteger(b.amountMinor, 'b.amountMinor');
  if (a.currency !== b.currency) {
    throw new Error(
      `Não é possível subtrair moedas diferentes sem conversão: ${a.currency} e ${b.currency}.`,
    );
  }
  return createMoney(a.amountMinor - b.amountMinor, a.currency);
}

/**
 * Soma uma lista de valores monetários na mesma moeda.
 */
export function sumMoney(items: readonly Money[], currency: CurrencyCode): Money {
  let totalMinor = 0;
  for (const item of items) {
    assertMinorUnitInteger(item.amountMinor, 'item.amountMinor');
    if (item.currency !== currency) {
      throw new Error(
        `Moeda incompatível na soma: esperado ${currency}, recebido ${item.currency}.`,
      );
    }
    totalMinor += item.amountMinor;
  }
  return createMoney(totalMinor, currency);
}

/**
 * Multiplica um Money por uma quantidade inteira (ex: 3 unidades de um item).
 */
export function multiplyMoney(money: Money, quantity: number): Money {
  assertMinorUnitInteger(money.amountMinor, 'money.amountMinor');
  assertMinorUnitInteger(quantity, 'quantity');
  return createMoney(money.amountMinor * quantity, money.currency);
}

/**
 * Converte uma string ou número decimal (ex: "7.24" ou 7.248593) em fração exata BigInt.
 */
export function parseDecimalToFraction(rateInput: string | number): {
  numerator: bigint;
  denominator: bigint;
} {
  const raw = typeof rateInput === 'number' ? rateInput.toString() : rateInput.trim();
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    throw new RangeError(`Cotação inválida: "${raw}". Deve ser um decimal positivo.`);
  }
  const [intPart, fracPart = ''] = raw.split('.');
  const numerator = BigInt(intPart + fracPart);
  const denominator = 10n ** BigInt(fracPart.length);
  if (numerator <= 0n) {
    throw new RangeError(`Cotação deve ser maior que zero: "${raw}".`);
  }
  return { numerator, denominator };
}

/**
 * Divide dois BigInts aplicando arredondamento explícito.
 * - HALF_UP: arredondamento comercial padrão (>= 0.5 arredonda para longe do zero)
 * - HALF_EVEN: arredondamento bancário (empate em 0.5 vai para o par)
 * - FLOOR: trunca em direção a -infinito
 * - CEIL: arredonda em direção a +infinito
 */
export function divideAndRoundBigInt(
  numerator: bigint,
  denominator: bigint,
  roundingMode: RoundingMode = 'HALF_UP',
): bigint {
  if (denominator <= 0n) {
    throw new RangeError('Denominador deve ser positivo.');
  }

  const isNegative = numerator < 0n;
  const absNum = isNegative ? -numerator : numerator;
  const quotient = absNum / denominator;
  const remainder = absNum % denominator;

  if (remainder === 0n) {
    return isNegative ? -quotient : quotient;
  }

  let roundedAbs = quotient;
  const twiceRemainder = remainder * 2n;

  switch (roundingMode) {
    case 'HALF_UP': {
      if (twiceRemainder >= denominator) {
        roundedAbs = quotient + 1n;
      }
      break;
    }
    case 'HALF_EVEN': {
      if (twiceRemainder > denominator) {
        roundedAbs = quotient + 1n;
      } else if (twiceRemainder === denominator && quotient % 2n !== 0n) {
        roundedAbs = quotient + 1n;
      }
      break;
    }
    case 'FLOOR': {
      if (isNegative) {
        roundedAbs = quotient + 1n;
      }
      break;
    }
    case 'CEIL': {
      if (!isNegative) {
        roundedAbs = quotient + 1n;
      }
      break;
    }
  }

  return isNegative ? -roundedAbs : roundedAbs;
}

/**
 * Converte um valor Money usando uma cotação (FxRate ou valor decimal) com precisão fixa BigInt
 * e arredondamento explícito (padrão: HALF_UP).
 */
export function convertMoney(
  money: Money,
  rateOrFx: FxRate | string | number,
  targetCurrency?: CurrencyCode,
  roundingMode: RoundingMode = 'HALF_UP',
): Money {
  assertMinorUnitInteger(money.amountMinor, 'money.amountMinor');

  let rateText: string | number;
  let destinationCurrency: CurrencyCode;

  if (typeof rateOrFx === 'object' && rateOrFx !== null && 'rateText' in rateOrFx) {
    if (rateOrFx.base !== money.currency) {
      throw new Error(
        `Moeda de origem (${money.currency}) não corresponde à base da cotação (${rateOrFx.base}).`,
      );
    }
    if (targetCurrency && targetCurrency !== rateOrFx.quote) {
      throw new Error(
        `Moeda de destino (${targetCurrency}) não corresponde ao destino da cotação (${rateOrFx.quote}).`,
      );
    }
    rateText = rateOrFx.rateText;
    destinationCurrency = rateOrFx.quote;
  } else {
    if (!targetCurrency) {
      throw new Error('targetCurrency é obrigatório quando a cotação não é um objeto FxRate.');
    }
    rateText = rateOrFx;
    destinationCurrency = targetCurrency;
  }

  const { numerator: rateNum, denominator: rateDen } = parseDecimalToFraction(rateText);
  const fromDecimals = CURRENCY_MINOR_UNITS[money.currency];
  const toDecimals = CURRENCY_MINOR_UNITS[destinationCurrency];

  let totalNumerator = BigInt(money.amountMinor) * rateNum;
  let totalDenominator = rateDen;

  if (toDecimals > fromDecimals) {
    totalNumerator *= 10n ** BigInt(toDecimals - fromDecimals);
  } else if (fromDecimals > toDecimals) {
    totalDenominator *= 10n ** BigInt(fromDecimals - toDecimals);
  }

  const convertedMinor = divideAndRoundBigInt(totalNumerator, totalDenominator, roundingMode);
  const asNumber = Number(convertedMinor);
  assertMinorUnitInteger(asNumber, 'convertedMinor');

  return createMoney(asNumber, destinationCurrency);
}

/**
 * Converte um valor Money e retorna o registro auditável com a cotação e carimbo de tempo.
 */
export function convertMoneyWithAudit(
  money: Money,
  fxRate: FxRate,
  roundingMode: RoundingMode = 'HALF_UP',
  now: Date = new Date(),
): ConversionRecord {
  const converted = convertMoney(money, fxRate, fxRate.quote, roundingMode);
  return Object.freeze({
    original: money,
    converted,
    fxRate,
    convertedAt: now.toISOString(),
  });
}

function formatIntegerWithThousands(value: number, thousandSeparator: string): string {
  const digits = Math.trunc(Math.abs(value)).toString();
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
}

/**
 * Formata um valor Money por locale ('pt-BR' ou 'en-GB') de forma determinística
 * e consistente em todas as plataformas (iOS, Android, Web e Node).
 */
export function formatMoney(money: Money, locale: SupportedLocale = 'pt-BR'): string {
  assertMinorUnitInteger(money.amountMinor, 'money.amountMinor');

  const isNegative = money.amountMinor < 0;
  const absMinor = Math.abs(money.amountMinor);
  const decimals = CURRENCY_MINOR_UNITS[money.currency];
  const symbol = CURRENCY_SYMBOLS[money.currency];

  const isPtBr = locale === 'pt-BR';
  const decimalSeparator = isPtBr ? ',' : '.';
  const thousandSeparator = isPtBr ? '.' : ',';

  const divisor = 10 ** decimals;
  const majorPart = Math.trunc(absMinor / divisor);
  const minorPart = absMinor % divisor;

  const formattedMajor = formatIntegerWithThousands(majorPart, thousandSeparator);
  const formattedMinor =
    decimals > 0 ? `${decimalSeparator}${minorPart.toString().padStart(decimals, '0')}` : '';

  const needsSpace = isPtBr && symbol.length > 1;
  const prefix = `${isNegative ? '-' : ''}${symbol}${needsSpace ? ' ' : ''}`;

  return `${prefix}${formattedMajor}${formattedMinor}`;
}
