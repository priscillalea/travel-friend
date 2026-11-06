import { CurrencyCode, FxRate, Money } from '../money';

export interface ShoppingList {
  readonly id: string;
  readonly tripId: string;
  readonly storeName: string;
  /** Moeda da etiqueta na loja (ex: GBP) */
  readonly sourceCurrency: CurrencyCode;
  /** Moeda em que o turista quer enxergar (ex: BRL) */
  readonly targetCurrency: CurrencyCode;
  /** Cotação congelada opcional para a lista */
  readonly frozenRate: FxRate | null;
  readonly updatedAt: string;
}

export interface ListItem {
  readonly id: string;
  readonly listId: string;
  readonly name: string;
  readonly quantity: number;
  /** Preço unitário salvo sempre na menor unidade da moeda original (nunca float) */
  readonly unitPriceMinor: number;
  readonly currency: CurrencyCode;
}

export interface ComputedListItem {
  readonly item: ListItem;
  readonly unitOriginal: Money;
  readonly lineOriginal: Money;
  readonly lineConverted: Money;
}

export interface ShoppingListView {
  readonly list: ShoppingList;
  readonly activeRate: FxRate;
  readonly isRateFrozen: boolean;
  readonly items: readonly ComputedListItem[];
  readonly totalItemsCount: number;
  readonly totalOriginal: Money;
  readonly totalConverted: Money;
}

export interface AddListItemInput {
  readonly listId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPriceMinor: number;
  readonly currency?: CurrencyCode;
}

export interface ShoppingListStorage {
  getList(id: string): Promise<ShoppingList | null>;
  saveList(list: ShoppingList): Promise<void>;
  getItems(listId: string): Promise<ListItem[]>;
  saveItem(item: ListItem): Promise<void>;
  deleteItem(itemId: string): Promise<void>;
}
