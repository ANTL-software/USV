import { expect, test } from '@playwright/test';

import {
  apiSuccess,
  BOOKING_EMPLOYEE,
  fulfillJson,
  installApiRoute,
} from './support.ts';

interface CreateBookingRequest {
  debut: string;
  description?: string;
  fin: string;
  id_beneficiaire: number;
  id_employe: number;
  personne_externe?: string;
}

test('Booking, Header et SubNav rendent le parcours de création et la navigation', async ({ page }) => {
  const unhandledRequests: string[] = [];
  let createdBooking: CreateBookingRequest | null = null;

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/bookings') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    if (request.method === 'POST' && request.path === '/bookings') {
      createdBooking = route.request().postDataJSON() as CreateBookingRequest;
      await fulfillJson(route, apiSuccess({
        id_booking: 301,
        ...createdBooking,
        statut: 'confirme',
        beneficiaire: BOOKING_EMPLOYEE,
        organisateur: BOOKING_EMPLOYEE,
      }), 201);
      return true;
    }

    if (request.method === 'GET' && request.path === '/courriers/stats') {
      await fulfillJson(route, apiSuccess({ total: 0, entrants: 0, sortants: 0, internes: 0, thisMonth: 0, thisYear: 0 }));
      return true;
    }

    return false;
  }, unhandledRequests);

  await page.goto('/booking');

  await expect(page.getByRole('heading', { name: 'Agenda ANTL' })).toBeVisible();
  await expect(page.locator('#header')).toBeVisible();
  await expect(page.locator('#subNav')).toBeVisible();
  await expect(page.getByText('TEST', { exact: true })).toBeVisible();
  await expect(page.locator('.userGreeting')).toContainText('Sophie');

  await page.getByRole('button', { name: 'Nouveau rendez-vous' }).click();
  const bookingForm = page.locator('#bookingForm');
  await expect(bookingForm.getByRole('heading', { name: 'Nouveau rendez-vous' })).toBeVisible();

  const employeeField = bookingForm.locator('.fieldGroup').filter({ hasText: 'Employé ANTL' });
  await employeeField.locator('input').fill('Alice');
  await page.getByText('Alice AGENT (Matricule: 9)', { exact: true }).click();
  await bookingForm.getByLabel('Personne externe').fill('Cabinet Horizon');
  await bookingForm.getByLabel('Description').fill('Point de cadrage client');
  await bookingForm.getByRole('button', { name: 'Créer' }).click();

  await expect.poll(() => createdBooking).not.toBeNull();
  expect(createdBooking).toMatchObject({
    description: 'Point de cadrage client',
    id_beneficiaire: 9,
    id_employe: 9,
    personne_externe: 'Cabinet Horizon',
  });
  await expect(bookingForm).toBeHidden({ timeout: 7000 });

  await page.locator('#subNav').getByRole('button', { name: 'Courriers' }).click();
  await expect(page).toHaveURL(/\/mail$/);
  await expect(page.getByRole('heading', { name: /Courriers/i })).toBeVisible();
  expect(unhandledRequests).toEqual([]);
});
