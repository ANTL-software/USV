export interface AntlConfiguration {
  id_configuration: number;
  company_name: string;
  forme_juridique: string | null;
  capital_social: string | null;
  rcs_ville: string | null;
  siret: string | null;
  tva_intracom: string | null;
  email_contact: string | null;
  telephone: string | null;
  website: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
  footer_text: string | null;
  conditions_paiement: string | null;
  delai_paiement_jours: number | null;
  penalite_retard: string | null;
  option_tva_debits: boolean;
  bank_account_holder: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  logo_path: string | null;
  logo_file_name: string | null;
  rib_path: string | null;
  rib_file_name: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateAntlConfigurationData {
  company_name?: string;
  forme_juridique?: string | null;
  capital_social?: string | null;
  rcs_ville?: string | null;
  siret?: string | null;
  tva_intracom?: string | null;
  email_contact?: string | null;
  telephone?: string | null;
  website?: string | null;
  adresse?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  pays?: string | null;
  footer_text?: string | null;
  conditions_paiement?: string | null;
  delai_paiement_jours?: number | null;
  penalite_retard?: string | null;
  option_tva_debits?: boolean;
  bank_account_holder?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  bic?: string | null;
  logo_path?: string | null;
  logo_file_name?: string | null;
  rib_path?: string | null;
  rib_file_name?: string | null;
}

export interface AntlConfigurationLogoUploadResult {
  success: boolean;
  data: {
    logo_path: string;
    logo_file_name: string;
  };
  message?: string;
}

export interface AntlConfigurationLogoDeleteResult {
  success: boolean;
  message?: string;
}

export interface AntlConfigurationRibUploadResult {
  success: boolean;
  data: {
    rib_path: string;
    rib_file_name: string;
  };
  message?: string;
}

export interface AntlConfigurationRibDeleteResult {
  success: boolean;
  message?: string;
}
