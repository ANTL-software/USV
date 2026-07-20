import type {
  AgentAffecte,
  BonCommandeInvoiceRecipient,
  Campagne,
  CreateCampagneData,
  Employe,
  ModePaiement,
} from '../types/index.ts';
import { CAMPAIGN_VARIANTS, normalizeCampaignVariant } from './campaignVariants.ts';

export interface CampagneFormState {
  nom_campagne: string;
  type_campagne: string;
  date_debut: string;
  date_fin: string;
  objectifs: string;
  budget: string;
  code_postal_maison_mere: string;
  autoriser_mobile: boolean;
  siret: string;
  tva: string;
  email_contact: string;
  email_bon_commande: string;
  adresse: string;
  ville: string;
  telephone: string;
  pays: string;
  footer_text: string;
  taux_commission_facturation: string;
  modes_paiement: string;
  invoice_company_name: string;
  invoice_siret: string;
  invoice_tva: string;
  invoice_email: string;
  invoice_address: string;
  invoice_postal_code: string;
  invoice_city: string;
  invoice_country: string;
  invoice_phone: string;
}

export interface CampagneSelectOption {
  value: string;
  label: string;
}

export const CAMPAGNE_PAYMENT_OPTIONS: Array<{ value: ModePaiement; label: string }> = [
  { value: 'Prelevement', label: 'Prélèvement automatique' },
  { value: 'Cheque', label: 'Chèque bancaire' },
  { value: 'Virement', label: 'Virement bancaire' },
  { value: 'CB', label: 'Carte bancaire (par téléphone)' },
];

export const INITIAL_CAMPAGNE_FORM: CampagneFormState = {
  nom_campagne: '',
  type_campagne: CAMPAIGN_VARIANTS.vente,
  date_debut: '',
  date_fin: '',
  objectifs: '',
  budget: '',
  code_postal_maison_mere: '',
  autoriser_mobile: false,
  siret: '',
  tva: '',
  email_contact: '',
  email_bon_commande: '',
  adresse: '',
  ville: '',
  telephone: '',
  pays: 'France',
  footer_text: '',
  taux_commission_facturation: '',
  modes_paiement: 'Prelevement,Cheque,Virement',
  invoice_company_name: '',
  invoice_siret: '',
  invoice_tva: '',
  invoice_email: '',
  invoice_address: '',
  invoice_postal_code: '',
  invoice_city: '',
  invoice_country: 'France',
  invoice_phone: '',
};

export function buildInvoiceRecipientForm(
  recipient?: BonCommandeInvoiceRecipient | null,
): Pick<
  CampagneFormState,
  | 'invoice_company_name'
  | 'invoice_siret'
  | 'invoice_tva'
  | 'invoice_email'
  | 'invoice_address'
  | 'invoice_postal_code'
  | 'invoice_city'
  | 'invoice_country'
  | 'invoice_phone'
> {
  return {
    invoice_company_name: recipient?.company_name || '',
    invoice_siret: recipient?.siret || '',
    invoice_tva: recipient?.tva || '',
    invoice_email: recipient?.email || '',
    invoice_address: recipient?.address || '',
    invoice_postal_code: recipient?.postal_code || '',
    invoice_city: recipient?.city || '',
    invoice_country: recipient?.country || 'France',
    invoice_phone: recipient?.phone || '',
  };
}

export function buildCampagneFormState(campagne: Campagne): CampagneFormState {
  return {
    nom_campagne: campagne.nom_campagne,
    type_campagne: normalizeCampaignVariant(campagne.type_campagne),
    date_debut: campagne.date_debut,
    date_fin: campagne.date_fin || '',
    objectifs: campagne.objectifs || '',
    budget: campagne.budget != null ? String(campagne.budget) : '',
    code_postal_maison_mere: campagne.code_postal_maison_mere || '',
    autoriser_mobile: campagne.autoriser_mobile,
    siret: campagne.siret || '',
    tva: campagne.tva || '',
    email_contact: campagne.email_contact || '',
    email_bon_commande: campagne.email_bon_commande || '',
    adresse: campagne.adresse || '',
    ville: campagne.ville || '',
    telephone: campagne.telephone || '',
    pays: campagne.pays || 'France',
    footer_text: campagne.footer_text || '',
    taux_commission_facturation: campagne.taux_commission_facturation != null
      ? String(campagne.taux_commission_facturation)
      : '',
    modes_paiement: Array.isArray(campagne.modes_paiement)
      ? campagne.modes_paiement.join(',')
      : INITIAL_CAMPAGNE_FORM.modes_paiement,
    ...buildInvoiceRecipientForm(campagne.bon_commande_config?.invoice_recipient),
  };
}

