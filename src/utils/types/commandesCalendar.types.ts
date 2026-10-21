import type { View } from 'react-big-calendar';
import type { LeadBookingConfig, RendezVousAgent, RendezVousCampagne, RendezVousProspect, StatutRendezVous } from './index.ts';

export interface CommandesCalendarLead {
  id_lead: number;
  id_campagne: number;
  id_agent: number;
  date_rdv: string;
  heure_rdv: string;
  statut: StatutRendezVous;
  interlocuteur_nom?: string | null;
  raison_sociale_snapshot?: string | null;
  telephone_contact_snapshot?: string | null;
  prospect?: Partial<RendezVousProspect> | null;
  campagne?: RendezVousCampagne;
  agent?: RendezVousAgent | null;
}
export interface CommandesCalendarData {
  leads: CommandesCalendarLead[];
  occupied_slots: Array<{ date_rdv: string; heure_rdv: string }>;
  agents: RendezVousAgent[];
  lead_booking: LeadBookingConfig | null;
}
export interface CommandesCalendarSnapshot {
  campaignId: number | null;
  date: string;
  view: 'month' | 'week' | 'day';
  statut: StatutRendezVous | '';
  agentId: number | null;
  search: string;
}
export interface CommandesCalendarEvent {
  labelPrefix?: string;
  company?: string;
  id: string;
  title: string;
  tooltip: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  kind: 'lead' | 'summary' | 'free' | 'locked' | 'occupied';
  leadId?: number;
  cancelled?: boolean;
}
export interface CommandesCalendarQuery {
  campagne: number;
  date_debut: string;
  date_fin: string;
}
export interface CommandesCalendarSearchParams {
  q: string;
  page: number;
  statut?: StatutRendezVous;
  agent?: number;
}
export interface CommandesCalendarSearch {
  leads: CommandesCalendarLead[];
  pagination: { page: number; totalPages: number; total: number };
}
export type CommandesCalendarView = Extract<View, 'month' | 'week' | 'day'>;
