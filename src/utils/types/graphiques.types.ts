/**
 * Types pour les statistiques de graphiques de supervision
 */

export interface AppelsParHeure {
  heure: number;
  nb_appels: number;
}

export interface TauxAbouti {
  aboutis: number;
  non_aboutis: number;
  taux_abouti: number;
}

export interface DureeMoyenneParJour {
  date: string;
  duree_moyenne: number;
}

export interface RaisonEchec {
  raison: string;
  nombre: number;
}

export interface AllGraphiquesStats {
  appelsParHeure: AppelsParHeure[];
  tauxAbouti: TauxAbouti;
  dureeMoyenne7j: DureeMoyenneParJour[];
  topRaisons: RaisonEchec[];
  appelsParStatut: StatutAppelCount[];
  statutsParHeure: StatutAppelParHeure[];
  appelsParOrigine: AppelsParOrigine[];
  amdStats: AmdStats;
}

export interface AmdStats {
  totalCalls: number;
  qualifiedCalls: number;
  humanCount: number;
  sviCount: number;
  messagingCount: number;
  faxCount: number;
  unknownCount: number;
  pendingCount: number;
  systemEndedCount: number;
  bridgeCount: number;
  avgBridgeDelaySeconds: number;
  sviDurationSampleCount: number;
  avgSviDurationSeconds: number;
}

// Labels pour les statuts d'appels
export const STATUT_LABELS: Record<string, string> = {
  non_abouti: 'Non abouti',
  occupe: 'Occupé',
  pas_de_reponse: 'Pas de réponse',
  messagerie: 'Messagerie',
  refus_definitif: 'Refus définitif',
  abouti: 'Abouti',
  rdv_pris: 'RDV pris',
  vente_conclue: 'Vente conclue',
};

// Couleurs pour les statuts d'appels
export const STATUT_COLORS: Record<string, string> = {
  non_abouti: '#95a5a6',
  occupe: '#f39c12',
  pas_de_reponse: '#e67e22',
  messagerie: '#3498db',
  refus_definitif: '#e74c3c',
  abouti: '#a78bfa',
  rdv_pris: '#9b59b6',
  vente_conclue: '#2ecc71',
};

// Types supplémentaires pour les graphiques
export interface StatutAppelCount {
  statut: string;
  nombre: number;
}

export interface StatutAppelParHeure {
  heure: number;
  statuts: Record<string, number>;
}

export interface AppelsParOrigine {
  origine: string;
  nombre: number;
}
