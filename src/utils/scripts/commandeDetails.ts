import {
  MODE_PAIEMENT_LABELS,
  STATUT_VENTE_COLORS,
  STATUT_VENTE_LABELS,
} from '../types/index.ts';
import type {
  Appel,
  StatutVente,
  VenteComplete,
  VenteDetail,
} from '../types/index.ts';
import {
  formatDateShort,
  formatDurationFromSeconds,
  formatTime,
  getStatutAppelClass,
  getStatutAppelLabel,
} from './formatters.ts';

export interface CommandeTotals {
  montantArticlesHt: number;
  livraisonOfferte: boolean;
  fraisLivraisonHt: number;
  totalHt: number;
  totalTtc: number;
}

export interface CommandeProductRow {
  id: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  lineTotal: string;
}

export interface CommandeCallRow {
  id: number;
  date: string;
  time: string;
  statusLabel: string;
  statusClassName: string;
  duration: string;
  agentName: string | null;
  notes: string | null;
}

export interface PreviousCommandeRow {
  id: number;
  reference: string;
  date: string;
  amount: string;
  statusLabel: string;
  statusColor: string;
  agentName: string | null;
  notes: string | null;
  products: CommandeProductRow[];
}

export interface CommandeAddressView {
  title: string;
  lines: string[];
}

export function formatCommandeCurrency(value?: string | number): string {
  const numericValue = typeof value === 'number' ? value : Number.parseFloat(value || '');
  if (Number.isNaN(numericValue)) return '0,00 €';
  return numericValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function formatCommandeDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCommandeProspectName(commande: VenteComplete | null): string {
  if (!commande?.prospect) return '—';
  return [
    commande.prospect.civilite,
    commande.prospect.nom?.toUpperCase(),
    commande.prospect.prenom,
  ].filter((value): value is string => Boolean(value)).join(' ');
}

export function getCommandeAgentName(commande: VenteComplete | null): string {
  if (!commande?.agent) return '—';
  return `${commande.agent.prenom} ${commande.agent.nom.toUpperCase()}`;
}

export function computeCommandeTotals(commande: VenteComplete | null): CommandeTotals {
  const montantArticlesHt = commande?.details?.reduce(
    (sum, detail) => sum + Number.parseFloat(detail.montant_ligne || '0'),
    0,
  ) || 0;
  const livraisonOfferte = Boolean(commande?.livraison_offerte);
  const fraisLivraisonHt = montantArticlesHt >= 300 || livraisonOfferte ? 0 : 30;
  const totalHt = montantArticlesHt + fraisLivraisonHt;
  return {
    montantArticlesHt,
    livraisonOfferte,
    fraisLivraisonHt,
    totalHt,
    totalTtc: totalHt * 1.2,
  };
}

export function buildCommandeProductRows(details: VenteDetail[]): CommandeProductRow[] {
  return details.map((detail, index) => ({
    id: String(detail.id_detail || `${detail.id_produit}-${index}`),
    code: detail.produit?.code_produit ?? '—',
    name: detail.produit?.nom_produit ?? 'Produit inconnu',
    quantity: detail.quantite,
    unitPrice: formatCommandeCurrency(detail.prix_unitaire),
    discount: Number.parseFloat(detail.remise || '0') > 0
      ? formatCommandeCurrency(detail.remise)
      : '—',
    lineTotal: formatCommandeCurrency(detail.montant_ligne),
  }));
}

export function buildCommandeCallRows(appels: Appel[]): CommandeCallRow[] {
  return appels.map((appel) => {
    const agent = appel.agent ?? appel.Employe;
    return {
      id: appel.id_appel,
      date: formatDateShort(appel.created_at),
      time: formatTime(appel.created_at),
      statusLabel: getStatutAppelLabel(appel.statut_appel),
      statusClassName: `status-badge-${getStatutAppelClass(appel.statut_appel)}`,
      duration: formatDurationFromSeconds(appel.duree_secondes),
      agentName: agent ? `${agent.prenom} ${agent.nom.toUpperCase()}` : null,
      notes: appel.notes || null,
    };
  });
}

export function buildPreviousCommandeRows(ventes: VenteComplete[]): PreviousCommandeRow[] {
  return ventes.map((vente) => ({
    id: vente.id_vente,
    reference: vente.reference_doc ?? `#${vente.id_vente}`,
    date: formatDateShort(vente.created_at),
    amount: formatCommandeCurrency(vente.montant_total),
    statusLabel: STATUT_VENTE_LABELS[vente.statut_vente],
    statusColor: STATUT_VENTE_COLORS[vente.statut_vente] || '#6b7280',
    agentName: vente.agent ? `${vente.agent.prenom} ${vente.agent.nom.toUpperCase()}` : null,
    notes: vente.notes || null,
    products: buildCommandeProductRows(vente.details || []),
  }));
}

export function getCommandeBillingAddress(commande: VenteComplete): CommandeAddressView {
  const cityLine = [
    commande.code_postal_facturation || commande.prospect?.code_postal,
    commande.ville_facturation || commande.prospect?.ville,
  ].filter(Boolean).join(' ');
  return {
    title: 'Adresse de Facturation',
    lines: [
      commande.adresse_facturation || commande.prospect?.adresse_facturation || '—',
      cityLine,
      commande.pays_facturation || commande.prospect?.pays || 'France',
    ].filter(Boolean),
  };
}

export function getCommandeDeliveryAddress(commande: VenteComplete): CommandeAddressView {
  if (!commande.adresse_livraison) {
    return { title: 'Adresse de Livraison', lines: ['Identique à la facturation'] };
  }
  return {
    title: 'Adresse de Livraison',
    lines: [
      commande.adresse_livraison,
      [commande.code_postal_livraison, commande.ville_livraison].filter(Boolean).join(' '),
      commande.pays_livraison || 'France',
    ].filter(Boolean),
  };
}

export function getCommandePaymentLabel(commande: VenteComplete): string {
  return commande.mode_paiement
    ? MODE_PAIEMENT_LABELS[commande.mode_paiement] ?? commande.mode_paiement
    : '—';
}

export function getCommandeStatusPresentation(status: StatutVente): {
  label: string;
  color: string;
} {
  return { label: STATUT_VENTE_LABELS[status], color: STATUT_VENTE_COLORS[status] };
}
