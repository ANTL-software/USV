import { expect, test } from '@playwright/test';

import { apiSuccess, fulfillJson, installApiRoute, SALES_CAMPAIGN } from './support.ts';

interface ProspectOrderEmailRequest {
  recipient_email: string;
  confirmed_recipient_email: string;
  subject: string;
  message: string;
}

test('une adresse prospect saisie doit être validée puis confirmée avant tout envoi', async ({ page }) => {
  const unhandled: string[] = [];
  const sent: ProspectOrderEmailRequest[] = [];
  const sale = {
    id_vente: 123,
    reference_doc: '0600123',
    id_prospect: 42,
    id_agent: 9,
    id_campagne: 7,
    date_vente: '2026-09-24T08:00:00.000Z',
    montant_total: '500.00',
    statut_vente: 'validee' as const,
    created_at: '2026-09-24T08:00:00.000Z',
    updated_at: '2026-09-24T08:00:00.000Z',
    prospect: {
      id_prospect: 42,
      nom: 'Durand',
      raison_sociale: 'Durand Conseil',
      email: 'prospect@example.com',
    },
    agent: { id_employe: 9, nom: 'Martin', prenom: 'Alice' },
    campagne: SALES_CAMPAIGN,
    prospect_email_sender: { configured: true, name: 'ESAT Les Cigales', address: 'lescigales@antl.fr' },
    details: [],
  };

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/ventes/123') {
      await fulfillJson(route, apiSuccess(sale));
      return true;
    }
    if (request.method === 'GET' && request.path === '/documents-commerciaux/ventes/123') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }
    if (request.method === 'GET' && (request.path === '/prospects/42/ventes' || request.path === '/prospects/42/appels')) {
      await fulfillJson(route, { ...apiSuccess([]), pagination: { page: 1, limit: 5, total: 0, totalPages: 1 } });
      return true;
    }
    if (request.method === 'POST' && request.path === '/ventes/123/send-to-prospect') {
      sent.push(route.request().postDataJSON() as ProspectOrderEmailRequest);
      await fulfillJson(route, apiSuccess({ email_envoye_at: '2026-09-24T09:18:01.533Z' }));
      return true;
    }
    return false;
  }, unhandled);

  await page.goto('/operations/commandes/details/123');
  await page.getByRole('button', { name: 'Envoyer le bon de commande au prospect' }).click();
  const modal = page.locator('.signedOrderEmailModal__card').filter({ has: page.getByRole('heading', { name: 'Envoyer le bon de commande au prospect' }) });
  const sendButton = modal.getByRole('button', { name: 'Envoyer par mail' });
  await expect(modal).toContainText('Destinataire de l’envoi : prospect@example.com');

  await modal.locator('#prospectOrderRecipientEmail').fill('brouillon@example.com');
  await expect(modal).toContainText('Nouvelle adresse en cours de saisie');
  await expect(sendButton).toBeDisabled();
  await modal.locator('#prospectOrderRecipientEmail').press('Tab');
  await expect(modal).toContainText('Destinataire de l’envoi : brouillon@example.com');
  await expect(sendButton).toBeEnabled();
  expect(sent).toEqual([]);

  await modal.locator('#prospectOrderRecipientEmail').focus();
  await modal.locator('#prospectOrderRecipientEmail').fill('moi@example.com');
  await expect(sendButton).toBeDisabled();
  await page.getByRole('option', { name: 'Utiliser "moi@example.com"' }).click();
  await expect(modal).toContainText('Destinataire de l’envoi : moi@example.com');
  await expect(sendButton).toBeEnabled();

  await sendButton.click();
  const confirmation = page.locator('.alert--confirm');
  await expect(confirmation).toContainText('Envoyer le bon de commande 0600123 à moi@example.com ?');
  await confirmation.getByRole('button', { name: 'Annuler' }).click();
  expect(sent).toEqual([]);

  await sendButton.click();
  await expect(confirmation).toContainText('moi@example.com');
  await confirmation.getByRole('button', { name: 'Envoyer', exact: true }).click();
  await expect.poll(() => sent).toHaveLength(1);
  expect(sent[0].recipient_email).toBe('moi@example.com');
  expect(sent[0].confirmed_recipient_email).toBe('moi@example.com');
  expect(unhandled).toEqual([]);
});
