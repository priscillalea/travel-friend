import { assertMinorUnitInteger, createMoney, CurrencyCode, Money } from '../money';
import { ParsedPriceTag, PriceTagOcrEngine, PriceTagOcrSample } from './types';

export const LOW_CONFIDENCE_THRESHOLD = 0.8;

const SYMBOL_TO_CURRENCY: Record<string, CurrencyCode> = {
  '£': 'GBP',
  '€': 'EUR',
  R$: 'BRL',
  US$: 'USD',
  $: 'USD',
  CHF: 'CHF',
  '¥': 'JPY',
};

export interface ExtractedPriceMatch {
  readonly money: Money;
  readonly matchedToken: string;
  readonly hasExplicitSymbol: boolean;
}

/**
 * Extrai valor monetário de um texto OCR nos formatos:
 * - "£2.50", "£ 2,50", "R$ 18,10", "€12.90"
 * - "2,50", "2.50"
 * - "£2", "£15"
 * Sem usar ponto flutuante em nenhuma etapa.
 */
export function extractMonetaryAmountFromText(
  rawText: string,
  defaultCurrency: CurrencyCode = 'GBP',
): ExtractedPriceMatch | null {
  const normalized = rawText.replace(/\u00A0/g, ' ');

  // 1. Procura preço com símbolo explícito e casas decimais opcionais (ex: £2.50, £2,50, R$ 18,10, £2)
  const symbolRegex = /(R\$|US\$|CHF|£|€|\$|¥)\s*(\d{1,6})(?:[.,](\d{1,2}))?(?!\d)/i;
  const symbolMatch = normalized.match(symbolRegex);

  if (symbolMatch) {
    const rawSymbol = symbolMatch[1].toUpperCase();
    const majorDigits = symbolMatch[2];
    const minorDigits = symbolMatch[3];
    const currency = SYMBOL_TO_CURRENCY[rawSymbol] ?? defaultCurrency;

    const majorVal = Number(majorDigits);
    const minorVal = minorDigits ? Number(minorDigits.padEnd(2, '0')) : 0;
    const amountMinor = currency === 'JPY' ? majorVal : majorVal * 100 + minorVal;
    assertMinorUnitInteger(amountMinor, 'ocrAmountMinor');

    if (amountMinor > 0) {
      return {
        money: createMoney(amountMinor, currency),
        matchedToken: symbolMatch[0].trim(),
        hasExplicitSymbol: true,
      };
    }
  }

  // 2. Procura número decimal sem símbolo de moeda (ex: "2,50" ou "2.50")
  const decimalRegex = /(?<!\d)(\d{1,5})[.,](\d{2})(?!\d)/;
  const decimalMatch = normalized.match(decimalRegex);

  if (decimalMatch) {
    const majorVal = Number(decimalMatch[1]);
    const minorVal = Number(decimalMatch[2]);
    const amountMinor = majorVal * 100 + minorVal;
    assertMinorUnitInteger(amountMinor, 'ocrAmountMinor');

    if (amountMinor > 0) {
      return {
        money: createMoney(amountMinor, defaultCurrency),
        matchedToken: decimalMatch[0].trim(),
        hasExplicitSymbol: false,
      };
    }
  }

  return null;
}

/**
 * Extrai o nome do produto limpando a linha do preço e códigos de barras.
 */
export function extractItemNameFromTagText(
  rawText: string,
  matchedPriceToken: string,
  fallbackName = 'Item escaneado',
): string {
  const withoutPrice = rawText.replace(matchedPriceToken, '');
  const lines = withoutPrice
    .split(/\r?\n/)
    .map((line) => line.replace(/\b\d{6,}\b/g, '').trim())
    .filter((line) => line.length >= 2 && !/^(size|tam|sku|ref|cod)[:\s]/i.test(line));

  if (lines.length === 0) {
    return fallbackName;
  }

  return lines[0];
}

/**
 * Analisa o texto completo de uma etiqueta de preço.
 */
