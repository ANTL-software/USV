import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVigieDateRange, formatVigieDateTime } from '../../src/utils/scripts/vigie.ts';

const cases = [
  ['2026-03-29T00:30:00Z', '2026-03-29', '2026-03-23', '2026-02-28'],
  ['2026-03-29T01:30:00Z', '2026-03-29', '2026-03-23', '2026-02-28'],
  ['2026-03-30T22:30:00Z', '2026-03-31', '2026-03-25', '2026-03-02'],
  ['2026-10-25T00:30:00Z', '2026-10-25', '2026-10-19', '2026-09-26'],
  ['2026-10-25T01:30:00Z', '2026-10-25', '2026-10-19', '2026-09-26'],
  ['2026-10-26T22:30:00Z', '2026-10-26', '2026-10-20', '2026-09-27'],
  ['2026-12-31T23:30:00Z', '2027-01-01', '2026-12-26', '2026-12-03'],
  ['2028-02-29T12:00:00Z', '2028-02-29', '2028-02-23', '2028-01-31'],
];
for (const zone of ['Europe/Paris', 'UTC', 'America/New_York']) {
  test(`les périodes Vigie restent calendaires en Europe/Paris depuis un système ${zone}`, () => {
    const previous = process.env.TZ;
    try {
      process.env.TZ = zone;
      assert.match(formatVigieDateTime('2026-03-29T01:30:00Z'), /03:30/);
      assert.match(formatVigieDateTime('2026-10-25T00:30:00Z'), /02:30/);
      assert.match(formatVigieDateTime('2026-10-25T01:30:00Z'), /02:30/);
      for (const [instant, end, start7, start30] of cases) {
        const now = new Date(instant);
        assert.deepEqual(buildVigieDateRange('today', now), { dateDebut: end, dateFin: end });
        assert.deepEqual(buildVigieDateRange('7d', now), { dateDebut: start7, dateFin: end });
        assert.deepEqual(buildVigieDateRange('30d', now), { dateDebut: start30, dateFin: end });
        assert.deepEqual(buildVigieDateRange('since-june', now), { dateDebut: '2026-06-01', dateFin: end });
        assert.equal(now.toISOString(), instant.replace('Z', '.000Z'));
      }
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
  });
}
