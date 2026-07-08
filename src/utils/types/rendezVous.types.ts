import type { StatutAppel } from './appel.types.ts';
import type { CampaignVariant } from '../scripts/campaignVariants.ts';

export type StatutRendezVous =
  | 'planifie'
  | 'effectue'
  | 'annule'
  | 'reporte'
  | 'non_honore';

export interface RendezVousAgent {
  id_employe: number;
  nom: string;
  prenom: string;
  email?: string;
}

export interface RendezVousProspect {
  id_prospect: number;
  nom: string;
  prenom?: string | null;
  nom_contact?: string | null;
  email?: string | null;
  telephone?: string | null;
  telephone_contact?: string | null;
  raison_sociale?: string | null;
  adresse_facturation?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  pays?: string | null;
  decisionnaire_nom?: string | null;
  decisionnaire_fonction?: string | null;
  decisionnaire_email_pro?: string | null;
  statut?: string | null;
}

export interface RendezVousCampagne {
  id_campagne: number;
  nom_campagne: string;
  type_campagne?: CampaignVariant | null;
}

export interface RendezVousAppelSource {
  id_appel: number;
  statut_appel: StatutAppel;
}

export interface RendezVousItem {
  id_rendez_vous: number;
  id_agent: number;
  id_prospect: number;
  id_campagne: number;
  date_rdv: string;
  heure_rdv: string;
  motif: string | null;
  interlocuteur_nom?: string | null;
  interlocuteur_role?: string | null;
  telephone_contact_snapshot?: string | null;
  email_contact_snapshot?: string | null;
  notes?: string | null;
  statut: StatutRendezVous;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  derniere_note_closing?: string | null;
  agent?: RendezVousAgent;
  prospect?: RendezVousProspect;
  campagne?: RendezVousCampagne;
  appelsSource?: RendezVousAppelSource[];
}

export type LeadClient = Omit<RendezVousItem, 'id_rendez_vous'> & {
  id_lead: number;
  id_appel?: number | null;
};

export interface LeadClientListParams {
  campagne?: number;
  statut?: StatutRendezVous;
  agent?: number;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  limit?: number;
  soft_deleted?: boolean;
}

export interface LeadClientStats {
  total: number;
  planifies: number;
  effectues: number;
  annules: number;
  reportes: number;
  nonHonores: number;
}

export const STATUT_RENDEZ_VOUS_LABELS: Record<StatutRendezVous, string> = {
  planifie: 'Planifié',
  effectue: 'Effectué',
  annule: 'Annulé',
  reporte: 'Reporté',
  non_honore: 'Non honoré',
};

export const STATUT_RENDEZ_VOUS_COLORS: Record<StatutRendezVous, string> = {
  planifie: '#2563eb',
  effectue: '#16a34a',
  annule: '#dc2626',
  reporte: '#f59e0b',
  non_honore: '#6b7280',
};

export const STATUT_RENDEZ_VOUS_OPTIONS: { value: StatutRendezVous; label: string }[] = [
  { value: 'planifie', label: 'Planifié' },
  { value: 'effectue', label: 'Effectué' },
  { value: 'annule', label: 'Annulé' },
  { value: 'reporte', label: 'Reporté' },
  { value: 'non_honore', label: 'Non honoré' },
];
