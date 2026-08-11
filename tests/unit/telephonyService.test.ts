import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  TelephonyOperationsConfiguration,
  UpdateTelephonyProvider,
} from '../../src/utils/types/index.ts';

interface ApiResponse<T> {
  data: T;
}

interface TelephonyApiPayload {
  success: boolean;
  data?: TelephonyOperationsConfiguration;
  message?: string;
}

const requests: Array<{ method: string; payload?: unknown; url: string }> = [];

const createConfiguration = (provider: 'twilio' | 'asterisk'): TelephonyOperationsConfiguration => ({
  provider,
  providers: {
    twilio: { configured: true, missingVariables: [] },
    asterisk: { configured: true, missingVariables: [] },
  },
  activeConfiguration: {
    provider,
    configured: true,
    browserClientAvailable: true,
    transport: {
      kind: provider === 'twilio' ? 'twilio-sdk' : 'sip-wss',
      webSocketUrl: provider === 'twilio' ? null : 'wss://voice.example.test/ws',
      sipDomain: provider === 'twilio' ? null : 'voice.example.test',
    },
    capabilities: {
      outboundCalls: true,
      incomingCalls: true,
      supervisorWhisper: provider === 'twilio',
      answeringMachineDetection: provider === 'twilio',
      recording: provider === 'twilio',
    },
  },
  activationScope: 'new-browser-sessions',
});

let storedConfiguration = createConfiguration('twilio');
const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;

mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<TelephonyApiPayload>> => {
      requests.push({ method: 'GET', url });
      return { data: { success: true, data: storedConfiguration } };
    },
    putRequest: async (url: string, payload: UpdateTelephonyProvider): Promise<ApiResponse<TelephonyApiPayload>> => {
      requests.push({ method: 'PUT', url, payload });
      storedConfiguration = createConfiguration(payload.provider);
      return { data: { success: true, data: storedConfiguration } };
    },
  },
});

test('la configuration opérations lit Twilio par défaut', async () => {
  const { getTelephonyOperationsConfigurationService } = await import('../../src/API/services/telephony.service.ts');
  const configuration = await getTelephonyOperationsConfigurationService();

  assert.equal(configuration.provider, 'twilio');
  assert.equal(configuration.providers.asterisk.configured, true);
  assert.equal(requests.at(-1)?.url, '/telephony/configuration/operations');
});

test('le switch persiste Asterisk via la route protégée', async () => {
  const { updateTelephonyProviderService } = await import('../../src/API/services/telephony.service.ts');
  const configuration = await updateTelephonyProviderService({ provider: 'asterisk' });

  assert.equal(configuration.provider, 'asterisk');
  assert.deepEqual(requests.at(-1), {
    method: 'PUT',
    url: '/telephony/configuration',
    payload: { provider: 'asterisk' },
  });
});
