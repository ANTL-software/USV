import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSiteEditPatch, DEFAULT_SITE_QUERY, safeSiteLink } from '../../src/utils/scripts/siteProspection.ts';
import type { SiteProspection, SiteEditForm } from '../../src/utils/types/siteProspection.types.ts';
test('tri postal initial, URL sûres et patch limité aux champs corrigés', () => {
 assert.equal(DEFAULT_SITE_QUERY.sort, 'code_postal'); assert.equal(DEFAULT_SITE_QUERY.direction, 'ASC');
 assert.equal(safeSiteLink('javascript:alert(1)'), undefined); assert.equal(safeSiteLink('https://immp.fr/'), 'https://immp.fr/');
 const site = { revision: 4, agence: 'Gogency', suivi: 'a_contacter', agence_statut: 'credit_direct' } as SiteProspection;
 const form: SiteEditForm = { entreprise: '', adresse: '', code_postal: '', ville: '', agence: 'Gogency', agence_source_url: '', agence_note: '', suivi: 'a_contacter', agence_statut: 'credit_direct', notes: ' rappel ' };
 assert.deepEqual(buildSiteEditPatch(site, form), { revision: 4, notes: 'rappel' });
});