export function buildInvoiceRecipientPayload(
  form: CampagneFormState,
): BonCommandeInvoiceRecipient | null {
  const payload: BonCommandeInvoiceRecipient = {
    company_name: form.invoice_company_name || null,
    siret: form.invoice_siret || null,
    tva: form.invoice_tva || null,
    email: form.invoice_email || null,
    address: form.invoice_address || null,
    postal_code: form.invoice_postal_code || null,
    city: form.invoice_city || null,
    country: form.invoice_country || null,
    phone: form.invoice_phone || null,
  };
  const meaningfulValues = [
    payload.company_name,
    payload.siret,
    payload.tva,
    payload.email,
    payload.address,
    payload.postal_code,
    payload.city,
    payload.phone,
  ];
  const hasValue = meaningfulValues.some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
  return hasValue ? payload : null;
}

export function validateCampagneForm(form: CampagneFormState): string | null {
  if (!form.nom_campagne.trim()) return 'Le nom de la campagne est requis';
  if (!form.date_debut) return 'La date de début est requise';
  return null;
}

export function buildCampagnePayload(form: CampagneFormState): CreateCampagneData {
  const modesPaiement = form.modes_paiement
    .split(',')
    .map((mode) => mode.trim())
    .filter((mode): mode is ModePaiement => (
      mode === 'CB' || mode === 'Prelevement' || mode === 'Cheque' || mode === 'Virement'
    ));
  const parsedCommissionRate = Number.parseFloat(form.taux_commission_facturation);
  const commissionRate = Number.isNaN(parsedCommissionRate) || parsedCommissionRate <= 0
    ? null
    : parsedCommissionRate;

  return {
    nom_campagne: form.nom_campagne.trim(),
    type_campagne: normalizeCampaignVariant(form.type_campagne),
    date_debut: form.date_debut,
    date_fin: form.date_fin || undefined,
    objectifs: form.objectifs || undefined,
    budget: form.budget ? Number(form.budget) : undefined,
    code_postal_maison_mere: form.code_postal_maison_mere || undefined,
    autoriser_mobile: form.autoriser_mobile,
    siret: form.siret || undefined,
    tva: form.tva || undefined,
    email_contact: form.email_contact || undefined,
    email_bon_commande: form.email_bon_commande || undefined,
    adresse: form.adresse || undefined,
    ville: form.ville || undefined,
    telephone: form.telephone || undefined,
    pays: form.pays || undefined,
    footer_text: form.footer_text || undefined,
    taux_commission_facturation: commissionRate,
    modes_paiement: modesPaiement,
    bon_commande_config: { invoice_recipient: buildInvoiceRecipientPayload(form) },
  };
}

export function validateCampagneLogoFile(file: Pick<File, 'size' | 'type'>): string | null {
  if (file.size > 2 * 1024 * 1024) return 'Le fichier dépasse 2 Mo';
  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
    return 'Format non autorisé. PNG, JPG, WEBP uniquement.';
  }
  return null;
}

export function getAvailableCampaignEmployes(
  employes: Employe[],
  agents: AgentAffecte[],
): Employe[] {
  const assignedIds = new Set(agents.map((agent) => agent.id_employe));
  return employes.filter((employe) => employe.actif && !assignedIds.has(employe.id_employe));
}

export function getTransferableCampaigns(
  campagnes: Campagne[],
  currentCampagneId: number | null,
): Campagne[] {
  return campagnes.filter((campagne) => (
    campagne.id_campagne !== currentCampagneId && campagne.statut !== 'terminee'
  ));
}

export function getCampaignAgentName(agent: AgentAffecte): string {
  return `${agent.agent?.prenom ?? ''} ${agent.agent?.nom ?? ''}`.trim();
}

export function sortCampaignAgents(agents: AgentAffecte[]): AgentAffecte[] {
  return [...agents].sort((first, second) => (
    getCampaignAgentName(first).toLowerCase().localeCompare(
      getCampaignAgentName(second).toLowerCase(),
      'fr',
    )
  ));
}

export function buildCampaignEmployeOptions(employes: Employe[]): CampagneSelectOption[] {
  return employes.map((employe) => ({
    value: String(employe.id_employe),
    label: `${employe.prenom} ${employe.nom}`.trim(),
  }));
}

export function buildTransferCampaignOptions(campagnes: Campagne[]): CampagneSelectOption[] {
  return campagnes.map((campagne) => ({
    value: String(campagne.id_campagne),
    label: `${campagne.nom_campagne} (${campagne.statut})`,
  }));
}
