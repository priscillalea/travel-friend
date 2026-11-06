import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  BookingItem,
  DayPlanView,
  EXAMPLE_MAIN_TICKET,
  EXAMPLE_SECONDARY_VOUCHERS,
  EXAMPLE_TOURS_FIXTURE,
  filterTours,
  ItineraryService,
  SecondaryVoucher,
  TicketPass,
  TourActivity,
  TourFilter,
  TripDay,
} from '../domain/itinerary';

interface ItineraryContextValue {
  days: readonly TripDay[];
  selectedDayId: string;
  setSelectedDayId: (dayId: string) => void;
  dayPlan: DayPlanView;
  tourFilter: TourFilter;
  setTourFilter: (filter: TourFilter) => void;
  filteredTours: readonly TourActivity[];
  addTourToPlan: (tour: TourActivity) => void;
  bookings: readonly BookingItem[];
  completeBooking: (bookingId: string) => void;
  mainTicket: TicketPass;
  secondaryVouchers: readonly SecondaryVoucher[];
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const service = useMemo(() => new ItineraryService(), []);
  const [selectedDayId, setSelectedDayIdState] = useState('day-13');
  const [dayPlan, setDayPlan] = useState<DayPlanView>(() => service.getDayPlanView('day-13'));
  const [tourFilter, setTourFilter] = useState<TourFilter>('todos');
  const [bookings, setBookings] = useState<readonly BookingItem[]>(() => service.getBookings());

  const setSelectedDayId = useCallback(
    (dayId: string) => {
      setSelectedDayIdState(dayId);
      setDayPlan(service.getDayPlanView(dayId));
    },
    [service],
  );

  const addTourToPlan = useCallback(
    (tour: TourActivity) => {
      const updated = service.addTourToDayPlan(selectedDayId, tour);
      setDayPlan(updated);
    },
    [service, selectedDayId],
  );

  const completeBooking = useCallback(
    (bookingId: string) => {
      const updated = service.completePendingBooking(bookingId);
      setBookings(updated);
    },
    [service],
  );

  const filteredTours = useMemo(() => filterTours(EXAMPLE_TOURS_FIXTURE, tourFilter), [tourFilter]);

  const value = useMemo(
    () => ({
      days: service.getDays(),
      selectedDayId,
      setSelectedDayId,
      dayPlan,
      tourFilter,
      setTourFilter,
      filteredTours,
      addTourToPlan,
      bookings,
      completeBooking,
      mainTicket: EXAMPLE_MAIN_TICKET,
      secondaryVouchers: EXAMPLE_SECONDARY_VOUCHERS,
    }),
    [
      service,
      selectedDayId,
      setSelectedDayId,
      dayPlan,
      tourFilter,
      filteredTours,
      addTourToPlan,
      bookings,
      completeBooking,
    ],
  );

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
}

export function useItinerary(): ItineraryContextValue {
  const ctx = useContext(ItineraryContext);
  if (!ctx) {
    throw new Error('useItinerary deve ser usado dentro de um ItineraryProvider.');
  }
  return ctx;
}
