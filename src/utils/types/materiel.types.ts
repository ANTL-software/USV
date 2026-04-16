export type TypeMateriel = 'laptop' | 'pc_fixe' | 'smartphone' | 'tablette' | 'ecran' | 'autre';

export type EtatMateriel = 'neuf' | 'comme_neuf' | 'bon_etat' | 'usage' | 'endommage' | 'en_panne';

export const ETAT_MATERIEL_LABELS: Record<EtatMateriel, string> = {
  neuf:       'Neuf',
  comme_neuf: 'Comme neuf',
  bon_etat:   'Bon état',
  usage:      'Usé',
  endommage:  'Endommagé',
  en_panne:   'En panne',
};

export const ETAT_MATERIEL_OPTIONS: { value: EtatMateriel; label: string }[] = [
  { value: 'neuf',       label: 'Neuf'       },
  { value: 'comme_neuf', label: 'Comme neuf' },
  { value: 'bon_etat',   label: 'Bon état'   },
  { value: 'usage',      label: 'Usé'        },
  { value: 'endommage',  label: 'Endommagé'  },
  { value: 'en_panne',   label: 'En panne'   },
];

export interface EmployeMaterielBasic {
  id_employe: number;
  nom: string;
  prenom: string;
  identifiant: string;
}

export interface MaterielAffectation {
  id_affectation: number;
  id_materiel: number;
  id_employe: number;
  date_affectation: string; // YYYY-MM-DD
  date_restitution: string | null;
  etat_affectation: EtatMateriel | null;
  etat_restitution: EtatMateriel | null;
  notes: string | null;
  created_at?: string;
  employe?: EmployeMaterielBasic;
}

export interface Materiel {
  id_materiel: number;
  nom_machine: string;
  marque: string | null;
  type_materiel: TypeMateriel;
  adresse_mac: string | null;
  numero_serie: string | null;
  rustdesk_id: string | null;
  rustdesk_password: string | null;
  actif: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  affectations?: MaterielAffectation[]; // Affectation active uniquement (date_restitution IS NULL)
}

export interface CreateMaterielPayload {
  nom_machine: string;
  marque?: string;
  type_materiel?: TypeMateriel;
  adresse_mac?: string;
  numero_serie?: string;
  rustdesk_id?: string;
  rustdesk_password?: string;
  actif?: boolean;
  notes?: string;
}

export interface UpdateMaterielPayload {
  nom_machine?: string;
  marque?: string | null;
  type_materiel?: TypeMateriel;
  adresse_mac?: string | null;
  numero_serie?: string | null;
  rustdesk_id?: string | null;
  rustdesk_password?: string | null;
  actif?: boolean;
  notes?: string | null;
}

export interface AffecterMaterielPayload {
  id_employe: number;
  date_affectation?: string;
  etat_affectation?: EtatMateriel;
  notes?: string;
}

export interface RestituerMaterielPayload {
  etat_restitution?: EtatMateriel;
  date_restitution?: string;
}

export interface ApiMaterielResponse {
  success: boolean;
  message?: string;
  data?: Materiel | Materiel[];
  count?: number;
}

export interface ApiAffectationResponse {
  success: boolean;
  message?: string;
  data?: MaterielAffectation | MaterielAffectation[];
}

export const TYPE_MATERIEL_LABELS: Record<TypeMateriel, string> = {
  laptop:     'Laptop',
  pc_fixe:    'PC Fixe',
  smartphone: 'Smartphone',
  tablette:   'Tablette',
  ecran:      'Écran',
  autre:      'Autre',
};

export const TYPE_MATERIEL_OPTIONS: { value: TypeMateriel; label: string }[] = [
  { value: 'laptop',     label: 'Laptop'      },
  { value: 'pc_fixe',   label: 'PC Fixe'     },
  { value: 'smartphone', label: 'Smartphone'  },
  { value: 'tablette',  label: 'Tablette'    },
  { value: 'ecran',     label: 'Écran'       },
  { value: 'autre',     label: 'Autre'       },
];
