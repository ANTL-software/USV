import { patchRequest } from '../APICalls.ts';
import type { EditableAddress, LeadClient, VenteComplete } from '../../utils/types/index.ts';

interface AddressResponse<T> { success: boolean; data?: T; message?: string }

export async function updateSaleAddressService(id: number, kind: 'facturation' | 'livraison', address: EditableAddress): Promise<VenteComplete> {
  const response = await patchRequest<Record<string, string>, AddressResponse<VenteComplete>>(`/ventes/${id}/adresses`, {
    ...(address.raison_sociale !== undefined ? { [`raison_sociale_${kind}`]: address.raison_sociale } : {}),
    [`adresse_${kind}`]: address.adresse,
    [`code_postal_${kind}`]: address.code_postal,
    [`ville_${kind}`]: address.ville,
    [`pays_${kind}`]: address.pays,
  });
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Adresse non enregistrée.');
  return response.data.data;
}

export async function updateLeadAddressService(id: number, address: EditableAddress): Promise<LeadClient> {
  const response = await patchRequest<Record<string, string>, AddressResponse<LeadClient>>(`/leads/${id}/adresse`, {
    adresse_facturation: address.adresse, code_postal: address.code_postal, ville: address.ville, pays: address.pays,
  });
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Adresse non enregistrée.');
  return response.data.data;
}
