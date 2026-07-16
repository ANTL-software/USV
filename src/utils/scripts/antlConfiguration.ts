import type {
  AntlConfiguration,
  UpdateAntlConfigurationData,
} from '../types/index.ts';

export interface AntlConfigurationFormState {
  company_name: string;
  forme_juridique: string;
  capital_social: string;
  rcs_ville: string;
  siret: string;
  tva_intracom: string;
  email_contact: string;
  telephone: string;
  website: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  footer_text: string;
  conditions_paiement: string;
  delai_paiement_jours: string;
  penalite_retard: string;
  option_tva_debits: boolean;
  bank_account_holder: string;
  bank_name: string;
  iban: string;
  bic: string;
}

export const ANTL_CONFIGURATION_INITIAL_FORM: AntlConfigurationFormState = {
  company_name: 'antl',
  forme_juridique: '',
  capital_social: '',
  rcs_ville: '',
  siret: '',
  tva_intracom: '',
  email_contact: '',
  telephone: '',
  website: 'https://antl.fr',
  adresse: '',
  code_postal: '',
  ville: '',
  pays: 'France',
  footer_text: '',
  conditions_paiement: '',
  delai_paiement_jours: '',
  penalite_retard: '',
  option_tva_debits: false,
  bank_account_holder: '',
  bank_name: '',
  iban: '',
  bic: '',
};

export function buildAntlConfigurationForm(
  configuration: AntlConfiguration,
): AntlConfigurationFormState {
  return {
    company_name: configuration.company_name || 'antl',
    forme_juridique: configuration.forme_juridique || '',
    capital_social: configuration.capital_social || '',
    rcs_ville: configuration.rcs_ville || '',
    siret: configuration.siret || '',
    tva_intracom: configuration.tva_intracom || '',
    email_contact: configuration.email_contact || '',
    telephone: configuration.telephone || '',
    website: configuration.website || 'https://antl.fr',
    adresse: configuration.adresse || '',
    code_postal: configuration.code_postal || '',
    ville: configuration.ville || '',
    pays: configuration.pays || 'France',
    footer_text: configuration.footer_text || '',
    conditions_paiement: configuration.conditions_paiement || '',
    delai_paiement_jours: configuration.delai_paiement_jours != null
      ? String(configuration.delai_paiement_jours)
      : '',
    penalite_retard: configuration.penalite_retard || '',
    option_tva_debits: configuration.option_tva_debits,
    bank_account_holder: configuration.bank_account_holder || '',
    bank_name: configuration.bank_name || '',
    iban: configuration.iban || '',
    bic: configuration.bic || '',
  };
}

export function buildAntlConfigurationPayload(
  form: AntlConfigurationFormState,
): UpdateAntlConfigurationData {
  const paymentDelay = Number.parseInt(form.delai_paiement_jours, 10);
  return {
    company_name: form.company_name.trim() || 'antl',
    forme_juridique: form.forme_juridique.trim() || null,
    capital_social: form.capital_social.trim() || null,
    rcs_ville: form.rcs_ville.trim() || null,
    siret: form.siret.trim() || null,
    tva_intracom: form.tva_intracom.trim() || null,
    email_contact: form.email_contact.trim() || null,
    telephone: form.telephone.trim() || null,
    website: form.website.trim() || null,
    adresse: form.adresse.trim() || null,
    code_postal: form.code_postal.trim() || null,
    ville: form.ville.trim() || null,
    pays: form.pays.trim() || 'France',
    footer_text: form.footer_text.trim() || null,
    conditions_paiement: form.conditions_paiement.trim() || null,
    delai_paiement_jours: form.delai_paiement_jours.trim() && Number.isFinite(paymentDelay)
      ? paymentDelay
      : null,
    penalite_retard: form.penalite_retard.trim() || null,
    option_tva_debits: form.option_tva_debits,
    bank_account_holder: form.bank_account_holder.trim() || null,
    bank_name: form.bank_name.trim() || null,
    iban: form.iban.trim() || null,
    bic: form.bic.trim() || null,
  };
}

export function validateAntlConfigurationFile(
  file: File,
  maxSizeBytes: number,
  allowedMimeTypes: readonly string[],
  sizeError: string,
  typeError: string,
): string | null {
  if (file.size > maxSizeBytes) return sizeError;
  return allowedMimeTypes.includes(file.type) ? null : typeError;
}
