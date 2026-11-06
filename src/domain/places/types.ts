import { FxRate, Money } from '../money';
import { PriceVoteChoice } from '../sync';

export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

export interface BoundingBox {
  readonly minLat: number;
  readonly maxLat: number;
  readonly minLng: number;
  readonly maxLng: number;
}

export type PlaceCategory = 'meal_deal' | 'padaria' | 'mercado' | 'street_food';

export interface Place {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly geo: GeoPoint;
  readonly category: PlaceCategory;
  readonly city: string;
}

export interface PlacePricePoint {
  readonly id: string;
  readonly placeId: string;
  readonly itemName: string;
  readonly price: Money;
  readonly confirmations: number;
  readonly lastConfirmedAt: string;
}

export interface CheapFoodOption {
  readonly place: Place;
  readonly pricePoint: PlacePricePoint;
  readonly distanceMeters: number;
  readonly walkMinutes: number;
  readonly convertedPrice: Money;
  /** Economia em relação à opção mais próxima (quando esta opção é mais barata) */
  readonly savingsOriginal: Money | null;
  readonly isBestValue: boolean;
}

export interface WalkComparisonSummary {
  readonly nearestOption: CheapFoodOption;
  readonly betterOption: CheapFoodOption;
  readonly extraWalkMinutes: number;
  readonly savingsOriginal: Money;
  readonly message: string;
}

export interface PlacesAreaSearchParams {
  readonly userLocation: GeoPoint;
  readonly boundingBox?: BoundingBox;
  readonly maxPriceMinor?: number;
  readonly fxRate: FxRate;
}

export interface PlacesAreaSearchResult {
  readonly options: readonly CheapFoodOption[];
  readonly comparison: WalkComparisonSummary | null;
}

export interface PlacesApi {
  searchPlacesByArea(params: PlacesAreaSearchParams): Promise<PlacesAreaSearchResult>;
  registerPriceVote(params: {
    pricePointId: string;
    userId: string;
    vote: PriceVoteChoice;
  }): Promise<PlacePricePoint>;
}
