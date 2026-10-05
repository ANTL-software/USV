import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLeadScheduleRows, toggleLeadScheduleSlot } from '../../src/utils/scripts/leadBookingSchedule.ts';

test('changing the grid interval retains selected quarter-hour slots and boundaries', () => {
  const rows = buildLeadScheduleRows(60, { 1: ['11:15'] });
  assert.equal(rows[0], '08:00');
  assert.equal(rows.at(-1), '19:00');
  assert.ok(rows.includes('11:15'));
  assert.equal(buildLeadScheduleRows(15, {}).length, 45);
});
test('toggle opens and closes only the selected campaign weekday and time', () => {
  const slots = { 1: ['11:00'], 5: ['14:00'] };
  const opened = toggleLeadScheduleSlot(slots, 1, '12:00');
  assert.deepEqual(opened[1], ['11:00', '12:00']);
  assert.deepEqual(toggleLeadScheduleSlot(opened, 1, '11:00')[1], ['12:00']);
  assert.deepEqual(opened[5], ['14:00']);
  assert.deepEqual(slots[1], ['11:00']);
});
