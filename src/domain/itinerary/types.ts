import { Money } from '../money';

export interface TripDay {
  readonly id: string;
  readonly dayNumber: number;
  readonly dayOfMonth: string;
  readonly dateIso: string;
}

export interface PlanStop {
  readonly id: string;
  readonly dayId: string;
  readonly time: string;
  readonly title: string;
  readonly subtitle: string;
  readonly cost: Money;
  readonly isReserved?: boolean;
  readonly walkMinutesToNext?: number;
}

export interface DayPlanView {
  readonly day: TripDay;
  readonly stops: readonly PlanStop[];
  readonly totalPlanned: Money;
}

export type TourFilter = 'todos' | 'gratis' | 'ate_20' | 'ar_livre';

export interface TourActivity {
  readonly id: string;
  readonly title: string;
  readonly durationLabel: string;
  readonly policyLabel: string;
  readonly price: Money;
  readonly priceButtonLabel: string;
  readonly isFree: boolean;
  readonly isOutdoor: boolean;
  readonly bannerTone: 'blue' | 'green' | 'gold';
}

export type BookingStatus = 'confirmed' | 'pending';

export interface BookingItem {
  readonly id: string;
  readonly type: 'flight' | 'hotel' | 'insurance';
  readonly headerLabel: string;
  readonly status: BookingStatus;
  readonly flightOrigin?: string;
  readonly flightDestination?: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actionLabel?: string;
}

export interface TicketPass {
  readonly id: string;
  readonly categoryLabel: string;
  readonly title: string;
  readonly dateTimeLocationLabel: string;
  readonly qrPayload: string;
  readonly offlineOk: boolean;
  /** Matriz 5x5 para renderizar o QR code offline determinístico */
  readonly qrMatrix: ReadonlyArray<ReadonlyArray<0 | 1>>;
}

export interface SecondaryVoucher {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly badgeLabel: string;
}

export interface ScreenBrightnessAdapter {
  getBrightness(): Promise<number>;
  setBrightness(value: number): Promise<void>;
}
