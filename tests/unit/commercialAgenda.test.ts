import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCommercialAgendaPresentation,
  buildCommercialAgendaUpdatePayload,
  getCommercialAgendaAppearance,
  toCommercialAgendaEvent,
} from '../../src/utils/scripts/commercialAgenda.ts';
import type { RendezVousItem } from '../../src/utils/types/rendezVous.types.ts';

function createRendezVous(overrides: Partial<RendezVousItem> = {}): RendezVousItem {
  return {
    id_rendez_vous: 31,
    id_agent: 8,
    id_prospect: 15,
    id_campagne: 7,
    date_rdv: '2026-09-16',
    heure_rdv: '14:30:00',
    motif: 'Rappel devis',
    statut: 'planifie',
    created_at: '2026-09-14T10:00:00.000Z',
    updated_at: '2026-09-14T10:00:00.000Z',
    prospect: { id_prospect: 15, nom: 'Durand', prenom: 'Claire', telephone: '0555443322' },
    campagne: { id_campagne: 7, nom_campagne: 'Les Cigales', type_campagne: 'vente' },
    appelsSource: [],
    ...overrides,
  };
}

test('un événement conserve le rendez-vous et son agent source', () => {
  const event = toCommercialAgendaEvent(createRendezVous());
  assert.equal(event.resource.id_agent, 8);
  assert.equal(event.title, 'Claire Durand — Rappel devis · Les Cigales');
  assert.equal(event.end.getTime() - event.start.getTime(), 15 * 60 * 1000);
});

test('les couleurs métier restent alignées avec le calendrier Script', () => {
  assert.deepEqual(getCommercialAgendaAppearance(createRendezVous({ motif: 'Commande à établir' })), {
    color: '#E95420', label: 'Commande à établir', textColor: '#ffffff',
  });
  assert.deepEqual(getCommercialAgendaAppearance(createRendezVous({ motif: 'Rendez-vous pris' })), {
    color: '#eab308', label: 'Rendez-vous pris', textColor: '#0f172a',
  });
  assert.deepEqual(getCommercialAgendaAppearance(createRendezVous({ is_rappel_force: true })), {
    color: '#dc2626', label: 'Rappel forcé', textColor: '#ffffff',
  });
});

test('les événements automatiques restent visibles mais verrouillés', () => {
  const forced = buildCommercialAgendaPresentation(createRendezVous({
    id_rendez_vous: -91,
    is_rappel_force: true,
    notes: 'Priorité supervision',
  }));
  const saleFollowup = buildCommercialAgendaPresentation(createRendezVous({ motif: 'Relance vente conclue' }));

  assert.equal(forced.editable, false);
  assert.equal(forced.notes, 'Priorité supervision');
  assert.equal(saleFollowup.editable, false);
});

test('le payload de déplacement ne transporte jamais id_agent', () => {
  const result = buildCommercialAgendaUpdatePayload({
    date: '2026-09-17',
    time: '09:45',
    statut: 'reporte',
    error: '',
  });

  assert.deepEqual(result.payload, {
    date_rdv: '2026-09-17',
    heure_rdv: '09:45:00',
    statut: 'reporte',
  });
  assert.equal(Object.hasOwn(result.payload ?? {}, 'id_agent'), false);
});
