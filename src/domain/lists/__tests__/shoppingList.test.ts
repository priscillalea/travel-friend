import {
  EXAMPLE_LIST_ID,
  InMemoryShoppingListStorage,
  parseUserPriceToMinor,
  ShoppingListService,
} from '../index';
import { FakeFxRateProvider, FxRateRepository } from '../../money';

describe('Listas com conversão de moeda — Etapa 3 (Seção 4.1 e Critério MVP)', () => {
  function createSetup() {
    const provider = new FakeFxRateProvider();
    const fxRepository = new FxRateRepository({ provider });
    const storage = new InMemoryShoppingListStorage();
    const service = new ShoppingListService({ storage, fxRepository });
    return { provider, fxRepository, storage, service };
  }

  it('carrega a lista inicial Primark Oxford Street com 4 itens totalizando £11,50 (R$ 83,26)', async () => {
    const { service } = createSetup();
    await service.seedExampleListIfEmpty();

    const view = await service.getListView(EXAMPLE_LIST_ID);
    expect(view.list.storeName).toBe('Primark Oxford Street');
    expect(view.totalItemsCount).toBe(4);
    expect(view.totalOriginal).toEqual({ amountMinor: 1150, currency: 'GBP' });
    expect(view.totalConverted).toEqual({ amountMinor: 8326, currency: 'BRL' });
  });

  it('atende ao critério de aceite do MVP: adiciona 20 itens em modo avião com total convertido exato ao centavo', async () => {
    const { provider, fxRepository, service } = createSetup();

    // Carrega cotação em cache antes de entrar em modo avião
    await fxRepository.getRate('GBP', 'BRL');
    provider.setOfflineFailure(true);

    const list = await service.createList({
      id: 'mvp-20-items',
      storeName: 'Tesco Express (Modo Avião)',
      sourceCurrency: 'GBP',
      targetCurrency: 'BRL',
    });

    for (let i = 1; i <= 20; i++) {
      await service.addItem({
        listId: list.id,
        name: `Item offline ${i}`,
        quantity: 1,
        unitPriceMinor: 250, // £2,50 cada
      });
    }

    const view = await service.getListView(list.id);
    expect(view.items).toHaveLength(20);
    expect(view.totalItemsCount).toBe(20);
    // 20 * £2,50 = £50,00 (5000 pence)
    expect(view.totalOriginal).toEqual({ amountMinor: 5000, currency: 'GBP' });
    // £50,00 * 7,24 = R$ 362,00 (36200 centavos)
    expect(view.totalConverted).toEqual({ amountMinor: 36200, currency: 'BRL' });
  });

  it('congela a cotação da lista (cotacao_congelada) impedindo variações futuras', async () => {
    const { provider, service } = createSetup();
    await service.seedExampleListIfEmpty();

    // Congela na cotação inicial de 7.24
    await service.toggleFreezeRate(EXAMPLE_LIST_ID);

    // Mesmo se a cotação subir para 8.00 no provedor, a lista congelada mantém 7.24
    provider.setRate('GBP', 'BRL', '8.00', '2026-11-06T12:00:00.000Z');
    const frozenView = await service.getListView(EXAMPLE_LIST_ID);
    expect(frozenView.isRateFrozen).toBe(true);
    expect(frozenView.activeRate.rateText).toBe('7.24');
    expect(frozenView.totalConverted.amountMinor).toBe(8326);

    // Ao descongelar, passa a usar a cotação nova (ou do cache se dentro do TTL)
    await service.toggleFreezeRate(EXAMPLE_LIST_ID);
    const unfrozenView = await service.getListView(EXAMPLE_LIST_ID);
    expect(unfrozenView.isRateFrozen).toBe(false);
  });

  it('inverte o par de moedas da lista e converte entradas de preço do usuário sem float', async () => {
    const { service } = createSetup();
    await service.seedExampleListIfEmpty();

    expect(parseUserPriceToMinor('2,50')).toBe(250);
    expect(parseUserPriceToMinor('£12.99')).toBe(1299);
    expect(() => parseUserPriceToMinor('abc')).toThrow(RangeError);

    const invertedList = await service.invertCurrencies(EXAMPLE_LIST_ID);
    expect(invertedList.sourceCurrency).toBe('BRL');
    expect(invertedList.targetCurrency).toBe('GBP');
  });
});
