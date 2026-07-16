import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';
import type { Booking, CreateBookingPayload, UpdateBookingPayload } from '../../src/utils/types/index.ts';

interface ApiResponse<T> { data: { success: boolean; data?: T; message?: string }; }

const requests: Array<{ method: string; payload?: unknown; url: string }> = [];
let bookings: Booking[] = [];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<Booking[]>> => {
      requests.push({ method: 'GET', url });
      return { data: { success: true, data: bookings } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<Booking>> => {
      requests.push({ method: 'POST', url, payload });
      const data = payload as CreateBookingPayload;
      const created: Booking = { id_booking: 1, statut: 'confirme', ...data };
      bookings.push(created);
      return { data: { success: true, data: created } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<Booking>> => {
      requests.push({ method: 'PUT', url, payload });
      const update = payload as UpdateBookingPayload;
      bookings = bookings.map((item) => item.id_booking === 1 ? { ...item, ...update } : item);
      return { data: { success: true, data: bookings[0] } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<never>> => {
      requests.push({ method: 'DELETE', url });
      bookings = bookings.filter(({ id_booking }) => id_booking !== 1);
      return { data: { success: true } };
    },
    patchRequest: async (): Promise<ApiResponse<never>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<never>> => ({ data: { success: true } }),
  },
});

test('le workflow Booking crée charge déplace puis annule une réservation', async () => {
  const { cancelBookingService, createBookingService, getBookingsService, updateBookingService } = await import('../../src/API/services/index.ts');
  const { buildCreateBookingPayload, createBookingFormState } = await import('../../src/utils/scripts/index.ts');
  const built = buildCreateBookingPayload({
    ...createBookingFormState('2026-07-20 09:00'),
    employe: { value: 4, label: 'Léa MARTIN' },
    personneExterne: 'Client MMA',
  });
  assert.ok(built.payload);

  const created = await createBookingService(built.payload);
  assert.equal(created.toCalendarEvent().title, 'Client MMA');

  const listed = await getBookingsService({ statut: 'confirme', date_debut: '2026-07-01', date_fin: '2026-07-31' });
  assert.equal(listed.length, 1);
  assert.match(requests.find(({ method }) => method === 'GET')?.url ?? '', /debut_debut=2026-07-01/);

  const moved = await updateBookingService(1, {
    debut: '2026-07-21T08:00:00.000Z',
    fin: '2026-07-21T09:00:00.000Z',
  });
  assert.equal(moved.debut, '2026-07-21T08:00:00.000Z');

  await cancelBookingService(1);
  assert.equal(bookings.length, 0);
  assert.deepEqual(requests.map(({ method }) => method), ['POST', 'GET', 'PUT', 'DELETE']);
});
