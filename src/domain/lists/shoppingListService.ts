import {
  assertMinorUnitInteger,
  convertMoney,
  createFxRate,
  createMoney,
  CurrencyCode,
  FxRate,
  FxRateRepository,
  invertFxRate,
  multiplyMoney,
  sumMoney,
} from '../money';
import {
  AddListItemInput,
  ComputedListItem,
  ListItem,
  ShoppingList,
  ShoppingListStorage,
  ShoppingListView,
} from './types';

/**
 * Armazenamento local em memória (usado em testes e como fallback imediato Offline-First).
 */
export class InMemoryShoppingListStorage implements ShoppingListStorage {
  private readonly lists = new Map<string, ShoppingList>();
  private readonly items = new Map<string, ListItem>();

  async getList(id: string): Promise<ShoppingList | null> {
    return this.lists.get(id) ?? null;
  }

  async saveList(list: ShoppingList): Promise<void> {
    this.lists.set(list.id, list);
  }

  async getItems(listId: string): Promise<ListItem[]> {
    const result: ListItem[] = [];
    for (const item of this.items.values()) {
      if (item.listId === listId) {
        result.push(item);
      }
    }
    return result;
  }

  async saveItem(item: ListItem): Promise<void> {
    this.items.set(item.id, item);
  }

  async deleteItem(itemId: string): Promise<void> {
    this.items.delete(itemId);
  }
}

/**
 * Dados ILUSTRATIVOS de exemplo (marcados como fixture conforme docs/TROCADO_SPEC.md).
 * Coerentes com as telas de design: Primark Oxford Street, 4 itens somando £11,50 (R$ 83,26 a 7,24).
 */
export const EXAMPLE_LIST_ID = 'list-primark-oxford-example';

export const EXAMPLE_SHOPPING_LIST_FIXTURE: ShoppingList = Object.freeze({
  id: EXAMPLE_LIST_ID,
  tripId: 'trip-london-example',
  storeName: 'Primark Oxford Street',
  sourceCurrency: 'GBP',
  targetCurrency: 'BRL',
  frozenRate: null,
  updatedAt: '2026-11-06T09:00:00.000Z',
});

export const EXAMPLE_LIST_ITEMS_FIXTURE: readonly ListItem[] = Object.freeze([
  {
    id: 'item-example-1',
    listId: EXAMPLE_LIST_ID,
    name: 'Gorro de malha',
    quantity: 1,
    unitPriceMinor: 250, // £2,50
    currency: 'GBP',
  },
  {
    id: 'item-example-2',
    listId: EXAMPLE_LIST_ID,
    name: 'Pack 3 pares de meias térmicas',
    quantity: 1,
    unitPriceMinor: 350, // £3,50
    currency: 'GBP',
  },
  {
    id: 'item-example-3',
    listId: EXAMPLE_LIST_ID,
    name: 'Cachecol xadrez',
    quantity: 1,
    unitPriceMinor: 400, // £4,00
    currency: 'GBP',
  },
  {
    id: 'item-example-4',
    listId: EXAMPLE_LIST_ID,
    name: 'Sacola reutilizável',
    quantity: 1,
    unitPriceMinor: 150, // £1,50
    currency: 'GBP',
  },
]);

/**
 * Converte texto digitado pelo usuário (ex: "2,50" ou "2.50" ou "2") em inteiro na menor unidade (250).
 */
export function parseUserPriceToMinor(input: string): number {
  const cleaned = input
    .trim()
    .replace(/[£R$\s]/g, '')
    .replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new RangeError(`Preço inválido: "${input}". Digite um valor como 2,50.`);
  }
  const [majorStr, minorStr = ''] = cleaned.split('.');
  const paddedMinor = minorStr.padEnd(2, '0');
  const totalMinor = Number(majorStr) * 100 + Number(paddedMinor);
  assertMinorUnitInteger(totalMinor, 'unitPriceMinor');
  if (totalMinor <= 0) {
    throw new RangeError('O preço deve ser maior que zero.');
  }
  return totalMinor;
}

export class ShoppingListService {
  private readonly storage: ShoppingListStorage;
  private readonly fxRepository: FxRateRepository;
  private idCounter = 100;

  constructor(options: { storage: ShoppingListStorage; fxRepository: FxRateRepository }) {
    this.storage = options.storage;
    this.fxRepository = options.fxRepository;
  }

  async seedExampleListIfEmpty(listId = EXAMPLE_LIST_ID): Promise<void> {
    const existing = await this.storage.getList(listId);
    if (existing) {
      return;
    }
    await this.storage.saveList(EXAMPLE_SHOPPING_LIST_FIXTURE);
    for (const item of EXAMPLE_LIST_ITEMS_FIXTURE) {
      await this.storage.saveItem(item);
    }
  }

