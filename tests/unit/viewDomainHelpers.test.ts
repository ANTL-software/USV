import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildEnrichmentComparisonFieldViews,
  buildEnrichmentFieldViews,
  buildEnrichmentSourceViews,
  buildVigieDateRange,
  extractWebsiteAnalysis,
  formatEnrichmentValue,
  formatEnrichmentPayload,
  formatLeadProspectAddress,
  formatLeadProspectLabel,
  getEmailSignalStrength,
  getLeadQualificationButtonClass,
  getPageSignalStrength,
  getPersonSignalStrength,
  getPhoneSignalStrength,
  getVigiePayloadLabel,
  getTopVigieContactHours,
  resolveLeadContactEmail,
  resolveLeadContactName,
  resolveLeadContactPhone,
} from '../../src/utils/scripts/index.ts';
import type { LeadClient, ProspectEnrichmentSnapshot, VigieAction } from '../../src/utils/types/index.ts';

function createLead(overrides: Partial<LeadClient> = {}): LeadClient {
  return {
    id_lead: 12,
    id_agent: 4,
    id_prospect: 8,
    id_campagne: 7,
    date_rdv: '2026-07-20',
    heure_rdv: '10:30:00',
    motif: 'Rendez-vous MMA',
    statut: 'planifie',
    created_at: '2026-07-15T10:00:00.000Z',
    updated_at: '2026-07-15T10:00:00.000Z',
    prospect: {
      id_prospect: 8,
      nom: 'DUPONT',
      prenom: 'Alice',
      raison_sociale: 'Entreprise Test',
      nom_contact: 'Contact historique',
      telephone: '0102030405',
      telephone_contact: '0601020304',
      email: 'contact@entreprise.fr',
      adresse_facturation: '1 rue de Paris',
      code_postal: '75001',
      ville: 'Paris',
      pays: 'France',
    },
    ...overrides,
  };
}

test('les helpers lead utilisent les snapshots avant les données prospect', () => {
  const lead = createLead({
    interlocuteur_nom: 'Décideur figé',
    telephone_contact_snapshot: '0611111111',
    email_contact_snapshot: 'decision@client.fr',
  });

  assert.equal(formatLeadProspectLabel(lead), 'Entreprise Test');
  assert.equal(resolveLeadContactName(lead), 'Décideur figé');
  assert.equal(resolveLeadContactPhone(lead), '0611111111');
  assert.equal(resolveLeadContactEmail(lead), 'decision@client.fr');
  assert.equal(formatLeadProspectAddress(lead), '1 rue de Paris, 75001 Paris, France');
  assert.equal(getLeadQualificationButtonClass('non_honore'), 'qualif-btn--non-honore');
});

test('les signaux enrichissement classent les preuves publiques', () => {
  assert.equal(formatEnrichmentValue('   '), '—');
  assert.equal(formatEnrichmentValue(1250), '1 250');
  assert.equal(getPageSignalStrength('https://client.fr/mentions-legales'), 'fort');
  assert.equal(getPageSignalStrength('https://client.fr/equipe'), 'moyen');
  assert.equal(getEmailSignalStrength('direction@client.fr'), 'fort');
  assert.equal(getPhoneSignalStrength('06 12 34 56 78'), 'fort');
  assert.equal(getPhoneSignalStrength('01 23 45 67 89'), 'moyen');
  assert.equal(getPersonSignalStrength(40), 'fort');
  assert.equal(getPersonSignalStrength(19), 'faible');
});

test('extractWebsiteAnalysis lit uniquement la preuve web attendue', () => {
  const snapshot = {
    enrichissement: {
      enrichissement_payload: {
        web_osint: {
          website_analysis: {
            domain: 'client.fr',
            professional_emails: ['direction@client.fr'],
          },
        },
      },
    },
  } as ProspectEnrichmentSnapshot;

  assert.deepEqual(extractWebsiteAnalysis(snapshot), {
    domain: 'client.fr',
    professional_emails: ['direction@client.fr'],
  });
});

