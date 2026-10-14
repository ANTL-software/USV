import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSiteEditPatch, DEFAULT_SITE_QUERY, safeSiteLink, sitePhoneOwnership } from '../../src/utils/scripts/siteProspection.ts';
import type { SiteProspection, SiteEditForm } from '../../src/utils/types/siteProspection.types.ts';
test('tri postal initial, URL sûres et patch limité aux champs corrigés', () => {
 assert.equal(DEFAULT_SITE_QUERY.sort, 'code_postal'); assert.equal(DEFAULT_SITE_QUERY.direction, 'ASC');
 assert.equal(safeSiteLink('javascript:alert(1)'), undefined); assert.equal(safeSiteLink('https://immp.fr/'), 'https://immp.fr/');
 const site = { revision: 4, agence: 'Gogency', suivi: 'a_contacter', agence_statut: 'credit_direct' } as SiteProspection;
 const form: SiteEditForm = { telephone_fixe: '', telephone_source_url: '', entreprise: '', adresse: '', code_postal: '', ville: '', agence: 'Gogency', agence_source_url: '', agence_note: '', suivi: 'a_contacter', agence_statut: 'credit_direct', notes: ' rappel ' };
 assert.deepEqual(buildSiteEditPatch(site, form), { revision: 4, notes: 'rappel' });
});
test('les récurrences restent distinctes de la preuve de prestataire', () => {
 const proof = { number: '0145678901', type: 'fixe', source_url: 'https://example.fr/contact', checked_at: '2026-10-08', mode: 'page_indexee', excerpt: 'Téléphone', eligible: false, excluded_reason: 'à confirmer', ownership_role: 'inconnu', cross_site_count: 3, cross_company_count: 3, cross_site_signal: 'recurrence_a_examiner' };
 const labels = sitePhoneOwnership(proof);
 assert.equal(labels.roleLabel, 'Propriétaire à confirmer');
 assert.match(labels.recurrenceLabel, /sans attribution certaine/);
 assert.match(sitePhoneOwnership({ ...proof, cross_site_signal: 'standard_partage' }).recurrenceLabel, /Standard partagé/);
});
