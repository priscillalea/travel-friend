import {
  EXAMPLE_GREGGS_PRICE_POINT,
  mergeAdditivePriceVotes,
  PriceVoteRecord,
  resolveLastWriteWins,
  SyncQueueService,
} from '../index';

describe('Offline, pacotes e sincronização — Etapa 5 (Seção 4.5b)', () => {
  it('aplica política Last-Write-Wins (último a escrever vence) para entidades gerais', () => {
    const older = {
      id: 'list-1',
      updatedAt: '2026-11-06T10:00:00.000Z',
      data: { storeName: 'Primark Antiga' },
    };
    const newer = {
      id: 'list-1',
      updatedAt: '2026-11-06T10:05:00.000Z',
      data: { storeName: 'Primark Oxford Street' },
    };

    expect(resolveLastWriteWins(older, newer)).toEqual(newer);
    expect(resolveLastWriteWins(newer, older)).toEqual(newer);
  });

  it('aplica política aditiva para PriceVote (nunca sobrescreve votos concorrentes)', () => {
    const existingVotes: PriceVoteRecord[] = [
      {
        id: 'vote-1',
        pricePointId: EXAMPLE_GREGGS_PRICE_POINT.id,
        userId: 'user-a',
        vote: 'confirm',
        createdAt: '2026-11-06T10:00:00.000Z',
      },
    ];

    const incomingVotes: PriceVoteRecord[] = [
      {
        id: 'vote-1', // Duplicado: deve ser ignorado na soma
        pricePointId: EXAMPLE_GREGGS_PRICE_POINT.id,
        userId: 'user-a',
        vote: 'confirm',
        createdAt: '2026-11-06T10:00:00.000Z',
      },
      {
        id: 'vote-2',
        pricePointId: EXAMPLE_GREGGS_PRICE_POINT.id,
        userId: 'user-b',
        vote: 'confirm',
        createdAt: '2026-11-06T10:02:00.000Z',
      },
      {
        id: 'vote-3',
        pricePointId: EXAMPLE_GREGGS_PRICE_POINT.id,
        userId: 'user-c',
        vote: 'changed',
        createdAt: '2026-11-06T10:03:00.000Z',
      },
    ];

    const { mergedVotes, updatedSummary } = mergeAdditivePriceVotes(
      EXAMPLE_GREGGS_PRICE_POINT,
      existingVotes,
      incomingVotes,
    );

    expect(mergedVotes).toHaveLength(3);
    // 41 confirmações originais + 1 nova confirmação ('vote-2') = 42
    expect(updatedSummary.confirmationsCount).toBe(42);
    expect(updatedSummary.changesReportedCount).toBe(1);
    expect(updatedSummary.lastConfirmedLabel).toBe('agora mesmo');
  });

  it('enfileira votos e mutações offline e esvazia a fila quando a conexão volta', async () => {
    const syncService = new SyncQueueService();
    expect(syncService.getConnectionStatus()).toBe('offline');
    expect(syncService.getOfflinePacks()[0].city).toBe('Londres');

    // Dois votos offline são mantidos aditivamente na fila
    syncService.submitPriceVote('confirm', 'user-1', new Date('2026-11-06T11:00:00.000Z'));
    const summaryAfterTwo = syncService.submitPriceVote(
      'confirm',
      'user-2',
      new Date('2026-11-06T11:01:00.000Z'),
    );

    expect(summaryAfterTwo.confirmationsCount).toBe(43);
    expect(syncService.getPendingCount()).toBe(2);

    // Duas edições na mesma lista mantêm apenas a mais recente (LWW) na fila
    syncService.enqueueMutation({
      entityType: 'shopping_list',
      entityId: 'list-1',
      updatedAt: '2026-11-06T11:00:00.000Z',
      payload: { name: 'V1' },
    });
    syncService.enqueueMutation({
      entityType: 'shopping_list',
      entityId: 'list-1',
      updatedAt: '2026-11-06T11:05:00.000Z',
      payload: { name: 'V2' },
    });

    expect(syncService.getPendingCount()).toBe(3);

    // Enquanto offline, flushQueue não remove itens
    const offlineFlush = await syncService.flushQueue();
    expect(offlineFlush.syncedCount).toBe(0);
    expect(offlineFlush.remainingCount).toBe(3);

    // Ao voltar o sinal, sincroniza todos os itens pendentes
    syncService.setConnectionStatus('online');
    const onlineFlush = await syncService.flushQueue();
    expect(onlineFlush.syncedCount).toBe(3);
    expect(onlineFlush.remainingCount).toBe(0);
  });
});