test('les comparaisons et sources enrichissement sont préparées hors du composant', () => {
  const enrichment: ProspectEnrichmentSnapshot['enrichissement'] = {
    site_web: 'https://client.fr',
    linkedin_company_url: null,
    linkedin_decisionnaire_url: null,
    decisionnaire_nom: 'Alice Martin',
    decisionnaire_fonction: 'Direction',
    decisionnaire_email_pro: 'alice@client.fr',
    telephone_tertiaire: '0612345678',
    telephone_tertiaire_source: 'site web',
    decisionnaire_source: 'official_website_public',
    decisionnaire_source_url: 'https://client.fr/equipe',
    enrichissement_statut: 'enrichi',
    enrichissement_score: 86,
    enrichissement_dernier_check_at: '2026-07-16T10:00:00.000Z',
    enrichissement_payload: { source: 'public' },
    enrichissement_sources: [],
  };

  const fields = buildEnrichmentFieldViews(enrichment);
  assert.equal(fields.find(({ label }) => label === 'Statut')?.value, 'Enrichi');
  assert.equal(fields.find(({ label }) => label === 'Score')?.value, '86');
  assert.deepEqual(buildEnrichmentSourceViews([
    { type: 'website', origin: 'official_website_public', url: 'https://client.fr' },
    null,
  ]), [{
    key: 'https://client.fr-0',
    type: 'Site web',
    origin: 'Site public validé',
    url: 'https://client.fr',
  }]);
  assert.equal(formatEnrichmentPayload({ source: 'public' }), '{\n  "source": "public"\n}');
});

test('la comparaison enrichissement expose téléphones et effectifs avant validation', () => {
  const current = {
    contacts_internes: {
      telephone: '0140000000',
      telephone_contact: null,
      telephone_secondaire: null,
    },
    identite_societe: {
      effectif: 12,
      effectif_enrichi: null,
      effectif_enrichi_nature: null,
      effectif_enrichi_perimetre: null,
      effectif_enrichi_annee: null,
      effectif_enrichi_confiance: null,
      effectif_estime: null,
      effectif_estime_confiance: null,
    },
    enrichissement: {
      telephone_tertiaire: null,
      telephone_tertiaire_source: null,
    },
  } as ProspectEnrichmentSnapshot;
  const proposed = {
    ...current,
    identite_societe: {
      ...current.identite_societe,
      effectif_enrichi: 18,
      effectif_enrichi_nature: 'effectif_moyen_annuel_declare',
      effectif_enrichi_perimetre: 'entreprise',
      effectif_enrichi_annee: 2024,
      effectif_enrichi_confiance: 'forte',
      effectif_estime: 20,
      effectif_estime_confiance: 'moyenne',
    },
    enrichissement: {
      ...current.enrichissement,
      telephone_tertiaire: '0612345678',
      telephone_tertiaire_source: 'official_website_public_mobile_candidate',
    },
  } as ProspectEnrichmentSnapshot;

  const fields = buildEnrichmentComparisonFieldViews(current, proposed);

  assert.deepEqual(fields.find(({ label }) => label === 'Téléphone public proposé'), {
    label: 'Téléphone public proposé',
    currentValue: '—',
    proposedValue: '0612345678',
  });
  assert.deepEqual(fields.find(({ label }) => label === 'Effectif enrichi'), {
    label: 'Effectif enrichi',
    currentValue: '—',
    proposedValue: '18',
  });
  assert.deepEqual(fields.find(({ label }) => label === 'Nature / périmètre effectif'), {
    label: 'Nature / périmètre effectif',
    currentValue: '—',
    proposedValue: 'effectif_moyen_annuel_declare · entreprise',
  });
});

test('les périodes et libellés Vigie restent déterministes', () => {
  const range = buildVigieDateRange('7d');
  const start = new Date(`${range.dateDebut}T12:00:00`);
  const end = new Date(`${range.dateFin}T12:00:00`);
  assert.equal((end.getTime() - start.getTime()) / 86_400_000, 6);
  assert.equal(buildVigieDateRange('since-june').dateDebut, '2026-06-01');

  const action = {
    payload: { secteur: '', titre: 'Relancer les prospects chauds' },
  } as VigieAction;
  assert.equal(getVigiePayloadLabel(action), 'Relancer les prospects chauds');

  const hours = [
    { heure: 9, appels: 10, contacts_humains: 2, taux_contact_humain: 20 },
    { heure: 10, appels: 10, contacts_humains: 5, taux_contact_humain: 50 },
    { heure: 11, appels: 10, contacts_humains: 0, taux_contact_humain: null },
  ];
  assert.deepEqual(getTopVigieContactHours(hours, 2).map(({ heure }) => heure), [10, 9]);
  assert.deepEqual(hours.map(({ heure }) => heure), [9, 10, 11]);
});
