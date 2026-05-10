export interface Panier {
  id_panier: number;
  label: string;
  origine: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePanierData {
  label: string;
  origine?: string;
  actif?: boolean;
}

export interface UpdatePanierData {
  label?: string;
  origine?: string;
  actif?: boolean;
}
