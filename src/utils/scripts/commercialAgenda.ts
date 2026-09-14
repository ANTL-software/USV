import { addMinutes, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  CommercialAgendaAgent,
  CommercialAgendaAgentOption,
  CommercialAgendaEditForm,
  CommercialAgendaEvent,
  CommercialAgendaPresentation,
  CommercialAgendaUpdatePayload,
  RendezVousItem,
} from '../types/index.ts';

const STATUS_COLORS = {
  planifie: '#3b82f6',
  effectue: '#3b82f6',
  reporte: '#3b82f6',
  annule: '#6b7280',
  non_honore: '#6b7280',
} as const;

export const COMMERCIAL_AGENDA_KIND_COLORS = {
  commande: '#E95420',
  rendezVousPris: '#eab308',
  relance: '#10b981',
  relanceVente: '#10b981',
  rappelForce: '#dc2626',
} as const;

export const COMMERCIAL_AGENDA_STATUS_OPTIONS = [
  { value: 'planifie', label: 'Planifié' },
  { value: 'reporte', label: 'Reporté' },
  { value: 'non_honore', label: 'Non honoré' },
  { value: 'annule', label: 'Annulé' },
] as const;

type CallSource = RendezVousItem['appelsSource'];

function hasCallStatus(appelsSource: CallSource, status: string): boolean {
  return Boolean(appelsSource?.some((call) => call.statut_appel === status));
}

export function isCommercialAgendaSaleFollowup(rendezVous: RendezVousItem): boolean {
  if (hasCallStatus(rendezVous.appelsSource, 'vente_conclue')) return true;
  const motif = String(rendezVous.motif || '').trim().toLowerCase();
  return motif === 'relance vente conclue' || (motif.includes('relance') && motif.includes('vente conclue'));
}

function isCommercialAgendaOrder(rendezVous: RendezVousItem): boolean {
  if (hasCallStatus(rendezVous.appelsSource, 'rdv_pris')) return true;
  const motif = String(rendezVous.motif || '').trim().toLowerCase();
  if (motif.includes('relance vente conclue')) return false;
  return motif === 'cde'
    || motif === 'commande à établir'
    || motif === 'commande a etablir'
    || motif.includes('commande')
    || motif.includes('etablir')
    || motif.includes('établir')
    || /\bcde\b/.test(motif);
}

function isCommercialAgendaCustomerAppointment(rendezVous: RendezVousItem): boolean {
  if (hasCallStatus(rendezVous.appelsSource, 'rendez_vous_pris')) return true;
  const motif = String(rendezVous.motif || '').trim().toLowerCase();
  return motif === 'rendez-vous'
    || motif === 'rendez vous'
    || motif.includes('rendez-vous pris')
    || motif.includes('rendez vous pris')
    || motif.includes('rendez-vous valide')
    || motif.includes('rendez vous valide')
    || motif.includes('rdv pris')
    || motif.includes('rdv valide');
}

function isCommercialAgendaFollowup(rendezVous: RendezVousItem): boolean {
  if (isCommercialAgendaSaleFollowup(rendezVous)) return false;
  if (hasCallStatus(rendezVous.appelsSource, 'relance')) return true;
  return String(rendezVous.motif || '').trim().toLowerCase().includes('relance');
}

export function getCommercialAgendaAppearance(rendezVous: RendezVousItem): {
  color: string;
  label: string;
  textColor: string;
} {
  if (rendezVous.is_rappel_force) {
    return { color: COMMERCIAL_AGENDA_KIND_COLORS.rappelForce, label: 'Rappel forcé', textColor: '#ffffff' };
  }
  if (isCommercialAgendaSaleFollowup(rendezVous)) {
    return { color: COMMERCIAL_AGENDA_KIND_COLORS.relanceVente, label: 'Relance', textColor: '#ffffff' };
  }
  if (isCommercialAgendaOrder(rendezVous)) {
    return { color: COMMERCIAL_AGENDA_KIND_COLORS.commande, label: 'Commande à établir', textColor: '#ffffff' };
  }
  if (isCommercialAgendaCustomerAppointment(rendezVous)) {
    return { color: COMMERCIAL_AGENDA_KIND_COLORS.rendezVousPris, label: 'Rendez-vous pris', textColor: '#0f172a' };
  }
  if (isCommercialAgendaFollowup(rendezVous)) {
    return { color: COMMERCIAL_AGENDA_KIND_COLORS.relance, label: 'Relance', textColor: '#ffffff' };
  }

  const labels = {
    planifie: 'Rappel',
    effectue: 'Effectué',
    reporte: 'Reporté',
    annule: 'Annulé',
    non_honore: 'Non honoré',
  } as const;
  return {
    color: STATUS_COLORS[rendezVous.statut],
    label: labels[rendezVous.statut],
    textColor: '#ffffff',
  };
}

