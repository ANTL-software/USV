import type { Page, Route } from '@playwright/test';

export interface ApiRequestDescriptor {
  method: string;
  path: string;
  search: string;
}

export const ADMIN_USER = {
  id_employe: 1,
  identifiant: 'admin.test',
  nom: 'TEST',
  prenom: 'Sophie',
  email: 'sophie.test@antl.fr',
  actif: true,
  role: 'confirme' as const,
  couleur: '#7c3aed',
  poste: {
    id_poste: 1,
    libelle_poste: 'CEO',
    permissions: {
      booking: { enabled: true },
      commercial: { enabled: true },
      commerciaux: {
        enabled: true,
        subsections: ['notes-direction', 'notes-direction-create', 'notes-direction-delete', 'mon_planning'],
      },
      incidents: { enabled: true, subsections: ['declarer', 'qualifier', 'traiter', 'liste'] },
      mail: { enabled: true, subsections: ['mail_new', 'mail_list', 'mail_convert'] },
      operations: {
        enabled: true,
        subsections: [
          'supervision',
          'commandes',
          'campagnes',
          'prospects',
          'produits',
          'qualite',
          'demandes-absence',
          'employes',
          'postes',
          'materiel',
        ],
      },
      projets: { enabled: true },
    },
  },
};

export const BOOKING_EMPLOYEE = {
  id_employe: 9,
  identifiant: 'agent.test',
  nom: 'AGENT',
  prenom: 'Alice',
  email: 'alice.agent@antl.fr',
  actif: true,
  role: 'confirme' as const,
  couleur: '#2563eb',
};

export const SALES_CAMPAIGN = {
  id_campagne: 7,
  nom_campagne: 'Les Cigales',
  type_campagne: 'vente' as const,
  date_debut: '2026-01-01',
  date_fin: null,
  statut: 'active' as const,
  objectifs: null,
  budget: null,
  code_postal_maison_mere: '33000',
  autoriser_mobile: false,
  siret: '12345678901234',
  tva: 'FR12123456789',
  email_contact: 'facturation@client.fr',
  email_bon_commande: 'commandes@client.fr',
  adresse: '1 rue du Client',
  ville: '33000 Bordeaux',
  telephone: '0555000000',
  pays: 'France',
  footer_text: 'Merci pour votre confiance.',
  taux_commission_facturation: 0.15,
  bon_commande_config: {
    invoice_recipient: {
      company_name: 'Client Facturé SAS',
      siret: '12345678901234',
      tva: 'FR12123456789',
      email: 'facturation@client.fr',
      address: '1 rue du Client',
      postal_code: '33000',
      city: 'Bordeaux',
      country: 'France',
      phone: '0555000000',
    },
  },
};

export function describeApiRequest(route: Route): ApiRequestDescriptor {
  const request = route.request();
  const url = new URL(request.url());
  const path = url.pathname.startsWith('/api') ? url.pathname.slice(4) : url.pathname;
  return { method: request.method(), path, search: url.search };
}

export async function fulfillJson(route: Route, data: unknown, status = 200): Promise<void> {
  await route.fulfill({
    body: JSON.stringify(data),
    contentType: 'application/json',
    status,
  });
}

export function apiSuccess<T>(data: T, message = 'OK'): { success: true; message: string; data: T } {
  return { success: true, message, data };
}

export async function handleCommonApiRequest(route: Route): Promise<boolean> {
  const { method, path } = describeApiRequest(route);

  if (method === 'GET' && path === '/csrf-token') {
    await fulfillJson(route, apiSuccess({ token: 'playwright-csrf-token' }));
    return true;
  }

  if (method === 'GET' && path === '/auth/me') {
    await fulfillJson(route, apiSuccess(ADMIN_USER));
    return true;
  }

  if (method === 'GET' && path === '/employes') {
    await fulfillJson(route, apiSuccess({ employes: [ADMIN_USER, BOOKING_EMPLOYEE] }));
    return true;
  }

  if (method === 'GET' && path === '/employes/absence-requests/pending') {
    await fulfillJson(route, apiSuccess([]));
    return true;
  }

  return false;
}

export async function installApiRoute(
  page: Page,
  handler: (route: Route, request: ApiRequestDescriptor) => Promise<boolean>,
  unhandledRequests: string[],
): Promise<void> {
  await page.route('**/api/**', async (route) => {
    if (await handleCommonApiRequest(route)) return;

    const request = describeApiRequest(route);
    if (await handler(route, request)) return;

    const requestKey = `${request.method} ${request.path}${request.search}`;
    unhandledRequests.push(requestKey);
    await fulfillJson(route, { success: false, message: `Unhandled API request: ${requestKey}` }, 500);
  });
}
