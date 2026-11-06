import { Money } from '../money';

export interface OfflinePack {
  readonly id: string;
  readonly city: string;
  readonly version: string;
  readonly sizeMb: number;
  readonly placesCount: number;
  readonly downloadedAt: string;
  readonly status: 'downloaded' | 'updating' | 'not_downloaded';
}

export type PriceVoteChoice = 'confirm' | 'changed';

export interface PriceVoteRecord {
  readonly id: string;
  readonly pricePointId: string;
  readonly userId: string;
  readonly vote: PriceVoteChoice;
  readonly reportedPriceMinor?: number;
  readonly createdAt: string;
}

export interface PricePointSummary {
  readonly id: string;
  readonly placeName: string;
  readonly itemDescription: string;
  readonly price: Money;
  readonly confirmationsCount: number;
  readonly changesReportedCount: number;
  readonly lastConfirmedLabel: string;
  readonly lastUpdatedAt: string;
}

export type SyncEntityType = 'shopping_list' | 'list_item' | 'expense' | 'price_vote';

export interface SyncMutation<TPayload = unknown> {
  readonly id: string;
  readonly entityType: SyncEntityType;
  readonly entityId: string;
  readonly updatedAt: string;
  readonly payload: TPayload;
}

export interface VersionedEntity<TData = Record<string, unknown>> {
  readonly id: string;
  readonly updatedAt: string;
  readonly data: TData;
}

export type SyncConnectionStatus = 'offline' | 'online' | 'syncing';