export function formatCommercialAgendaAgent(agent: CommercialAgendaAgent): string {
  return `${agent.prenom} ${agent.nom.toUpperCase()}`;
}

export function toCommercialAgendaAgentOption(agent: CommercialAgendaAgent): CommercialAgendaAgentOption {
  return { value: agent.id_employe, label: formatCommercialAgendaAgent(agent) };
}

export function formatCommercialAgendaProspect(rendezVous: RendezVousItem): string {
  const prospect = rendezVous.prospect;
  if (!prospect) return `Prospect #${rendezVous.id_prospect}`;
  const contact = [prospect.prenom, prospect.nom].filter(Boolean).join(' ').trim();
  return contact || prospect.raison_sociale || `Prospect #${rendezVous.id_prospect}`;
}

export function toCommercialAgendaEvent(rendezVous: RendezVousItem): CommercialAgendaEvent {
  const start = parseISO(`${rendezVous.date_rdv}T${rendezVous.heure_rdv}`);
  const motif = rendezVous.motif ? ` — ${rendezVous.motif}` : '';
  const campagne = rendezVous.campagne?.nom_campagne ? ` · ${rendezVous.campagne.nom_campagne}` : '';
  return {
    id: rendezVous.id_rendez_vous,
    title: `${formatCommercialAgendaProspect(rendezVous)}${motif}${campagne}`,
    start,
    end: addMinutes(start, 15),
    resource: rendezVous,
  };
}

export function buildCommercialAgendaPresentation(rendezVous: RendezVousItem): CommercialAgendaPresentation {
  const appearance = getCommercialAgendaAppearance(rendezVous);
  const lockedMessage = rendezVous.is_rappel_force
    ? 'Ce rappel forcé est piloté par la Vigie et ne peut pas être déplacé depuis l’agenda.'
    : isCommercialAgendaSaleFollowup(rendezVous)
      ? 'Cette relance de vente conclue est automatique et ne peut pas être déplacée depuis l’agenda.'
      : null;

  return {
    campaignLabel: rendezVous.campagne?.nom_campagne || `Campagne #${rendezVous.id_campagne}`,
    dateLabel: format(parseISO(rendezVous.date_rdv), 'EEEE d MMMM yyyy', { locale: fr }),
    editable: lockedMessage === null,
    lockedMessage,
    notes: rendezVous.is_rappel_force ? rendezVous.notes ?? null : rendezVous.derniere_note_closing ?? null,
    phone: rendezVous.prospect?.telephone ?? rendezVous.prospect?.telephone_contact ?? null,
    prospectLabel: formatCommercialAgendaProspect(rendezVous),
    statusColor: appearance.color,
    statusLabel: appearance.label,
    textColor: appearance.textColor,
    timeLabel: rendezVous.heure_rdv.slice(0, 5),
  };
}

export function createCommercialAgendaEditForm(rendezVous: RendezVousItem): CommercialAgendaEditForm {
  const statut = rendezVous.statut === 'effectue' ? 'planifie' : rendezVous.statut;
  return {
    date: rendezVous.date_rdv,
    time: rendezVous.heure_rdv.slice(0, 5),
    statut,
    error: '',
  };
}

export function buildCommercialAgendaUpdatePayload(form: CommercialAgendaEditForm): {
  error: string | null;
  payload: CommercialAgendaUpdatePayload | null;
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || !/^\d{2}:\d{2}$/.test(form.time)) {
    return { error: 'Veuillez sélectionner une date et une heure valides.', payload: null };
  }
  const date = new Date(`${form.date}T${form.time}:00`);
  if (Number.isNaN(date.getTime())) {
    return { error: 'La date ou l’heure sélectionnée est invalide.', payload: null };
  }
  return {
    error: null,
    payload: {
      date_rdv: form.date,
      heure_rdv: `${form.time}:00`,
      statut: form.statut,
    },
  };
}

export function getCommercialAgendaErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    if (typeof response?.data?.message === 'string') return response.data.message;
  }
  return fallback;
}
