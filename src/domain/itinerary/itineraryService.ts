import { createMoney, sumMoney } from '../money';
import {
  BookingItem,
  DayPlanView,
  PlanStop,
  ScreenBrightnessAdapter,
  SecondaryVoucher,
  TicketPass,
  TourActivity,
  TourFilter,
  TripDay,
} from './types';

export const EXAMPLE_TRIP_DAYS: readonly TripDay[] = Object.freeze([
  { id: 'day-12', dayNumber: 1, dayOfMonth: '12', dateIso: '2026-12-12' },
  { id: 'day-13', dayNumber: 2, dayOfMonth: '13', dateIso: '2026-12-13' },
  { id: 'day-14', dayNumber: 3, dayOfMonth: '14', dateIso: '2026-12-14' },
  { id: 'day-15', dayNumber: 4, dayOfMonth: '15', dateIso: '2026-12-15' },
  { id: 'day-16', dayNumber: 5, dayOfMonth: '16', dateIso: '2026-12-16' },
]);

/**
 * Paradas ILUSTRATIVAS do Dia 2 (13 dez) conforme docs/design/trocado_v3_0_plano.png:
 * 09:00 Café da manhã (£4) + 10:30 Tower of London (£34, Reservado, 12 min a pé) +
 * 13:00 Borough Market (£8) + 15:30 Tower Bridge (Grátis) = £46.
 */
export const EXAMPLE_DAY_13_STOPS: readonly PlanStop[] = Object.freeze([
  {
    id: 'stop-1',
    dayId: 'day-13',
    time: '09:00',
    title: 'Café da manhã',
    subtitle: 'Padaria perto do hotel',
    cost: createMoney(400, 'GBP'), // £4
  },
  {
    id: 'stop-2',
    dayId: 'day-13',
    time: '10:30',
    title: 'Tower of London',
    subtitle: 'Ingresso reservado',
    cost: createMoney(3400, 'GBP'), // £34
    isReserved: true,
    walkMinutesToNext: 12,
  },
  {
    id: 'stop-3',
    dayId: 'day-13',
    time: '13:00',
    title: 'Borough Market',
    subtitle: 'Almoço barato',
    cost: createMoney(800, 'GBP'), // £8
  },
  {
    id: 'stop-4',
    dayId: 'day-13',
    time: '15:30',
    title: 'Tower Bridge',
    subtitle: 'Passeio a pé',
    cost: createMoney(0, 'GBP'), // Grátis
  },
]);

/**
 * Passeios ILUSTRATIVOS conforme docs/design/trocado_v3_1_passeios.png.
 */
export const EXAMPLE_TOURS_FIXTURE: readonly TourActivity[] = Object.freeze([
  {
    id: 'tour-tower-of-london',
    title: 'Tower of London',
    durationLabel: '3 h',
    policyLabel: 'cancelamento grátis',
    price: createMoney(3400, 'GBP'),
    priceButtonLabel: '£34 +',
    isFree: false,
    isOutdoor: false,
    bannerTone: 'blue',
  },
  {
    id: 'tour-british-museum',
    title: 'Museu gratuito: British Museum',
    durationLabel: '2 h',
    policyLabel: 'sem ingresso',
    price: createMoney(0, 'GBP'),
    priceButtonLabel: 'Grátis +',
    isFree: true,
    isOutdoor: false,
    bannerTone: 'green',
  },
  {
    id: 'tour-soho-walking',
    title: 'Tour a pé pelo Soho',
    durationLabel: '2 h 30',
    policyLabel: 'gorjeta voluntária',
    price: createMoney(0, 'GBP'),
    priceButtonLabel: '£0 +',
    isFree: true,
    isOutdoor: true,
    bannerTone: 'gold',
  },
  {
    id: 'tour-greenwich-boat',
    title: 'Barco pelo Tâmisa até Greenwich',
    durationLabel: '1 h 30',
    policyLabel: 'cancelamento grátis',
    price: createMoney(1400, 'GBP'),
    priceButtonLabel: '£14 +',
    isFree: false,
    isOutdoor: true,
    bannerTone: 'blue',
  },
]);

/**
 * Reservas ILUSTRATIVAS conforme docs/design/trocado_v3_2_reservas.png.
 */
export const EXAMPLE_BOOKINGS_FIXTURE: readonly BookingItem[] = Object.freeze([
  {
    id: 'booking-flight-rec-lhr',
    type: 'flight',
    headerLabel: 'Voo de ida · 12 dez',
    status: 'confirmed',
    flightOrigin: 'REC',
    flightDestination: 'LHR',
    title: 'REC → LHR',
    subtitle: 'Saída 21:40 · chegada 11:20 (+1)',
  },
  {
    id: 'booking-hotel-soho',
    type: 'hotel',
    headerLabel: 'Hotel · 5 noites',
    status: 'confirmed',
    title: 'Hotel Soho Lane',
    subtitle: 'Check-in 14h · cancelamento grátis até 8 dez',
  },
  {
    id: 'booking-insurance-basic',
    type: 'insurance',
    headerLabel: 'Seguro viagem',
    status: 'pending',
    title: 'Cobertura básica',
    subtitle: 'Faltam os dados do segundo viajante',
    actionLabel: 'Completar agora',
  },
]);

