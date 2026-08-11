import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getTelephonyTrunkValidationMessage,
} from '../../src/utils/scripts/telephonyTrunk.ts';
import type { TelephonyTrunkForm } from '../../src/utils/types/telephony.types.ts';

const createForm = (): TelephonyTrunkForm => ({
  provider: 'boxip',
  distributionMode: 'single_account',
  authMode: 'registration',
  sipServer: '51.255.5.99',
  sipPort: 5060,
  fromDomain: '51.255.5.99',
  callerId: '',
  contactUser: '',
  maxChannels: 5,
  enabled: false,
  accounts: [],
});

test('le socle trunk peut être préparé désactivé avant la souscription', () => {
  assert.equal(getTelephonyTrunkValidationMessage(createForm()), null);
});

test('un trunk activé exige le numéro présenté et des credentials complets', () => {
  const missingCallerId = { ...createForm(), enabled: true };
  assert.match(getTelephonyTrunkValidationMessage(missingCallerId) || '', /numéro présenté/);

  const missingAccount = { ...missingCallerId, callerId: '+33123456789' };
  assert.match(getTelephonyTrunkValidationMessage(missingAccount) || '', /compte SIP actif/);

  const incompleteAccount = {
    ...missingAccount,
    accounts: [{
      id: 'boxip-main',
      label: 'boxIP principal',
      username: 'antl-boxip',
      password: '',
      channelLimit: 5,
      priority: 1,
      enabled: true,
      hasPassword: false,
    }],
  };
  assert.match(getTelephonyTrunkValidationMessage(incompleteAccount) || '', /mot de passe/);

  const completeAccount = {
    ...incompleteAccount,
    accounts: [{ ...incompleteAccount.accounts[0], password: 'sip-secret' }],
  };
  assert.equal(getTelephonyTrunkValidationMessage(completeAccount), null);
});

test('un mot de passe déjà chiffré côté serveur reste valide sans être réexposé', () => {
  const form = {
    ...createForm(),
    enabled: true,
    callerId: '+33123456789',
    accounts: [{
      id: 'boxip-main',
      label: 'boxIP principal',
      username: 'antl-boxip',
      password: '',
      channelLimit: 5,
      priority: 1,
      enabled: true,
      hasPassword: true,
    }],
  };

  assert.equal(getTelephonyTrunkValidationMessage(form), null);
});

test('le mode IP exige uniquement une capacité valide une fois activé', () => {
  const form: TelephonyTrunkForm = {
    ...createForm(),
    authMode: 'ip',
    enabled: true,
    callerId: '+33123456789',
    maxChannels: 0,
  };
  assert.match(getTelephonyTrunkValidationMessage(form) || '', /canaux simultanés/);
  assert.equal(getTelephonyTrunkValidationMessage({ ...form, maxChannels: 5 }), null);
});
