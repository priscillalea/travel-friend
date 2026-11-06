import { convertMoney, createMoney, subtractMoney } from '../money';
import { PriceVoteChoice } from '../sync';
import {
  BoundingBox,
  CheapFoodOption,
  GeoPoint,
  Place,
  PlacePricePoint,
  PlacesApi,
  PlacesAreaSearchParams,
  PlacesAreaSearchResult,
  WalkComparisonSummary,
} from './types';

/**
 * Localização FICTÍCIA de referência do turista em Soho / Oxford Street, Londres.
 */
export const EXAMPLE_USER_LOCATION_SOHO: GeoPoint = Object.freeze({
  lat: 51.5152,
  lng: -0.1365,
});

/**
 * Lugares FICTÍCIOS / ILUSTRATIVOS em Londres para o Mapa de Comida Barata (Seção 4.2 / Etapa 6).
 */
export const EXAMPLE_LONDON_PLACES_FIXTURE: readonly Place[] = Object.freeze([
  {
    id: 'place-boots-oxford-ficticio',
    name: 'Boots Oxford St (Exemplo)',
    address: 'Oxford Street, Soho',
    geo: { lat: 51.5159, lng: -0.1355 }, // ~2 min a pé
    category: 'meal_deal',
    city: 'Londres',
  },
  {
    id: 'place-greggs-wardour-ficticio',
    name: 'Greggs Wardour St (Exemplo)',
    address: 'Wardour St, Soho',
    geo: { lat: 51.5131, lng: -0.1342 }, // ~4 min a pé
    category: 'padaria',
    city: 'Londres',
  },
  {
    id: 'place-tesco-dean-ficticio',
    name: 'Tesco Express Dean St (Exemplo)',
    address: 'Dean Street, Soho',
    geo: { lat: 51.5121, lng: -0.1315 }, // ~7 min a pé (2 min + 5 min)
    category: 'meal_deal',
    city: 'Londres',
  },
  {
    id: 'place-aldi-tottenham-ficticio',
    name: 'Aldi Local Tottenham Ct (Exemplo)',
    address: 'Tottenham Court Rd',
    geo: { lat: 51.5178, lng: -0.1308 }, // ~7 min a pé
    category: 'mercado',
    city: 'Londres',
  },
  {
    id: 'place-borough-wrap-ficticio',
    name: 'Soho Falafel Wrap (Exemplo)',
    address: 'Berwick Street Market',
    geo: { lat: 51.5138, lng: -0.1351 }, // ~3 min a pé
    category: 'street_food',
    city: 'Londres',
  },
]);

export const EXAMPLE_LONDON_PRICE_POINTS_FIXTURE: readonly PlacePricePoint[] = Object.freeze([
  {
    id: 'pp-boots-meal-deal',
    placeId: 'place-boots-oxford-ficticio',
    itemName: 'Meal Deal (Sanduíche + Snack + Bebida)',
    price: createMoney(499, 'GBP'), // £4,99 (a 2 min a pé)
    confirmations: 19,
    lastConfirmedAt: '2026-11-05T14:00:00.000Z',
  },
  {
    id: 'pp-greggs-roll-deal',
    placeId: 'place-greggs-wardour-ficticio',
    itemName: 'Breakfast Roll + Café quente',
    price: createMoney(299, 'GBP'), // £2,99 (a 4 min a pé)
    confirmations: 41,
    lastConfirmedAt: '2026-11-03T10:00:00.000Z',
  },
  {
    id: 'pp-tesco-clubcard-deal',
    placeId: 'place-tesco-dean-ficticio',
    itemName: 'Meal Deal Completo',
    price: createMoney(340, 'GBP'), // £3,40 (a 7 min a pé)
    confirmations: 64,
    lastConfirmedAt: '2026-11-06T08:30:00.000Z',
  },
  {
    id: 'pp-aldi-sandwich-pack',
    placeId: 'place-aldi-tottenham-ficticio',
    itemName: 'Sanduíche Triplo + Suco',
    price: createMoney(269, 'GBP'), // £2,69 (a 7 min a pé)
    confirmations: 52,
    lastConfirmedAt: '2026-11-06T07:45:00.000Z',
  },
  {
    id: 'pp-soho-falafel',
    placeId: 'place-borough-wrap-ficticio',
    itemName: 'Falafel Wrap Grande',
    price: createMoney(650, 'GBP'), // £6,50
    confirmations: 28,
    lastConfirmedAt: '2026-11-04T12:20:00.000Z',
  },
]);

/**
 * Calcula distância aproximada em metros usando fórmula de Haversine.
 */
export function calculateDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const earthRadiusMeters = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;

  const distance = 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(h)));
  return Math.round(distance);
}

/**
 * Converte distância em metros para minutos de caminhada urbana (~75m/min com fator de rua 1.25).
 */
export function estimateWalkMinutes(distanceMeters: number): number {
  const streetDistance = distanceMeters * 1.25;
  return Math.max(1, Math.round(streetDistance / 75));
}

