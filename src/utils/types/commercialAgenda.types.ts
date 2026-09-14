import type { View } from 'react-big-calendar';
import type { RendezVousItem, StatutRendezVous } from './rendezVous.types.ts';

export interface CommercialAgendaAgent {
  id_employe: number;
  nom: string;
  prenom: string;
  couleur: string | null;
  actif: boolean;
  poste?: {
    id_poste: number;
    libelle_poste: string;
    type_poste: 'commercial';
  };
}

export interface CommercialAgendaAgentOption {
  value: number;
  label: string;
}

export interface CommercialAgendaEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: RendezVousItem;
}

export interface CommercialAgendaUpdatePayload {
  date_rdv: string;
  heure_rdv: string;
  statut: Exclude<StatutRendezVous, 'effectue'>;
}

export interface CommercialAgendaEditForm {
  date: string;
  time: string;
  statut: Exclude<StatutRendezVous, 'effectue'>;
  error: string;
}

export interface CommercialAgendaPresentation {
  campaignLabel: string;
  dateLabel: string;
  editable: boolean;
  lockedMessage: string | null;
  notes: string | null;
  phone: string | null;
  prospectLabel: string;
  statusColor: string;
  statusLabel: string;
  textColor: string;
  timeLabel: string;
}

export interface CommercialAgendaCalendarState {
  currentDate: Date;
  currentView: View;
}