/**
 * Ticket principal e comprovantes offline conforme docs/design/trocado_v3_3_tickets.png.
 */
export const EXAMPLE_MAIN_TICKET: TicketPass = Object.freeze({
  id: 'ticket-tower-of-london',
  categoryLabel: 'Ingresso · 2 pessoas',
  title: 'Tower of London',
  dateTimeLocationLabel: '13 dez · 10:30 · Portão principal',
  qrPayload: 'TROCADO-OFFLINE-TICKET:TOWER-OF-LONDON:2026-12-13T10:30Z:PAX2',
  offlineOk: true,
  qrMatrix: [
    [1, 1, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0],
    [1, 1, 0, 0, 1],
  ] as const,
});

export const EXAMPLE_SECONDARY_VOUCHERS: readonly SecondaryVoucher[] = Object.freeze([
  {
    id: 'voucher-flight',
    title: 'Voo REC → LHR',
    subtitle: '12 dez · 21:40',
    badgeLabel: 'Cartão',
  },
  {
    id: 'voucher-hotel',
    title: 'Hotel Soho Lane',
    subtitle: 'Voucher de check-in',
    badgeLabel: 'Voucher',
  },
]);

export function filterTours(
  tours: readonly TourActivity[],
  filter: TourFilter,
): readonly TourActivity[] {
  switch (filter) {
    case 'gratis':
      return tours.filter((t) => t.isFree || t.price.amountMinor === 0);
    case 'ate_20':
      return tours.filter((t) => t.price.amountMinor <= 2000);
    case 'ar_livre':
      return tours.filter((t) => t.isOutdoor);
    case 'todos':
    default:
      return tours;
  }
}

export class ItineraryService {
  private stopsByDay = new Map<string, PlanStop[]>();
  private bookings: BookingItem[] = [...EXAMPLE_BOOKINGS_FIXTURE];
  private counter = 0;

  constructor() {
    for (const day of EXAMPLE_TRIP_DAYS) {
      this.stopsByDay.set(day.id, day.id === 'day-13' ? [...EXAMPLE_DAY_13_STOPS] : []);
    }
  }

  getDays(): readonly TripDay[] {
    return EXAMPLE_TRIP_DAYS;
  }

  getDayPlanView(dayId: string): DayPlanView {
    const day = EXAMPLE_TRIP_DAYS.find((d) => d.id === dayId) ?? EXAMPLE_TRIP_DAYS[1];
    const stops = this.stopsByDay.get(day.id) ?? [];
    const totalPlanned = sumMoney(
      stops.map((s) => s.cost),
      'GBP',
    );
    return {
      day,
      stops,
      totalPlanned,
    };
  }

  addTourToDayPlan(dayId: string, tour: TourActivity, time = '17:00'): DayPlanView {
    const existing = this.stopsByDay.get(dayId) ?? [];
    const newStop: PlanStop = {
      id: `stop-tour-${Date.now()}-${++this.counter}`,
      dayId,
      time,
      title: tour.title,
      subtitle: `${tour.durationLabel} · ${tour.policyLabel}`,
      cost: tour.price,
      isReserved: !tour.isFree,
    };
    this.stopsByDay.set(dayId, [...existing, newStop]);
    return this.getDayPlanView(dayId);
  }

  getBookings(): readonly BookingItem[] {
    return this.bookings;
  }

  completePendingBooking(bookingId: string): readonly BookingItem[] {
    this.bookings = this.bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'confirmed',
            subtitle: 'Dados completos · apólice emitida',
            actionLabel: undefined,
          }
        : b,
    );
    return this.bookings;
  }
}

/**
 * Gerenciador de brilho automático ao exibir o QR Code do ticket (Seção 4.9 / Etapa 8).
 */
export class TicketQrBrightnessManager {
  private readonly adapter: ScreenBrightnessAdapter;
  private previousBrightness: number | null = null;
  private isBoosted = false;

  constructor(adapter?: ScreenBrightnessAdapter) {
    let memoryBrightness = 0.55;
    this.adapter = adapter ?? {
      async getBrightness() {
        return memoryBrightness;
      },
      async setBrightness(val: number) {
        memoryBrightness = val;
      },
    };
  }

  async boostBrightnessForQr(): Promise<number> {
    if (!this.isBoosted) {
      this.previousBrightness = await this.adapter.getBrightness();
      this.isBoosted = true;
    }
    await this.adapter.setBrightness(1.0);
    return 1.0;
  }

  async restoreBrightness(): Promise<number> {
    const target = this.previousBrightness ?? 0.55;
    await this.adapter.setBrightness(target);
    this.isBoosted = false;
    this.previousBrightness = null;
    return target;
  }

  getIsBoosted(): boolean {
    return this.isBoosted;
  }
}
