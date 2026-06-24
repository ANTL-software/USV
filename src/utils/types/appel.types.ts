import type { Employe } from './user.types';

export type StatutAppel =
  | 'en_cours'
  | 'abouti'
  | 'non_abouti'
  | 'rendez_vous_pris'
  | 'rdv_pris'
  | 'vente_conclue'
  | 'refus_definitif'
  | 'siege'
  | 'faillite'
  | 'pas_attribue'
  | 'particulier'
  | 'pas_disponible'
  | 'fax'
  | 'doublon'
  | 'optout'
  | 'repondeur'
  | 'relance'
  | 'amd_repondeur_auto'
  | 'amd_fax_auto'
  | 'amd_machine_start_auto';

export type OrigineAppel = 'auto' | 'manuel' | 'rappel';

export interface Appel {
  id_appel: number;
  id_prospect: number;
  id_agent: number;
  id_campagne: number;
  id_rendez_vous_source?: number | null;
  date_appel: string;
  duree_secondes?: number | null;
  statut_appel: StatutAppel;
  notes?: string | null;
  abouti: boolean;
  answered_by?: string | null;
  amd_mode?: string | null;
  amd_status?: string | null;
  amd_completed_at?: string | null;
  amd_latency_ms?: number | null;
  call_classification?: string | null;
  svi_detecte?: boolean;
  bridged_to_agent_at?: string | null;
  ended_by_system?: boolean;
  end_reason?: string | null;
  progpa_atteint: number;
  created_at: string;
  updated_at: string;
  Employe?: Employe;
}
