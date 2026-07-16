export type AlerteType =
  | 'taux_echec'
  | 'duree_courte'
  | 'zero_appel'
  | 'consommation_trunk';

export type AlerteStatut = 'inactive' | 'active' | 'resolue';

export interface AlerteDestinataire {
  type: 'email' | 'webhook';
  value: string;
}

export interface AlerteConfig {
  id_alerte: number;
  type_alerte: AlerteType;
  seuil?: number;
  seuil_duree?: number;
  seuil_minutes?: number;
  actif: boolean;
  destinataires: AlerteDestinataire[];
}

export interface CreateAlerteConfigPayload {
  type_alerte: AlerteType;
  seuil?: number;
  seuil_duree?: number;
  seuil_minutes?: number;
  destinataires: AlerteDestinataire[];
}

export type UpdateAlerteConfigPayload = Partial<
  Pick<
    AlerteConfig,
    'seuil' | 'seuil_duree' | 'seuil_minutes' | 'actif' | 'destinataires'
  >
>;

export interface AlerteHistory {
  id_alerte: number;
  type_alerte: AlerteType;
  statut: AlerteStatut;
  derniere_valeur: number | null;
  date_declenchement: string | null;
  date_resolution: string | null;
  commentaire: string | null;
  created_at: string;
}

export interface AlerteHistoryFilters {
  statut: AlerteStatut | '';
  type_alerte: AlerteType | '';
}

export interface AlerteTypeMetadata {
  value: AlerteType;
  label: string;
  description: string;
  unit: string;
}

export const ALERTE_TYPES: AlerteTypeMetadata[] = [
  {
    value: 'taux_echec',
    label: "Taux d'échec élevé",
    description: "Alerte si le taux d'échec dépasse le seuil (%)",
    unit: '%',
  },
  {
    value: 'duree_courte',
    label: 'Durée moyenne courte',
    description: 'Alerte si la durée moyenne des appels est inférieure au seuil (secondes)',
    unit: 's',
  },
  {
    value: 'zero_appel',
    label: 'Aucun appel abouti',
    description: 'Alerte si aucun appel abouti depuis X minutes',
    unit: 'min',
  },
];

export const ALERTE_TYPE_LABELS: Record<AlerteType, string> = {
  taux_echec: "Taux d'échec élevé",
  duree_courte: 'Durée moyenne courte',
  zero_appel: 'Aucun appel abouti',
  consommation_trunk: 'Consommation trunk élevée',
};

export const ALERTE_TYPE_COLORS: Record<AlerteType, string> = {
  taux_echec: '#e74c3c',
  duree_courte: '#f39c12',
  zero_appel: '#e67e22',
  consommation_trunk: '#9b59b6',
};

export const ALERTE_STATUT_LABELS: Record<AlerteStatut, string> = {
  inactive: 'Inactive',
  active: 'Active',
  resolue: 'Résolue',
};

export const ALERTE_STATUT_COLORS: Record<AlerteStatut, string> = {
  inactive: '#95a5a6',
  active: '#e74c3c',
  resolue: '#27ae60',
};
