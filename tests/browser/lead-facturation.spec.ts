import { expect, test } from '@playwright/test';

import {
  apiSuccess,
  BOOKING_EMPLOYEE,
  fulfillJson,
  installApiRoute,
  SALES_CAMPAIGN,
} from './support.ts';

interface InvoiceEmailRequest {
  date_debut: string;
  date_fin: string;
  recipient_email: string;
}

const lead = {
  id_lead: 501,
  id_agent: 9,
  id_prospect: 42,
  id_campagne: 8,
  id_appel: 901,
  date_rdv: '2026-07-21',
  heure_rdv: '10:30:00',
  motif: 'Prise de rendez-vous client',
  interlocuteur_nom: 'Claire Durand',
  interlocuteur_role: 'Directrice générale',
  telephone_contact_snapshot: '0555443323',
  email_contact_snapshot: 'direction@durand-conseil.fr',
  notes: 'Qualification MMA confirmée.',
  derniere_note_closing: 'Décisionnaire disponible.',
  statut: 'planifie' as const,
  created_at: '2026-07-18T09:00:00.000Z',
  updated_at: '2026-07-18T09:00:00.000Z',
  prospect: {
    id_prospect: 42,
    nom: 'Durand',
    prenom: 'Claire',
    raison_sociale: 'Durand Conseil',
    telephone: '0555443322',
    telephone_contact: '0555443323',
    email: 'contact@durand-conseil.fr',
    adresse_facturation: '10 rue de la République',
    code_postal: '33000',
    ville: 'Bordeaux',
    pays: 'France',
  },
  agent: { id_employe: 9, nom: 'Agent', prenom: 'Alice', email: 'alice.agent@antl.fr' },
  campagne: { id_campagne: 8, nom_campagne: 'MMA', type_campagne: 'lead_b2b' as const },
  appelsSource: [],
};

const sale = {
  id_vente: 701,
  id_prospect: 42,
  id_agent: 9,
  id_campagne: SALES_CAMPAIGN.id_campagne,
  date_vente: '2026-07-10T10:00:00.000Z',
  date_acceptation: '2026-07-12T10:00:00.000Z',
  montant_total: '500.00',
  statut_vente: 'validee' as const,
  mode_paiement: 'Virement' as const,
  livraison_offerte: true,
  created_at: '2026-07-10T10:00:00.000Z',
  updated_at: '2026-07-12T10:00:00.000Z',
  prospect: { id_prospect: 42, nom: 'Durand', raison_sociale: 'Durand Conseil' },
};

const MMA_CAMPAIGN = {
  ...SALES_CAMPAIGN,
  id_campagne: 8,
  nom_campagne: 'MMA',
  type_campagne: 'lead_b2b' as const,
};

