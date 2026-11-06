import { createMoney } from '../money';
import {
  OfflinePack,
  PricePointSummary,
  PriceVoteChoice,
  PriceVoteRecord,
  SyncConnectionStatus,
  SyncMutation,
  VersionedEntity,
} from './types';

/**
 * Resolução de conflito Last-Write-Wins (LWW) para entidades gerais (Seção 5, Princípio 1):
 * "último a escrever vence, exceto votos de preço".
 * Em caso de empate exato de timestamp, prioriza o registro local para nunca perder edição offline.
 */
export function resolveLastWriteWins<TData>(
  localEntity: VersionedEntity<TData>,
  remoteEntity: VersionedEntity<TData>,
): VersionedEntity<TData> {
  const localMs = Date.parse(localEntity.updatedAt);
  const remoteMs = Date.parse(remoteEntity.updatedAt);

  if (Number.isNaN(localMs) || Number.isNaN(remoteMs)) {
    throw new RangeError('Timestamps inválidos na resolução de conflito LWW.');
  }

  return localMs >= remoteMs ? localEntity : remoteEntity;
}

/**
 * Resolução aditiva para PriceVote (Etapa 5):
 * "exceto PriceVote, que é aditivo" — une votos locais e remotos deduplicando apenas por ID do voto,
 * somando confirmações e relatos de mudança sem descartar votos concorrentes.
 */
export function mergeAdditivePriceVotes(
  basePoint: PricePointSummary,
  existingVotes: readonly PriceVoteRecord[],
  incomingVotes: readonly PriceVoteRecord[],
): {
  mergedVotes: PriceVoteRecord[];
  updatedSummary: PricePointSummary;
} {
  const voteMap = new Map<string, PriceVoteRecord>();
  for (const vote of existingVotes) {
    voteMap.set(vote.id, vote);
  }

  let addedConfirmations = 0;
  let addedChanges = 0;
  let latestTimestamp = basePoint.lastUpdatedAt;

  for (const incoming of incomingVotes) {
    if (!voteMap.has(incoming.id)) {
      voteMap.set(incoming.id, incoming);
      if (incoming.vote === 'confirm') {
        addedConfirmations += 1;
      } else {
        addedChanges += 1;
      }
      if (Date.parse(incoming.createdAt) > Date.parse(latestTimestamp)) {
        latestTimestamp = incoming.createdAt;
      }
    }
  }

  const mergedVotes = Array.from(voteMap.values()).sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );

  const updatedSummary: PricePointSummary = {
    ...basePoint,
    confirmationsCount: basePoint.confirmationsCount + addedConfirmations,
    changesReportedCount: basePoint.changesReportedCount + addedChanges,
    lastConfirmedLabel: addedConfirmations > 0 ? 'agora mesmo' : basePoint.lastConfirmedLabel,
    lastUpdatedAt: latestTimestamp,
  };

  return { mergedVotes, updatedSummary };
}

/**
 * Pacote offline ILUSTRATIVO de Londres conforme docs/design/trocado_v2_3_offline.png.
 */
export const EXAMPLE_LONDON_OFFLINE_PACK: OfflinePack = Object.freeze({
  id: 'pack-london-v1',
  city: 'Londres',
  version: '2026.11',
  sizeMb: 86,
  placesCount: 214,
  downloadedAt: '2026-11-06T08:00:00.000Z',
  status: 'downloaded',
});

/**
 * Ponto de preço ILUSTRATIVO da comunidade conforme docs/design/trocado_v2_3_offline.png:
 * "Greggs, Wardour St · Ainda custa £2,99? · Última confirmação há 3 dias · 41 pessoas"
 */
export const EXAMPLE_GREGGS_PRICE_POINT: PricePointSummary = Object.freeze({
  id: 'pp-greggs-wardour-st',
  placeName: 'Greggs, Wardour St',
  itemDescription: 'Breakfast Roll + Café',
  price: createMoney(299, 'GBP'),
  confirmationsCount: 41,
  changesReportedCount: 0,
  lastConfirmedLabel: 'há 3 dias',
  lastUpdatedAt: '2026-11-03T10:00:00.000Z',
});

/**
 * Fila de sincronização em segundo plano (Offline-First).
 */
export class SyncQueueService {
  private queue: SyncMutation[] = [];
  private connectionStatus: SyncConnectionStatus = 'offline';
  private packs: OfflinePack[] = [EXAMPLE_LONDON_OFFLINE_PACK];
  private pricePoint: PricePointSummary = EXAMPLE_GREGGS_PRICE_POINT;
  private votes: PriceVoteRecord[] = [];
  private counter = 0;

  getConnectionStatus(): SyncConnectionStatus {
    return this.connectionStatus;
  }

  setConnectionStatus(status: SyncConnectionStatus): void {
    this.connectionStatus = status;
  }

  getOfflinePacks(): readonly OfflinePack[] {
    return this.packs;
  }

  getPendingMutations(): readonly SyncMutation[] {
    return this.queue;
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  getPricePoint(): PricePointSummary {
    return this.pricePoint;
  }

  enqueueMutation<TPayload>(mutation: Omit<SyncMutation<TPayload>, 'id'>): SyncMutation<TPayload> {
    const record: SyncMutation<TPayload> = {
      ...mutation,
      id: `sync-${Date.now()}-${++this.counter}`,
    };

    // Para entidades LWW (não-PriceVote), substitui mutação pendente anterior da mesma entidade se mais recente
    if (record.entityType !== 'price_vote') {
      const existingIdx = this.queue.findIndex(
        (m) => m.entityType === record.entityType && m.entityId === record.entityId,
      );
      if (existingIdx >= 0) {
        const prev = this.queue[existingIdx];
        const winner = resolveLastWriteWins(
          { id: record.entityId, updatedAt: record.updatedAt, data: record },
          { id: prev.entityId, updatedAt: prev.updatedAt, data: prev as SyncMutation<TPayload> },
        );
        this.queue[existingIdx] = winner.data;
        return winner.data;
      }
    }

    this.queue.push(record);
    return record;
  }

  /**
   * Registra um voto de preço localmente (sempre aditivo) e o adiciona na fila de sincronização.
   */
  submitPriceVote(
    vote: PriceVoteChoice,
    userId = 'local-traveler',
    now: Date = new Date(),
  ): PricePointSummary {
    const newVote: PriceVoteRecord = {
      id: `vote-${now.getTime()}-${++this.counter}`,
      pricePointId: this.pricePoint.id,
      userId,
      vote,
      createdAt: now.toISOString(),
    };

    const { mergedVotes, updatedSummary } = mergeAdditivePriceVotes(this.pricePoint, this.votes, [
      newVote,
    ]);
    this.votes = mergedVotes;
    this.pricePoint = updatedSummary;

    this.enqueueMutation({
      entityType: 'price_vote',
      entityId: newVote.id,
      updatedAt: newVote.createdAt,
      payload: newVote,
    });

    return this.pricePoint;
  }

  /**
   * Processa a fila em segundo plano quando há conexão.
   */
  async flushQueue(): Promise<{ syncedCount: number; remainingCount: number }> {
    if (this.connectionStatus === 'offline') {
      return { syncedCount: 0, remainingCount: this.queue.length };
    }

    this.connectionStatus = 'syncing';
    const syncedCount = this.queue.length;
    this.queue = [];
    this.connectionStatus = 'online';

    return {
      syncedCount,
      remainingCount: 0,
    };
  }
}