export function parsePriceTagText(
  rawText: string,
  defaultCurrency: CurrencyCode = 'GBP',
  ocrConfidence?: number,
): ParsedPriceTag | null {
  const extracted = extractMonetaryAmountFromText(rawText, defaultCurrency);
  if (!extracted) {
    return null;
  }

  const baseConfidence =
    ocrConfidence !== undefined ? ocrConfidence : extracted.hasExplicitSymbol ? 0.94 : 0.75;

  const clampedConfidence = Math.max(0, Math.min(1, baseConfidence));
  const itemName = extractItemNameFromTagText(rawText, extracted.matchedToken);

  return Object.freeze({
    rawText,
    itemName,
    detectedMoney: extracted.money,
    matchedPriceToken: extracted.matchedToken,
    confidence: clampedConfidence,
    needsConfirmation: clampedConfidence < LOW_CONFIDENCE_THRESHOLD,
  });
}

/**
 * Motor OCR no dispositivo baseado no parser determinístico de etiquetas.
 */
export class DevicePriceTagOcrEngine implements PriceTagOcrEngine {
  async recognizePriceTag(
    input: string | PriceTagOcrSample,
    defaultCurrency: CurrencyCode = 'GBP',
  ): Promise<ParsedPriceTag | null> {
    if (typeof input === 'string') {
      return parsePriceTagText(input, defaultCurrency);
    }
    return parsePriceTagText(input.rawText, defaultCurrency, input.ocrConfidence);
  }
}

/**
 * 10 etiquetas ILUSTRATIVAS de exemplo para validar o critério de aceite do MVP
 * (10 etiquetas com pelo menos 80% de acerto no primeiro disparo) e testar na tela de câmera.
 */
export const EXAMPLE_PRICE_TAG_SAMPLES: readonly PriceTagOcrSample[] = Object.freeze([
  {
    id: 'tag-1-gorro',
    storeName: 'Primark Oxford Street',
    rawText: 'Gorro de malha\n£2.50',
    ocrConfidence: 0.96,
  },
  {
    id: 'tag-2-luvas',
    storeName: 'Primark Oxford Street',
    rawText: 'Luvas touch lã\n£3,00',
    ocrConfidence: 0.93,
  },
  {
    id: 'tag-3-camiseta',
    storeName: 'Primark Oxford Street',
    rawText: 'Camiseta básica algodão\n£4',
    ocrConfidence: 0.91,
  },
  {
    id: 'tag-4-meal-deal',
    storeName: 'Tesco Express',
    rawText: 'Tesco Meal Deal\n£3.90',
    ocrConfidence: 0.95,
  },
  {
    id: 'tag-5-agua',
    storeName: 'Boots Pharmacy',
    rawText: 'Água mineral 500ml\n0,85',
    ocrConfidence: 0.72, // Baixa confiança (sem símbolo £) -> pede confirmação!
  },
  {
    id: 'tag-6-chocolate',
    storeName: 'Sainsbury Local',
    rawText: 'Cadbury Dairy Milk 110g\n£1.50',
    ocrConfidence: 0.94,
  },
  {
    id: 'tag-7-guarda-chuva',
    storeName: 'Primark Oxford Street',
    rawText: 'Guarda-chuva compacto\n£6.00',
    ocrConfidence: 0.92,
  },
  {
    id: 'tag-8-adaptador',
    storeName: 'Argos',
    rawText: 'Adaptador tomada UK\n£4.99',
    ocrConfidence: 0.95,
  },
  {
    id: 'tag-9-ima',
    storeName: 'Cool Britannia Souvenirs',
    rawText: 'Ímã Big Ben Londres\n2.50',
    ocrConfidence: 0.74, // Baixa confiança -> pede confirmação
  },
  {
    id: 'tag-10-moletom',
    storeName: 'Uniqlo Regent Street',
    rawText: 'Moletom fleece térmico\n£19.90',
    ocrConfidence: 0.97,
  },
]);
