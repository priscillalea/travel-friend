import {
  EXAMPLE_MAIN_TICKET,
  EXAMPLE_TOURS_FIXTURE,
  filterTours,
  ItineraryService,
  TicketQrBrightnessManager,
} from '../index';

describe('Plano, passeios, reservas e tickets — Etapa 8 (Seções 4.6b, 4.7, 4.8 e 4.9)', () => {
  it('calcula o plano do Dia 2 (13 dez) com total previsto de £46 (4600 pence)', () => {
    const service = new ItineraryService();
    const day13 = service.getDayPlanView('day-13');

    expect(day13.stops).toHaveLength(4);
    expect(day13.totalPlanned).toEqual({ amountMinor: 4600, currency: 'GBP' });
  });

  it('filtra passeios (Todos, Grátis, Até £20, Ao ar livre) e adiciona passeio ao plano do dia', () => {
    const freeTours = filterTours(EXAMPLE_TOURS_FIXTURE, 'gratis');
    expect(freeTours).toHaveLength(2);
    expect(freeTours.every((t) => t.isFree)).toBe(true);

    const under20 = filterTours(EXAMPLE_TOURS_FIXTURE, 'ate_20');
    expect(under20.every((t) => t.price.amountMinor <= 2000)).toBe(true);

    const outdoor = filterTours(EXAMPLE_TOURS_FIXTURE, 'ar_livre');
    expect(outdoor.every((t) => t.isOutdoor)).toBe(true);

    const service = new ItineraryService();
    const updatedDay = service.addTourToDayPlan('day-13', EXAMPLE_TOURS_FIXTURE[3]); // £14
    expect(updatedDay.stops).toHaveLength(5);
    expect(updatedDay.totalPlanned).toEqual({ amountMinor: 6000, currency: 'GBP' });
  });

  it('permite concluir pendência de reserva (Seguro viagem -> Confirmado)', () => {
    const service = new ItineraryService();
    const before = service.getBookings().find((b) => b.id === 'booking-insurance-basic');
    expect(before?.status).toBe('pending');

    const afterList = service.completePendingBooking('booking-insurance-basic');
    const after = afterList.find((b) => b.id === 'booking-insurance-basic');
    expect(after?.status).toBe('confirmed');
    expect(after?.actionLabel).toBeUndefined();
  });

  it('mantém ticket com QR Code offline e aumenta o brilho da tela para 100% ao abrir', async () => {
    expect(EXAMPLE_MAIN_TICKET.offlineOk).toBe(true);
    expect(EXAMPLE_MAIN_TICKET.qrMatrix).toHaveLength(5);

    let deviceBrightness = 0.45;
    const manager = new TicketQrBrightnessManager({
      getBrightness: async () => deviceBrightness,
      setBrightness: async (val) => {
        deviceBrightness = val;
      },
    });

    await manager.boostBrightnessForQr();
    expect(deviceBrightness).toBe(1.0);
    expect(manager.getIsBoosted()).toBe(true);

    await manager.restoreBrightness();
    expect(deviceBrightness).toBe(0.45);
    expect(manager.getIsBoosted()).toBe(false);
  });
});