export function isWithinBoundingBox(point: GeoPoint, box: BoundingBox): boolean {
  return (
    point.lat >= box.minLat &&
    point.lat <= box.maxLat &&
    point.lng >= box.minLng &&
    point.lng <= box.maxLng
  );
}

/**
 * Implementação Offline-First / Mock da API de lugares e votos da comunidade (Etapa 6).
 */
export class LocalPlacesApiService implements PlacesApi {
  private readonly places = new Map<string, Place>();
  private readonly pricePoints = new Map<string, PlacePricePoint>();

  constructor(
    initialPlaces: readonly Place[] = EXAMPLE_LONDON_PLACES_FIXTURE,
    initialPricePoints: readonly PlacePricePoint[] = EXAMPLE_LONDON_PRICE_POINTS_FIXTURE,
  ) {
    for (const place of initialPlaces) {
      this.places.set(place.id, place);
    }
    for (const pp of initialPricePoints) {
      this.pricePoints.set(pp.id, pp);
    }
  }

  async searchPlacesByArea(params: PlacesAreaSearchParams): Promise<PlacesAreaSearchResult> {
    const { userLocation, boundingBox, maxPriceMinor, fxRate } = params;

    const candidates: Array<{
      place: Place;
      pricePoint: PlacePricePoint;
      distanceMeters: number;
      walkMinutes: number;
    }> = [];

    for (const pp of this.pricePoints.values()) {
      const place = this.places.get(pp.placeId);
      if (!place) continue;

      if (boundingBox && !isWithinBoundingBox(place.geo, boundingBox)) {
        continue;
      }

      if (maxPriceMinor !== undefined && pp.price.amountMinor > maxPriceMinor) {
        continue;
      }

      const distanceMeters = calculateDistanceMeters(userLocation, place.geo);
      const walkMinutes = estimateWalkMinutes(distanceMeters);
      candidates.push({ place, pricePoint: pp, distanceMeters, walkMinutes });
    }

    if (candidates.length === 0) {
      return { options: [], comparison: null };
    }

    // Encontra a opção mais próxima a pé
    const sortedByWalk = [...candidates].sort((a, b) => a.walkMinutes - b.walkMinutes);
    const nearest = sortedByWalk[0];

    // Calcula índice de custo-benefício considerando preço, caminhada e confirmações da comunidade
    const bestValueIds = new Set<string>();
    const cheaperWithHighConfirmations = candidates.filter(
      (c) => c.pricePoint.price.amountMinor <= 350 && c.pricePoint.confirmations >= 35,
    );
    for (const c of cheaperWithHighConfirmations) {
      bestValueIds.add(c.pricePoint.id);
    }

    const options: CheapFoodOption[] = sortedByWalk.map((c) => {
      const convertedPrice = convertMoney(c.pricePoint.price, fxRate);
      const isCheaperThanNearest =
        c.pricePoint.price.amountMinor < nearest.pricePoint.price.amountMinor;
      const savingsOriginal = isCheaperThanNearest
        ? subtractMoney(nearest.pricePoint.price, c.pricePoint.price)
        : null;

      return {
        place: c.place,
        pricePoint: c.pricePoint,
        distanceMeters: c.distanceMeters,
        walkMinutes: c.walkMinutes,
        convertedPrice,
        savingsOriginal,
        isBestValue: bestValueIds.has(c.pricePoint.id),
      };
    });

    // Monta o comparativo da Seção 4.2 ("Tens um meal deal a 2 min a pé. Se andares mais 5 min, há opções melhores.")
    const nearestOption = options[0];
    const betterCandidate = options.find(
      (opt) =>
        opt.walkMinutes > nearestOption.walkMinutes &&
        opt.isBestValue &&
        opt.pricePoint.price.amountMinor < nearestOption.pricePoint.price.amountMinor,
    );

    let comparison: WalkComparisonSummary | null = null;
    if (betterCandidate && betterCandidate.savingsOriginal) {
      const extraWalkMinutes = betterCandidate.walkMinutes - nearestOption.walkMinutes;
      comparison = {
        nearestOption,
        betterOption: betterCandidate,
        extraWalkMinutes,
        savingsOriginal: betterCandidate.savingsOriginal,
        message: `Tens um meal deal a ${nearestOption.walkMinutes} min a pé. Se andares mais ${extraWalkMinutes} min, há opções melhores.`,
      };
    }

    return { options, comparison };
  }

  async registerPriceVote(params: {
    pricePointId: string;
    userId: string;
    vote: PriceVoteChoice;
  }): Promise<PlacePricePoint> {
    const existing = this.pricePoints.get(params.pricePointId);
    if (!existing) {
      throw new Error(`PricePoint não encontrado: ${params.pricePointId}`);
    }

    const updated: PlacePricePoint = {
      ...existing,
      confirmations:
        params.vote === 'confirm' ? existing.confirmations + 1 : existing.confirmations,
      lastConfirmedAt: new Date().toISOString(),
    };
    this.pricePoints.set(updated.id, updated);
    return updated;
  }
}
