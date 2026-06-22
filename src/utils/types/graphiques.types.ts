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
  rendez_vous_pris: 'Rendez-vous pris',
  refus_definitif: 'Refus définitif',
  abouti: 'Abouti',
  rdv_pris: 'Commande à émettre',
  vente_conclue: 'Vente conclue',
  relance: 'Relance',
  repondeur: 'Répondeur',
  siege: 'Siège',
  faillite: 'Faillite',
  pas_attribue: 'Pas attribué',
  particulier: 'Particulier',
  pas_disponible: 'Pas disponible',
  fax: 'Fax',
  doublon: 'Doublon',
  optout: 'Opt-out',
  amd_repondeur_auto: 'Répondeur auto coupé',
  amd_fax_auto: 'Fax auto coupé',
};

// Couleurs pour les statuts d'appels
export const STATUT_COLORS: Record<string, string> = {
  non_abouti: '#95a5a6',
  occupe: '#f39c12',
  pas_de_reponse: '#e67e22',
  rendez_vous_pris: '#3498db',
  refus_definitif: '#e74c3c',
  abouti: '#a78bfa',
  rdv_pris: '#9b59b6',
  vente_conclue: '#2ecc71',
  relance: '#10b981',
  repondeur: '#e11d48',
  siege: '#64748b',
  faillite: '#991b1b',
  pas_attribue: '#0891b2',
  particulier: '#8b5cf6',
  pas_disponible: '#be185d',
  fax: '#64748b',
  doublon: '#64748b',
  optout: '#ef4444',
  amd_repondeur_auto: '#f97316',
  amd_fax_auto: '#475569',
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
