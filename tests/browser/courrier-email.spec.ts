import { expect, test } from '@playwright/test';

import {
  apiSuccess,
  fulfillJson,
  installApiRoute,
} from './support.ts';

interface EmailRequest {
  message: string;
  subject: string;
  to: string;
}

const courrier = {
  id: 41,
  fileName: 'contrat-client.pdf',
  path: '/uploads/courriers/contrat-client.pdf',
  fileExtention: '.pdf',
  active: true,
  department: 'Commercial',
  kind: 'Contrat',
  direction: 'sortant' as const,
  recipient: 'Cabinet Horizon',
  emitter: 'antl',
  priority: 'normale',
  courrierDate: '2026-07-18',
  description: 'Contrat commercial signé',
  addByUser: 1,
};

test('la liste des courriers ouvre EmailModal et conserve le destinataire métier', async ({ page }) => {
  const unhandledRequests: string[] = [];
  let emailPayload: EmailRequest | null = null;

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/courriers') {
      await fulfillJson(route, {
        ...apiSuccess([courrier]),
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      return true;
    }

    if (request.method === 'GET' && request.path.startsWith('/courriers/field-options/')) {
      await fulfillJson(route, apiSuccess({ field: request.path.split('/').at(-1), options: [] }));
      return true;
    }

    if (request.method === 'POST' && request.path === `/courriers/${courrier.id}/send-email`) {
      emailPayload = route.request().postDataJSON() as EmailRequest;
      await fulfillJson(route, apiSuccess(null, 'Email envoyé'));
      return true;
    }

    return false;
  }, unhandledRequests);

  await page.goto('/mail/list');

  await expect(page.getByRole('heading', { name: 'Liste des courriers' })).toBeVisible();
  const row = page.locator('.courriersTable tbody tr').filter({ hasText: courrier.fileName });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Actions' }).click();
  await row.getByTitle('Envoyer ce courrier par email').click();

  const modal = page.locator('#emailModal');
  await expect(modal.getByRole('heading', { name: 'Envoyer par email' })).toBeVisible();
  await expect(modal.getByLabel('Sujet *')).toHaveValue(`Courrier: ${courrier.fileName}`);
  await modal.getByLabel('Destinataire *').fill('juridique@cabinet-horizon.fr');
  await modal.getByLabel('Note personnelle').fill('Merci de confirmer la bonne réception du contrat.');
  await modal.getByRole('button', { name: 'Envoyer', exact: true }).click();

  await expect.poll(() => emailPayload).not.toBeNull();
  expect(emailPayload).toEqual({
    message: 'Merci de confirmer la bonne réception du contrat.',
    subject: `Courrier: ${courrier.fileName}`,
    to: 'juridique@cabinet-horizon.fr',
  });
  await expect(modal).toBeHidden();
  expect(unhandledRequests).toEqual([]);
});
