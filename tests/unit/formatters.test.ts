import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatCallDuration,
  formatDate,
  formatSince,
  getDirectionBadge,
} from '../../src/utils/scripts/formatters.ts';
import {
  getSalutation,
  getSalutationRefreshDelay,
} from '../../src/utils/scripts/utils.ts';

test('formatDate retourne N/A quand la date manque', () => {
  assert.equal(formatDate(undefined), 'N/A');
  assert.equal(formatDate(null), 'N/A');
});

test('getDirectionBadge mappe les directions connues', () => {
  assert.equal(getDirectionBadge('entrant'), 'badge-entrant');
  assert.equal(getDirectionBadge('sortant'), 'badge-sortant');
  assert.equal(getDirectionBadge('interne'), 'badge-interne');
  assert.equal(getDirectionBadge('autre'), '');
});

test('formatCallDuration formate correctement les durées courtes et longues', () => {
  assert.equal(formatCallDuration(5), '0:05');
  assert.equal(formatCallDuration(125), '2:05');
  assert.equal(formatCallDuration(3725), '1:02:05');
});

test('formatSince gère les durées écoulées et les dates futures', async () => {
  const realNow = Date.now;
  Date.now = () => new Date('2026-06-17T10:00:00.000Z').getTime();

  try {
    assert.equal(formatSince('2026-06-17T09:59:10.000Z'), '50s');
    assert.equal(formatSince('2026-06-17T09:57:30.000Z'), '2min 30s');
    assert.equal(formatSince('2026-06-17T08:00:00.000Z'), '2h00');
    assert.equal(formatSince('2026-06-17T10:00:10.000Z'), '');
    assert.equal(formatSince(null), '');
  } finally {
    Date.now = realNow;
  }
});

test('getSalutation retourne des messages adaptés pour les partenaires externes', () => {
  // Matin (< 12h)
  assert.equal(getSalutation(undefined, 9, 1, 'partenaire_externe'), 'Bonjour !');
  assert.equal(getSalutation('Marc', 9, 1, 'partenaire_externe'), 'Bonjour Marc !');

  // Après-midi (< 18h)
  assert.equal(getSalutation(undefined, 14, 1, 'partenaire_externe'), 'Bon après-midi !');
  assert.equal(getSalutation('Sophie', 14, 1, 'partenaire_externe'), 'Bon après-midi Sophie !');

  // Soir (>= 18h)
  assert.equal(getSalutation(undefined, 19, 1, 'partenaire_externe'), 'Bonsoir !');
  assert.equal(getSalutation('Jean', 20, 1, 'partenaire_externe'), 'Bonsoir Jean !');
});

test('getSalutation gère les audiences employe et commercial', () => {
  // Nuit (< 5h)
  assert.equal(getSalutation('Nina', 3, 2, 'employe'), 'Vous êtes couché·e très tard Nina !');

  // Matinée (< 9h)
  assert.equal(getSalutation('Nina', 8, 2, 'employe'), 'Belle matinée Nina, on attaque !');

  // Lundi matin (< 11h)
  assert.equal(getSalutation('Nina', 10, 1, 'employe'), 'Belle semaine en perspective Nina !');

  // Jeudi après-midi (< 18h) commercial vs employe
  assert.equal(getSalutation('Alex', 15, 4, 'commercial'), 'Le weekend approche Alex, plus que quelques appels !');
  assert.equal(getSalutation('Alex', 15, 4, 'employe'), 'Le weekend approche Alex, la journée avance bien !');

  // Soir (< 21h)
  assert.equal(getSalutation('Nina', 19, 2, 'employe'), 'Bonne soirée Nina !');
});

test('getSalutationRefreshDelay calcule un délai positif', () => {
  const delay = getSalutationRefreshDelay(new Date('2026-06-17T10:00:00.000Z'));
  assert.ok(delay >= 1000);
});
