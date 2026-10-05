import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBookingLeadPayload, createBookingLeadDraft, getBookingLeadSlots, prefillBookingLead, preserveUnchangedBookingProspectFields } from '../../src/utils/scripts/bookingLead.ts';
import { LEAD_CONTACT_ORIGIN_OPTIONS } from '../../src/utils/scripts/leadContactOrigin.ts';
import type { BookingLeadConfig } from '../../src/utils/types/bookingLead.types.ts';
const config: BookingLeadConfig = { lead_booking: { open_weekdays: [1, 5], weekly_slots: { 1: ['11:00', '18:00'], 5: ['14:00'] } }, origins: LEAD_CONTACT_ORIGIN_OPTIONS };
const draft = { ...createBookingLeadDraft('2030-10-11'), raison_sociale: 'Entreprise test', heure_rdv: '14:00', interlocuteur_nom: 'Durand Claire', telephone_contact_snapshot: '0612345678', origine_contact: 'demarchage_pied', origine_contact_detail: ' Boutique ', effectif_min: '1', effectif_max: '4' };
test('agenda creation sends the same lead contact, address, notes and origin snapshots, without campaign/agent/call forgery', () => {
  const result = buildBookingLeadPayload(draft, undefined, config, [], '2030-10-01');
  assert.equal(result.error, undefined); assert.equal(result.payload?.origine_contact_detail, 'Boutique');
  assert.equal(result.payload?.raison_sociale, 'Entreprise test');
  assert.equal(result.payload?.effectif_min, 1);
  assert.equal('id_agent' in (result.payload || {}), false); assert.equal('id_appel' in (result.payload || {}), false); assert.equal('id_campagne' in (result.payload || {}), false);
  const existing = buildBookingLeadPayload(draft, 41, config, [], '2030-10-01').payload;
  assert.equal(existing?.id_prospect, 41); assert.equal(existing?.raison_sociale, undefined);
});
test('closed days, hours, reserved starts and missing configuration cannot be submitted', () => {
  for (const value of [ { ...draft, date_rdv: '2030-10-12' }, { ...draft, heure_rdv: '13:00' }, { ...draft, date_rdv: '2000-01-01' } ]) assert.ok(buildBookingLeadPayload(value, 41, config, [], '2030-10-01').error);
  assert.ok(buildBookingLeadPayload(draft, 41, config, ['14:00'], '2030-10-01').error);
  assert.ok(buildBookingLeadPayload(draft, 41, null, [], '2030-10-01').error);
  assert.deepEqual(getBookingLeadSlots(config, '2030-10-11'), ['14:00']);
  assert.deepEqual(getBookingLeadSlots(config, '2030-10-07'), ['11:00', '18:00']);
});
test('workforce, contact and origin validation preserve editable draft', () => {
  for (const patch of [{ effectif_min: '6', effectif_max: '2' }, { effectif_min: '-1' }, { interlocuteur_nom: '' }, { telephone_contact_snapshot: '' }, { origine_contact: 'invented' }, { origine_contact: '' }]) assert.ok(buildBookingLeadPayload({ ...draft, ...patch }, undefined, config, [], '2030-10-01').error);
  assert.equal(draft.effectif_min, '1');
});
test('existing enterprise prefill uses a real contact rather than company name', () => {
  const value = prefillBookingLead(draft, { id_prospect: 41, nom: 'COMPANY', raison_sociale: 'Company', telephone: '0112345678' });
  assert.equal(value.interlocuteur_nom, ''); assert.equal(value.telephone_contact_snapshot, '0112345678'); assert.equal(value.date_rdv, draft.date_rdv); assert.equal(value.origine_contact, 'demarchage_pied');
});
test('origin options cover acquisition channels with lowercase antl brand', () => {
  assert.equal(LEAD_CONTACT_ORIGIN_OPTIONS[0].value, 'telephone');
  assert.equal(LEAD_CONTACT_ORIGIN_OPTIONS[0].label, 'Prospection téléphonique');
  assert.equal(new Set(LEAD_CONTACT_ORIGIN_OPTIONS.map(({ value }) => value)).size, LEAD_CONTACT_ORIGIN_OPTIONS.length);
  for (const value of ['demarchage_pied', 'site_web', 'reseau_social', 'recommandation_client', 'salon_evenement', 'autre']) assert.ok(LEAD_CONTACT_ORIGIN_OPTIONS.some((option) => option.value === value));
  assert.ok(LEAD_CONTACT_ORIGIN_OPTIONS.every(({ label }) => !label.includes('ANTL')));
});

test('existing prospect address and workforce are patched only if changed, like the script', () => {
  const prospect = { id_prospect: 41, nom: 'Company', decisionnaire_nom: 'Durand Claire', telephone: '0612345678', adresse_facturation: '1 rue', ville: 'Paris', effectif_min: 1, effectif_max: 4 };
  const prefilled = prefillBookingLead(draft, prospect);
  const payload = buildBookingLeadPayload(prefilled, 41, config, [], '2030-10-01').payload!;
  const unchanged = preserveUnchangedBookingProspectFields(payload, prefilled, prospect);
  assert.equal(unchanged.adresse_prospect, undefined); assert.equal(unchanged.effectif_min, undefined); assert.equal(unchanged.effectif_max, undefined);
  const changedDraft = { ...prefilled, ville: 'Lyon', effectif_max: '6' };
  const changed = preserveUnchangedBookingProspectFields(buildBookingLeadPayload(changedDraft, 41, config, [], '2030-10-01').payload!, changedDraft, prospect);
  assert.equal(changed.adresse_prospect?.ville, 'Lyon'); assert.equal(changed.effectif_max, 6);
});
