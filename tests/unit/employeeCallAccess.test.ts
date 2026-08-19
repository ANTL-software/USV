import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatDateTimeLocalValue,
  formatScriptCallBlockUntil,
} from '../../src/utils/scripts/employeeDetails.ts';

test('formats an automatic unlock deadline for a datetime-local input', () => {
  const value = formatDateTimeLocalValue(new Date('2026-08-19T14:30:00.000Z'));
  assert.match(value, /^2026-08-19T\d{2}:30$/);
});

test('keeps invalid automatic unlock values out of the UI', () => {
  assert.equal(formatScriptCallBlockUntil('not-a-date'), null);
  assert.equal(formatScriptCallBlockUntil(null), null);
});
