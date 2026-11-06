import { CurrencyCode, Money } from '../money';

export interface PriceTagOcrSample {
  readonly id: string;
  readonly storeName: string;
  readonly rawText: string;
  /** Confiança do motor OCR de 0.0 a 1.0 */
  readonly ocrConfidence?: number;
}

export interface ParsedPriceTag {
  readonly rawText: string;
  readonly itemName: string;
  readonly detectedMoney: Money;
  readonly matchedPriceToken: string;
  /** Confiança entre 0.0 e 1.0 */
  readonly confidence: number;
  /** Verdadeiro quando a confiança é baixa (< 0.8), exigindo confirmação do usuário (Seção 4.4) */
  readonly needsConfirmation: boolean;
}

/**
 * Interface isolada de OCR para permitir troca de biblioteca nativa (ML Kit / Vision)
 * e testes determinísticos com imagens/textos de exemplo (Etapa 4).
 */
export interface PriceTagOcrEngine {
  recognizePriceTag(
    input: string | PriceTagOcrSample,
    defaultCurrency?: CurrencyCode,
  ): Promise<ParsedPriceTag | null>;
}