test('le détail lead et la facturation gardent leurs workflows navigateur', async ({ page }) => {
  const unhandledRequests: string[] = [];
  let leadStatusPayload: { statut: string } | null = null;
  let invoiceEmailPayload: InvoiceEmailRequest | null = null;

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === `/leads/${lead.id_lead}`) {
      await fulfillJson(route, apiSuccess(lead));
      return true;
    }

    if (request.method === 'GET' && request.path === `/documents-commerciaux/leads/${lead.id_lead}`) {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    if (request.method === 'GET' && request.path === `/prospects/${lead.id_prospect}/appels`) {
      await fulfillJson(route, {
        ...apiSuccess([]),
        pagination: { page: 1, limit: 5, total: 0, totalPages: 1 },
      });
      return true;
    }

    if (request.method === 'GET' && request.path === `/leads/prospect/${lead.id_prospect}`) {
      await fulfillJson(route, apiSuccess([lead]));
      return true;
    }

    if (request.method === 'PATCH' && request.path === `/leads/${lead.id_lead}/statut`) {
      leadStatusPayload = route.request().postDataJSON() as { statut: string };
      await fulfillJson(route, apiSuccess({ ...lead, statut: leadStatusPayload.statut }));
      return true;
    }

    if (request.method === 'GET' && request.path === '/campagnes') {
      await fulfillJson(route, apiSuccess([SALES_CAMPAIGN]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/ventes') {
      await fulfillJson(route, {
        ...apiSuccess([sale]),
        pagination: { page: 1, limit: 6, total: 1, totalPages: 1 },
        stats: {
          validees: { count: 1, total_montant: 500 },
          enAttente: { count: 0, total_montant: 0 },
          annulees: { count: 0, total_montant: 0 },
          frigo: { count: 0, total_montant: 0 },
          total: { count: 1, total_montant: 500 },
        },
      });
      return true;
    }

    if (request.method === 'POST' && request.path === `/campagnes/${SALES_CAMPAIGN.id_campagne}/facturation/email`) {
      invoiceEmailPayload = route.request().postDataJSON() as InvoiceEmailRequest;
      await fulfillJson(route, { success: true, message: 'Facture envoyée' });
      return true;
    }

    if (request.method === 'GET' && request.path === `/campagnes/${SALES_CAMPAIGN.id_campagne}/facturation/pa`) {
      await fulfillJson(route, apiSuccess(null));
      return true;
    }

    return false;
  }, unhandledRequests);

  await page.goto(`/operations/commandes/details/${lead.id_lead}?mode=lead`);
  await expect(page.getByRole('heading', { name: 'Rendez-vous client L-00501' })).toBeVisible();
  await expect(page.getByText('Durand Conseil', { exact: true })).toBeVisible();
  await expect(page.getByText('direction@durand-conseil.fr', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Effectué' }).click();
  await expect.poll(() => leadStatusPayload).toEqual({ statut: 'effectue' });
  await expect(page.locator('.commandeDetails__header')).toContainText('Effectué');

  await page.goto('/commercial/facturation');
  await expect(page.getByRole('heading', { name: 'Facturation campagnes' })).toBeVisible();
  await expect(page.getByText('Configuration facture')).toBeVisible();
  await expect(page.getByText('Complète', { exact: true })).toBeVisible();
  await expect(page.getByText('CA validé', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Envoyer la facture par email' }).click();

  const invoiceModal = page.locator('.facturationView__modal');
  await expect(invoiceModal.getByRole('heading', { name: 'Envoyer la facture' })).toBeVisible();
  await invoiceModal.locator('#facturationEmailRecipient').fill('facturation@client.fr');
  await page.getByRole('option', { name: /Email de facturation.*facturation@client\.fr/ }).click();
  await invoiceModal.getByRole('button', { name: 'Envoyer la facture' }).click();

  const confirmation = page.locator('.alert--confirm');
  await expect(confirmation.getByRole('heading', { name: 'Confirmer l’envoi de la facture' })).toBeVisible();
  await confirmation.getByRole('button', { name: 'Envoyer', exact: true }).click();

  await expect.poll(() => invoiceEmailPayload).not.toBeNull();
  expect(invoiceEmailPayload).toMatchObject({ recipient_email: 'facturation@client.fr' });
  expect(invoiceEmailPayload?.date_debut).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(invoiceEmailPayload?.date_fin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await expect(invoiceModal).toBeHidden();
  expect(unhandledRequests).toEqual([]);
});

test('le retour des détails restaure filtres et pagination des commandes vente et MMA', async ({ page }) => {
  const unhandledRequests: string[] = [];
  let latestLeadListSearch = '';
  let latestSaleListSearch = '';

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/campagnes') {
      await fulfillJson(route, apiSuccess([SALES_CAMPAIGN, MMA_CAMPAIGN]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/leads/operations') {
      latestLeadListSearch = request.search;
      const currentPage = Number(new URLSearchParams(request.search).get('page') ?? 1);
      await fulfillJson(route, {
        ...apiSuccess([{ ...lead, statut: 'effectue' as const }]),
        agents: [BOOKING_EMPLOYEE],
        pagination: { page: currentPage, limit: 20, total: 41, totalPages: 3 },
        stats: { total: 41, planifies: 10, effectues: 20, annules: 3, reportes: 5, nonHonores: 3 },
      });
      return true;
    }

    if (request.method === 'GET' && request.path === '/ventes') {
      latestSaleListSearch = request.search;
      const currentPage = Number(new URLSearchParams(request.search).get('page') ?? 1);
      await fulfillJson(route, {
        ...apiSuccess([sale]),
        agents: [BOOKING_EMPLOYEE],
        pagination: { page: currentPage, limit: 20, total: 41, totalPages: 3 },
        stats: {
          validees: { count: 41, total_montant: 20500 },
          enAttente: { count: 0, total_montant: 0 },
          annulees: { count: 0, total_montant: 0 },
          frigo: { count: 0, total_montant: 0 },
          total: { count: 41, total_montant: 20500 },
        },
      });
      return true;
    }

    if (request.method === 'GET' && request.path === `/leads/${lead.id_lead}`) {
      await fulfillJson(route, apiSuccess({ ...lead, statut: 'effectue' as const }));
      return true;
    }

    if (request.method === 'GET' && request.path === `/ventes/${sale.id_vente}`) {
      await fulfillJson(route, apiSuccess({ ...sale, details: [] }));
      return true;
    }

    if (request.method === 'GET' && request.path === `/prospects/${lead.id_prospect}/appels`) {
      await fulfillJson(route, {
        ...apiSuccess([]),
        pagination: { page: 1, limit: 5, total: 0, totalPages: 1 },
      });
      return true;
    }

    if (request.method === 'GET' && request.path === `/leads/prospect/${lead.id_prospect}`) {
      await fulfillJson(route, apiSuccess([{ ...lead, statut: 'effectue' as const }]));
      return true;
    }

    if (request.method === 'GET' && request.path === `/prospects/${sale.id_prospect}/ventes`) {
      await fulfillJson(route, {
        ...apiSuccess([{ ...sale, details: [] }]),
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });
      return true;
    }

    if (
      request.method === 'GET'
      && (request.path === `/documents-commerciaux/leads/${lead.id_lead}`
        || request.path === `/documents-commerciaux/ventes/${sale.id_vente}`)
    ) {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    return false;
  }, unhandledRequests);

  const selectFilterOption = async (filterLabel: string, optionLabel: string): Promise<void> => {
    const filter = page.locator('.commandesList__filter-group').filter({ hasText: filterLabel }).first();
    await filter.getByRole('combobox').locator('..').click();
    await page.getByRole('option', { name: optionLabel, exact: true }).click();
  };

  await page.goto('/operations/commandes');
  await expect(page.getByRole('heading', { name: 'Commandes', exact: true })).toBeVisible();

  await selectFilterOption('Campagne', 'MMA');
  await expect(page.getByRole('heading', { name: 'Rendez-vous client', exact: true })).toBeVisible();
  await selectFilterOption('Statut', 'Effectué');
  await selectFilterOption('Commercial', 'Alice AGENT');
  await selectFilterOption('Période', 'Mois précédent');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByText('Page 2 / 3', { exact: true })).toBeVisible();
  await page.getByText('L-00501', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Rendez-vous client L-00501' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Rendez-vous client', exact: true })).toBeVisible();
  await expect(page.locator('.commandesList__filter-group--campaign')).toContainText('MMA');
  await expect(page.locator('.commandesList__filter-group').filter({ hasText: 'Statut' }).first()).toContainText('Effectué');
  await expect(page.locator('.commandesList__filter-group').filter({ hasText: 'Commercial' }).first()).toContainText('Alice AGENT');
  await expect(page.locator('.commandesList__filter-group').filter({ hasText: 'Période' }).first()).toContainText('Mois précédent');
  await expect(page.getByText('Page 2 / 3', { exact: true })).toBeVisible();
  await expect.poll(() => new URLSearchParams(latestLeadListSearch).get('page')).toBe('2');
  await expect.poll(() => new URLSearchParams(latestLeadListSearch).get('statut')).toBe('effectue');
  await expect.poll(() => new URLSearchParams(latestLeadListSearch).get('agent')).toBe('9');

  await selectFilterOption('Campagne', 'Les Cigales');
  await expect(page.getByRole('heading', { name: 'Commandes', exact: true })).toBeVisible();
  await selectFilterOption('Statut', 'Validée');
  await selectFilterOption('Commercial', 'Alice AGENT');
  await selectFilterOption('Période', 'Mois précédent');
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByText('Page 2 / 3', { exact: true })).toBeVisible();
  await page.getByText('#701', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Commande #701' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Commandes', exact: true })).toBeVisible();
  await expect(page.locator('.commandesList__filter-group--campaign')).toContainText('Les Cigales');
  await expect(page.locator('.commandesList__filter-group').filter({ hasText: 'Statut' }).first()).toContainText('Validée');
  await expect(page.locator('.commandesList__filter-group').filter({ hasText: 'Commercial' }).first()).toContainText('Alice AGENT');
  await expect(page.locator('.commandesList__filter-group').filter({ hasText: 'Période' }).first()).toContainText('Mois précédent');
  await expect(page.getByText('Page 2 / 3', { exact: true })).toBeVisible();
  await expect.poll(() => new URLSearchParams(latestSaleListSearch).get('page')).toBe('2');
  await expect.poll(() => new URLSearchParams(latestSaleListSearch).get('statut')).toBe('validee');
  await expect.poll(() => new URLSearchParams(latestSaleListSearch).get('agent')).toBe('9');
  expect(unhandledRequests).toEqual([]);
});
