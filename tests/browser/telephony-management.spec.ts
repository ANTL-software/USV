import { expect, test } from '@playwright/test';

import type {
  SaveTelephonyTrunkConfiguration,
  TelephonyOperationsConfiguration,
  TelephonyProvider,
  TelephonyTrunkConfiguration,
} from '../../src/utils/types/index.ts';
import {
  ADMIN_USER,
  apiSuccess,
  fulfillJson,
  installApiRoute,
} from './support.ts';

const createTrunk = (
  overrides: Partial<TelephonyTrunkConfiguration> = {},
): TelephonyTrunkConfiguration => ({
  provider: 'boxip',
  distributionMode: 'single_account',
  authMode: 'registration',
  sipServer: '51.255.5.99',
  sipPort: 5060,
  transport: 'udp',
  fromDomain: '51.255.5.99',
  callerId: '',
  contactUser: '',
  maxChannels: 20,
  enabled: false,
  applyStatus: 'not_configured',
  lastAppliedAt: null,
  lastError: null,
  accounts: [],
  runtime: null,
  events: [],
  ...overrides,
});

const createOperations = (
  provider: TelephonyProvider,
  trunkConfiguration: TelephonyTrunkConfiguration,
): TelephonyOperationsConfiguration => {
  const asteriskReady = trunkConfiguration.enabled
    && trunkConfiguration.applyStatus === 'applied'
    && trunkConfiguration.runtime?.healthy === true;
  return {
    provider,
    providers: {
      twilio: { configured: true, missingVariables: [] },
      asterisk: {
        configured: asteriskReady,
        missingVariables: asteriskReady ? [] : ['ASTERISK_TRUNK_READY'],
        browserConfigured: true,
        trunkConfigured: asteriskReady,
        simulationMode: false,
      },
    },
    activeConfiguration: {
      provider,
      configured: true,
      browserClientAvailable: true,
      transport: provider === 'twilio'
        ? { kind: 'twilio-sdk', webSocketUrl: null, sipDomain: null }
        : { kind: 'sip-wss', webSocketUrl: 'wss://voice.example.test/ws', sipDomain: 'voice.example.test' },
      capabilities: {
        outboundCalls: true,
        incomingCalls: true,
        supervisorWhisper: true,
        answeringMachineDetection: provider === 'twilio',
        recording: true,
      },
    },
    trunkConfiguration,
    activationScope: 'live-idle-sessions',
  };
};

test('le parcours matériel vers trunk validé puis Asterisk fonctionne de bout en bout', async ({ page }) => {
  const unhandledRequests: string[] = [];
  const mutations: string[] = [];
  let activeProvider: TelephonyProvider = 'twilio';
  let trunkConfiguration = createTrunk();

  page.on('dialog', (dialog) => { void dialog.accept(); });
  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/materiel') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }
    if (request.method === 'GET' && request.path === '/materiel/marques') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }
    if (request.method === 'GET' && request.path === '/telephony/configuration/operations') {
      await fulfillJson(route, apiSuccess(createOperations(activeProvider, trunkConfiguration)));
      return true;
    }
    if (request.method === 'PUT' && request.path === '/telephony/trunk-configuration') {
      const payload = route.request().postDataJSON() as SaveTelephonyTrunkConfiguration;
      mutations.push('save');
      trunkConfiguration = createTrunk({
        ...payload,
        transport: 'udp',
        applyStatus: 'pending',
        accounts: payload.accounts.map((account, index) => ({
          ...account,
          password: '',
          priority: index + 1,
          hasPassword: Boolean(account.password),
        })),
      });
      await fulfillJson(route, apiSuccess(trunkConfiguration));
      return true;
    }
    if (request.method === 'POST' && request.path === '/telephony/trunk-configuration/apply') {
      mutations.push('apply');
      trunkConfiguration = createTrunk({
        ...trunkConfiguration,
        applyStatus: 'applied',
        lastAppliedAt: '2026-08-11T12:00:00.000Z',
        runtime: {
          available: true,
          healthy: true,
          activeChannels: 0,
          accounts: [{
            endpoint: 'trunk-1',
            label: 'Compte 1',
            state: 'registered',
            activeChannels: 0,
            channelLimit: 20,
          }],
          message: 'Tous les comptes SIP sont enregistrés',
        },
      });
      await fulfillJson(route, apiSuccess(trunkConfiguration));
      return true;
    }
    if (request.method === 'PUT' && request.path === '/telephony/configuration') {
      const payload = route.request().postDataJSON() as { provider: TelephonyProvider };
      mutations.push(`provider:${payload.provider}`);
      activeProvider = payload.provider;
      await fulfillJson(route, apiSuccess(createOperations(activeProvider, trunkConfiguration)));
      return true;
    }
    return false;
  }, unhandledRequests);

  await page.goto('/operations/materiel');
  await expect(page.getByRole('heading', { name: 'Matériel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Téléphonie du centre d’appels' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Gestion de la téléphonie' }).click();

  await expect(page).toHaveURL(/\/operations\/materiel\/telephonie$/);
  await expect(page.getByRole('heading', { name: 'Gestion de la téléphonie' })).toBeVisible();
  const providerSwitch = page.getByRole('switch', { name: 'Utiliser Asterisk à la place de Twilio' });
  await expect(providerSwitch).toBeDisabled();

  await page.getByRole('button', { name: 'Ajouter un compte' }).click();
  await page.getByLabel('Numéro présenté').fill('+33123456789');
  await page.getByLabel('Contact entrant').fill('33123456789');
  await page.getByLabel('Identifiant SIP').fill('antl-boxip');
  await page.getByLabel('Mot de passe', { exact: true }).fill('sip-secret');
  await expect(page.getByLabel('Canaux', { exact: true })).toHaveValue('20');
  await page.locator('.telephonyManagement__trunk-enable input').check();

  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Configuration enregistrée. Elle n’est pas encore appliquée à Asterisk.')).toBeVisible();
  await page.getByRole('button', { name: 'Appliquer à Asterisk' }).click();
  await expect(page.getByText('Configuration appliquée et connexion SIP contrôlée.')).toBeVisible();
  await expect(page.getByText('Tous les comptes SIP sont enregistrés')).toBeVisible();
  await expect(providerSwitch).toBeEnabled();

  await providerSwitch.click();
  await expect(providerSwitch).toBeChecked();
  await expect(page.getByText('Asterisk est sélectionné. Les agents disponibles basculeront automatiquement sous 15 secondes.')).toBeVisible();
  expect(mutations).toEqual(['save', 'apply', 'provider:asterisk']);
  expect(unhandledRequests).toEqual([]);
});

test('le droit matériel seul masque le bouton et bloque la route téléphonie', async ({ page }) => {
  const unhandledRequests: string[] = [];
  const materialManager = {
    ...ADMIN_USER,
    identifiant: 'materiel.test',
    poste: {
      ...ADMIN_USER.poste,
      permissions: {
        operations: { enabled: true, subsections: ['materiel'] },
      },
    },
  };

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/materiel') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }
    if (request.method === 'GET' && request.path === '/materiel/marques') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }
    return false;
  }, unhandledRequests, materialManager);

  await page.goto('/operations/materiel');
  await expect(page.getByRole('heading', { name: 'Matériel' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gestion de la téléphonie' })).toHaveCount(0);

  await page.goto('/operations/materiel/telephonie');
  await expect(page).toHaveURL(/\/operations$/);
  expect(unhandledRequests).toEqual([]);
});
