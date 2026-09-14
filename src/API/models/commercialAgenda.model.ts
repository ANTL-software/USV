import type { CommercialAgendaAgent, RendezVousItem } from '../../utils/types/index.ts';

export function normalizeCommercialAgendaAgent(agent: CommercialAgendaAgent): CommercialAgendaAgent {
  return {
    ...agent,
    id_employe: Number(agent.id_employe),
    couleur: agent.couleur ?? null,
  };
}

export function normalizeCommercialAgendaRendezVous(rendezVous: RendezVousItem): RendezVousItem {
  return {
    ...rendezVous,
    id_rendez_vous: Number(rendezVous.id_rendez_vous),
    id_agent: Number(rendezVous.id_agent),
    id_prospect: Number(rendezVous.id_prospect),
    id_campagne: Number(rendezVous.id_campagne),
    motif: rendezVous.motif ?? null,
    notes: rendezVous.notes ?? null,
    appelsSource: rendezVous.appelsSource ?? [],
  };
}
