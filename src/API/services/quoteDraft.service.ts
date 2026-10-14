import axios from 'axios';
import { isQuoteDraftSnapshot, parseLocalQuoteDrafts } from '../models/index.ts';
import type { ApiResponse, QuoteDraft, QuoteDraftSnapshot, QuoteDraftSummary, LocalQuoteDraft } from '../../utils/types/index.ts';
const localKey = (owner: number) => `usv:quote-drafts:v1:${owner}`;
export const readLocalQuoteDrafts = (owner: number): LocalQuoteDraft[] => {
  const prefix = `${localKey(owner)}:`;
  return Object.keys(localStorage).filter(key => key.startsWith(prefix)).flatMap(key => parseLocalQuoteDrafts(localStorage.getItem(key)));
};
export const writeLocalQuoteDrafts = (owner: number, drafts: LocalQuoteDraft[]): void => {
  drafts.forEach(draft => localStorage.setItem(`${localKey(owner)}:${draft.id}`, JSON.stringify([draft])));
};
export const removeLocalQuoteDraft = (owner: number, id: string): void => localStorage.removeItem(`${localKey(owner)}:${id}`);
export async function listQuoteDrafts(): Promise<QuoteDraftSummary[]> {
  const response = await axios.get<ApiResponse<QuoteDraftSummary[]>>('/devis/brouillons', { timeout: 15000 });
  if (!response.data.success || !response.data.data) throw new Error('Impossible de charger les brouillons.');
  return response.data.data;
}
export async function getQuoteDraft(id: string): Promise<QuoteDraft> {
  const response = await axios.get<ApiResponse<QuoteDraft>>(`/devis/brouillons/${id}`, { timeout: 15000 });
  const draft = response.data.data;
  if (!draft || !isQuoteDraftSnapshot(draft.snapshot)) throw new Error('Ce brouillon utilise un format non pris en charge.');
  return draft;
}
export async function saveQuoteDraft(draft: QuoteDraft): Promise<QuoteDraft> {
  const response = await axios.put<ApiResponse<QuoteDraft>>(`/devis/brouillons/${draft.id}`, { revision: draft.revision, snapshot: draft.snapshot }, { timeout: 15000 });
  if (!response.data.success || !response.data.data) throw new Error('Impossible de sauvegarder le devis.');
  return response.data.data;
}
export async function deleteQuoteDraft(draft: QuoteDraftSummary): Promise<void> {
  await axios.delete(`/devis/brouillons/${draft.id}`, { params: { revision: draft.revision } });
}
export function quoteDraftError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data.message || 'Connexion indisponible. La saisie reste conservée sur ce navigateur.';
  return error instanceof Error ? error.message : 'Impossible de sauvegarder le devis.';
}
export type QuoteDraftSaveInput = { snapshot: QuoteDraftSnapshot; revision: number };
