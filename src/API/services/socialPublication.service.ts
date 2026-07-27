import type { AxiosResponse } from 'axios';
import { getRequest, postRequest } from '../APICalls.ts';
import type { SocialDraftInput, SocialEditorialDraft, SocialPlatformStatus, SocialVisual } from '../../utils/types/index.ts';

interface ApiResponse<T> { success: boolean; data?: T; message?: string; }
const unwrap = <T>(response: AxiosResponse<ApiResponse<T>>, fallback: string): T => { if (response.data.success && response.data.data !== undefined) return response.data.data; throw new Error(response.data.message || fallback); };
export const getSocialPublicationStatusService = async (): Promise<Record<string, SocialPlatformStatus>> => unwrap(await getRequest('/publications-reseaux-sociaux/status'), 'Statut indisponible.');
export const getSocialVisualsService = async (): Promise<SocialVisual[]> => unwrap(await getRequest('/publications-reseaux-sociaux/visuals'), 'Bibliothèque indisponible.');
export const getSocialDraftsService = async (): Promise<SocialEditorialDraft[]> => unwrap(await getRequest('/publications-reseaux-sociaux/drafts'), 'Brouillons indisponibles.');
export const createSocialDraftService = async (payload: SocialDraftInput): Promise<SocialEditorialDraft> => unwrap(await postRequest<SocialDraftInput, ApiResponse<SocialEditorialDraft>>('/publications-reseaux-sociaux/drafts', payload), 'Création impossible.');
export const validateSocialDraftService = async (id: string): Promise<SocialEditorialDraft> => unwrap(await postRequest<Record<string, never>, ApiResponse<SocialEditorialDraft>>(`/publications-reseaux-sociaux/drafts/${id}/validate`, {}), 'Validation impossible.');
export const scheduleSocialDraftService = async (id: string, publishAt: string): Promise<SocialEditorialDraft> => unwrap(await postRequest<{ publishAt: string }, ApiResponse<SocialEditorialDraft>>(`/publications-reseaux-sociaux/drafts/${id}/schedule`, { publishAt }), 'Programmation impossible.');
export const cancelSocialDraftService = async (id: string): Promise<SocialEditorialDraft> => unwrap(await postRequest<Record<string, never>, ApiResponse<SocialEditorialDraft>>(`/publications-reseaux-sociaux/drafts/${id}/cancel`, {}), 'Annulation impossible.');
