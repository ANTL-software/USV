import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatCallDuration,
  formatDate,
  formatSince,
  getDirectionBadge,
} from '../../src/utils/scripts/formatters.ts';

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
