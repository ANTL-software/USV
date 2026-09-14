import type { EditableAddress, LeadClient, VenteComplete } from '../types/index.ts';
import { capitalizeAddress } from './addressFormatting.ts';

export function normalizeEditableAddress(address: EditableAddress): EditableAddress {
  return {
    ...(address.raison_sociale !== undefined ? { raison_sociale: address.raison_sociale.trim() } : {}),
    adresse: capitalizeAddress(address.adresse),
    code_postal: address.code_postal.trim(),
    ville: capitalizeAddress(address.ville),
    pays: capitalizeAddress(address.pays),
  };
}

export function saleEditableAddress(sale: VenteComplete | null, kind: 'facturation' | 'livraison'): EditableAddress {
  const billing = {
    adresse: sale?.adresse_facturation || sale?.prospect?.adresse_facturation || '',
    code_postal: sale?.code_postal_facturation || sale?.prospect?.code_postal || '',
    ville: sale?.ville_facturation || sale?.prospect?.ville || '',
    pays: sale?.pays_facturation || sale?.prospect?.pays || 'France',
  };
  const raisonSociale = kind === 'facturation'
    ? (sale?.raison_sociale_facturation || sale?.prospect?.raison_sociale || '')
    : (sale?.raison_sociale_livraison || sale?.prospect?.raison_sociale_livraison || sale?.prospect?.raison_sociale || '');
  if (kind === 'facturation' || !sale?.adresse_livraison) {
    return normalizeEditableAddress({ ...billing, raison_sociale: raisonSociale });
  }
  return normalizeEditableAddress({
    raison_sociale: raisonSociale,
    adresse: sale.adresse_livraison, code_postal: sale.code_postal_livraison || billing.code_postal,
    ville: sale.ville_livraison || billing.ville, pays: sale.pays_livraison || billing.pays,
  });
}

export function leadEditableAddress(lead: LeadClient | null): EditableAddress {
  return normalizeEditableAddress({ adresse: lead?.prospect?.adresse_facturation || '', code_postal: lead?.prospect?.code_postal || '', ville: lead?.prospect?.ville || '', pays: lead?.prospect?.pays || 'France' });
}
