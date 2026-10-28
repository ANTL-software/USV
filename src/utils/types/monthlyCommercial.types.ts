import type { PrimeStats } from './user.types.ts';
import type { QualiteProgpaStatsResponse } from './qualite.types.ts';

export interface MonthlyCommercial {
  id_employe: number;
  nom: string;
  prenom: string;
  actif: boolean;
}
export type CommercialActivityFilter = 'active' | 'inactive' | 'all';

export type MonthlyCommercialPeriodPreset = 'current' | 'previous' | 'custom';
export interface MonthlyCommercialCampaign {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: string;
}
export interface MonthlyCommercialStats {
  periode: { mois: string; date_debut: string; date_fin: string };
  campagnes: MonthlyCommercialCampaign[];
  id_campagne: number | null;
  progpa_stats: QualiteProgpaStatsResponse;
  production_campagne: (PrimeStats['production'] & { valeur_realisee: number }) | null;
  prime: PrimeStats | null;
}
