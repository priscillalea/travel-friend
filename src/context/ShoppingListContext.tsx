import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  EXAMPLE_LIST_ID,
  InMemoryShoppingListStorage,
  ShoppingListService,
  ShoppingListView,
} from '../domain/lists';
import { CurrencyCode, FxRateRepository, LiveFxRateProvider } from '../domain/money';

interface ShoppingListContextValue {
  listView: ShoppingListView | null;
  addItem: (params: {
    name: string;
    unitPriceMinor: number;
    quantity?: number;
    currency?: CurrencyCode;
  }) => Promise<void>;
  incrementItem: (itemId: string) => Promise<void>;
  decrementItem: (itemId: string) => Promise<void>;
  invertCurrencies: () => Promise<void>;
  toggleFreezeRate: () => Promise<void>;
  refreshLiveRate: () => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const { service, fxRepository } = useMemo(() => {
    const fxRepo = new FxRateRepository({
      provider: new LiveFxRateProvider(),
    });
    const listService = new ShoppingListService({
      storage: new InMemoryShoppingListStorage(),
      fxRepository: fxRepo,
    });
    return { service: listService, fxRepository: fxRepo };
  }, []);

  const [listView, setListView] = useState<ShoppingListView | null>(null);

  const refreshView = useCallback(async () => {
    const view = await service.getListView(EXAMPLE_LIST_ID);
    setListView(view);
  }, [service]);

  useEffect(() => {
    let active = true;
    service
      .seedExampleListIfEmpty(EXAMPLE_LIST_ID)
      .then(() => service.getListView(EXAMPLE_LIST_ID))
      .then((view) => {
        if (active) {
          setListView(view);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [service]);

  const addItem = useCallback(
    async (params: {
      name: string;
      unitPriceMinor: number;
      quantity?: number;
      currency?: CurrencyCode;
    }) => {
      await service.addItem({
        listId: EXAMPLE_LIST_ID,
        name: params.name,
        quantity: params.quantity ?? 1,
        unitPriceMinor: params.unitPriceMinor,
        currency: params.currency,
      });
      await refreshView();
    },
    [service, refreshView],
  );

  const incrementItem = useCallback(
    async (itemId: string) => {
      await service.updateItemQuantity(EXAMPLE_LIST_ID, itemId, 1);
      await refreshView();
    },
    [service, refreshView],
  );

  const decrementItem = useCallback(
    async (itemId: string) => {
      await service.updateItemQuantity(EXAMPLE_LIST_ID, itemId, -1);
      await refreshView();
    },
    [service, refreshView],
  );

  const invertCurrencies = useCallback(async () => {
    await service.invertCurrencies(EXAMPLE_LIST_ID);
    await refreshView();
  }, [service, refreshView]);

  const toggleFreezeRate = useCallback(async () => {
    await service.toggleFreezeRate(EXAMPLE_LIST_ID);
    await refreshView();
  }, [service, refreshView]);

  const refreshLiveRate = useCallback(async () => {
    if (!listView) return;
    await fxRepository.getRate(listView.list.sourceCurrency, listView.list.targetCurrency, {
      forceRefresh: true,
    });
    await refreshView();
  }, [fxRepository, listView, refreshView]);

  const value = useMemo(
    () => ({
      listView,
      addItem,
      incrementItem,
      decrementItem,
      invertCurrencies,
      toggleFreezeRate,
      refreshLiveRate,
    }),
    [
      listView,
      addItem,
      incrementItem,
      decrementItem,
      invertCurrencies,
      toggleFreezeRate,
      refreshLiveRate,
    ],
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList(): ShoppingListContextValue {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) {
    throw new Error('useShoppingList deve ser usado dentro de um ShoppingListProvider.');
  }
  return ctx;
}