  async createList(params: {
    id?: string;
    tripId?: string;
    storeName: string;
    sourceCurrency: CurrencyCode;
    targetCurrency: CurrencyCode;
  }): Promise<ShoppingList> {
    const list: ShoppingList = {
      id: params.id ?? `list-${Date.now()}-${++this.idCounter}`,
      tripId: params.tripId ?? 'trip-london-example',
      storeName: params.storeName.trim() || 'Nova Lista',
      sourceCurrency: params.sourceCurrency,
      targetCurrency: params.targetCurrency,
      frozenRate: null,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.saveList(list);
    return list;
  }

  async addItem(input: AddListItemInput): Promise<ListItem> {
    const list = await this.storage.getList(input.listId);
    if (!list) {
      throw new Error(`Lista não encontrada: ${input.listId}`);
    }

    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error('O nome do item não pode ficar vazio.');
    }

    assertMinorUnitInteger(input.quantity, 'quantity');
    if (input.quantity < 1) {
      throw new RangeError('A quantidade deve ser pelo menos 1.');
    }

    assertMinorUnitInteger(input.unitPriceMinor, 'unitPriceMinor');
    if (input.unitPriceMinor <= 0) {
      throw new RangeError('O preço deve ser maior que zero.');
    }

    const item: ListItem = {
      id: `item-${Date.now()}-${++this.idCounter}`,
      listId: list.id,
      name: trimmedName,
      quantity: input.quantity,
      unitPriceMinor: input.unitPriceMinor,
      currency: input.currency ?? list.sourceCurrency,
    };

    await this.storage.saveItem(item);
    return item;
  }

  async updateItemQuantity(listId: string, itemId: string, delta: number): Promise<void> {
    const items = await this.storage.getItems(listId);
    const target = items.find((i) => i.id === itemId);
    if (!target) {
      return;
    }
    const nextQty = target.quantity + delta;
    if (nextQty <= 0) {
      await this.storage.deleteItem(itemId);
      return;
    }
    await this.storage.saveItem({
      ...target,
      quantity: nextQty,
    });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.storage.deleteItem(itemId);
  }

  /**
   * Inverte o par de moedas da lista ("Tenho" <-> "Quero ver em").
   * Os itens continuam salvos em sua moeda original e são convertidos na exibição.
   */
  async invertCurrencies(listId: string): Promise<ShoppingList> {
    const list = await this.storage.getList(listId);
    if (!list) {
      throw new Error(`Lista não encontrada: ${listId}`);
    }

    const invertedFrozen = list.frozenRate ? invertFxRate(list.frozenRate) : null;
    const updated: ShoppingList = {
      ...list,
      sourceCurrency: list.targetCurrency,
      targetCurrency: list.sourceCurrency,
      frozenRate: invertedFrozen,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.saveList(updated);
    return updated;
  }

  /**
   * Congela ou descongele a cotação da lista (Regra Seção 4.1).
   */
  async toggleFreezeRate(listId: string): Promise<ShoppingList> {
    const list = await this.storage.getList(listId);
    if (!list) {
      throw new Error(`Lista não encontrada: ${listId}`);
    }

    let nextFrozen: FxRate | null = null;
    if (!list.frozenRate) {
      const lookup = await this.fxRepository.getRate(list.sourceCurrency, list.targetCurrency);
      nextFrozen = lookup.fxRate;
    }

    const updated: ShoppingList = {
      ...list,
      frozenRate: nextFrozen,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.saveList(updated);
    return updated;
  }

  /**
   * Monta a visão calculada da lista convertendo os preços salvos na moeda original
   * na hora da exibição, com precisão ao centavo.
   */
  async getListView(listId: string): Promise<ShoppingListView> {
    const list = await this.storage.getList(listId);
    if (!list) {
      throw new Error(`Lista não encontrada: ${listId}`);
    }

    const activeRate =
      list.frozenRate ??
      (await this.fxRepository.getRate(list.sourceCurrency, list.targetCurrency)).fxRate;

    const rawItems = await this.storage.getItems(listId);

    const computedItems: ComputedListItem[] = [];
    const linesInSourceCurrency = [];

    for (const item of rawItems) {
      const unitOriginal = createMoney(item.unitPriceMinor, item.currency);
      const lineOriginal = multiplyMoney(unitOriginal, item.quantity);

      // Se o item já estiver na moeda de origem da lista, usa direto; caso a lista tenha sido invertida, converte.
      const lineInSource =
        item.currency === list.sourceCurrency
          ? lineOriginal
          : item.currency === list.targetCurrency
            ? convertMoney(lineOriginal, invertFxRate(activeRate))
            : lineOriginal;

      linesInSourceCurrency.push(lineInSource);

      const lineConverted =
        item.currency === list.targetCurrency
          ? lineOriginal
          : convertMoney(lineInSource, activeRate);

      computedItems.push({
        item,
        unitOriginal,
        lineOriginal,
        lineConverted,
      });
    }

    const totalOriginal = sumMoney(linesInSourceCurrency, list.sourceCurrency);
    const totalConverted =
      list.sourceCurrency === list.targetCurrency
        ? totalOriginal
        : convertMoney(totalOriginal, activeRate);

    const totalItemsCount = rawItems.reduce((acc, item) => acc + item.quantity, 0);

    return {
      list,
      activeRate,
      isRateFrozen: list.frozenRate !== null,
      items: computedItems,
      totalItemsCount,
      totalOriginal,
      totalConverted,
    };
  }
}

export function formatRateTimestamp(fxRate: FxRate): string {
  const date = new Date(fxRate.obtainedAt);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} UTC`;
}

export { createFxRate };
