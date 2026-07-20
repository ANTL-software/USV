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

function createMinimalPdf(): Buffer {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    '<< /Length 44 >>\nstream\nBT /F1 18 Tf 40 80 Td (ANTL PDF test) Tj ET\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  body += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body, 'utf8');
}

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

test('le viewer PDF sécurisé rend un document réel sans casser la toolbar', async ({ page }) => {
  const unhandledRequests: string[] = [];

  await page.route('**/secure-test-document.pdf', async (route) => {
    await route.fulfill({
      body: createMinimalPdf(),
      contentType: 'application/pdf',
      status: 200,
    });
  });

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

    if (request.method === 'GET' && request.path === `/courriers/${courrier.id}/view-url`) {
      await fulfillJson(route, apiSuccess({
        courrierId: courrier.id,
        expiresAt: '2099-01-01T00:00:00.000Z',
        expiresIn: 600,
        userId: 1,
        viewUrl: '/secure-test-document.pdf',
      }));
      return true;
    }

    return false;
  }, unhandledRequests);

  await page.goto('/mail/list');

  const row = page.locator('.courriersTable tbody tr').filter({ hasText: courrier.fileName });
  await row.getByRole('button', { name: 'Actions' }).click();
  await row.getByTitle('Visualiser').click();

  await expect(page.getByRole('heading', { name: courrier.fileName })).toBeVisible();
  await expect(page.locator('.rpv-core__viewer')).toBeVisible();
  await expect(page.locator('.pdf-viewer-loading')).toBeHidden({ timeout: 15000 });
  await expect(page.locator('.rpv-toolbar')).toBeVisible();
  expect(unhandledRequests).toEqual([]);
});
