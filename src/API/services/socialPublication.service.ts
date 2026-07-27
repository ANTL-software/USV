import type { AxiosResponse } from 'axios';
import { getRequest, postRequest } from '../APICalls.ts';
import type {
  SocialDraftInput,
  SocialEditorialDraft,
  SocialPublicationHistoryPage,
  SocialPublicationPackage,
  SocialPublicationStatus,
  SocialReadinessCheck,
  SocialPlatform,
  SocialVisual,
} from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const unwrap = <T>(response: AxiosResponse<ApiResponse<T>>, fallback: string): T => {
  if (response.data.success && response.data.data !== undefined) return response.data.data;
  throw new Error(response.data.message || fallback);
};

export const getSocialPublicationStatusService = async (): Promise<SocialPublicationStatus> => (
  unwrap(await getRequest('/publications-reseaux-sociaux/status'), 'Statut indisponible.')
);

export const getSocialVisualsService = async (): Promise<SocialVisual[]> => (
  unwrap(await getRequest('/publications-reseaux-sociaux/visuals'), 'Bibliothèque indisponible.')
);

export const getSocialDraftsService = async (): Promise<SocialEditorialDraft[]> => (
  unwrap(await getRequest('/publications-reseaux-sociaux/drafts'), 'Brouillons indisponibles.')
);

export const getSocialPublicationHistoryService = async (
  page: number,
  platform: SocialPlatform | null,
): Promise<SocialPublicationHistoryPage> => {
  const params = new URLSearchParams({ page: String(page), limit: '25' });
  if (platform) params.set('platform', platform);
  return unwrap(
    await getRequest(`/publications-reseaux-sociaux/history?${params.toString()}`),
    'Historique des publications indisponible.',
  );
};

export const createSocialDraftService = async (payload: SocialDraftInput): Promise<SocialEditorialDraft> => (
  unwrap(
    await postRequest<SocialDraftInput, ApiResponse<SocialEditorialDraft>>('/publications-reseaux-sociaux/drafts', payload),
    'Création impossible.',
  )
);

export const verifySocialDraftReadinessService = async (
  id: string,
): Promise<Partial<Record<SocialPlatform | 'googleDrive', SocialReadinessCheck>>> => (
  unwrap(
    await getRequest(`/publications-reseaux-sociaux/drafts/${id}/readiness`),
    'Contrôle technique impossible.',
  )
);

export const validateSocialDraftService = async (id: string): Promise<SocialEditorialDraft> => (
  unwrap(
    await postRequest<Record<string, never>, ApiResponse<SocialEditorialDraft>>(
      `/publications-reseaux-sociaux/drafts/${id}/validate`,
      {},
    ),
    'Validation impossible.',
  )
);

export const scheduleSocialDraftService = async (id: string, publishAt: string): Promise<SocialEditorialDraft> => (
  unwrap(
    await postRequest<{ publishAt: string }, ApiResponse<SocialEditorialDraft>>(
      `/publications-reseaux-sociaux/drafts/${id}/schedule`,
      { publishAt },
    ),
    'Programmation impossible.',
  )
);

export const rescheduleSocialDraftService = async (id: string, publishAt: string): Promise<SocialEditorialDraft> => (
  unwrap(
    await postRequest<{ publishAt: string }, ApiResponse<SocialEditorialDraft>>(
      `/publications-reseaux-sociaux/drafts/${id}/reschedule`,
      { publishAt },
    ),
    'Modification de l’horaire impossible.',
  )
);

export const cancelSocialDraftService = async (id: string): Promise<SocialEditorialDraft> => (
  unwrap(
    await postRequest<Record<string, never>, ApiResponse<SocialEditorialDraft>>(
      `/publications-reseaux-sociaux/drafts/${id}/cancel`,
      {},
    ),
    'Annulation impossible.',
  )
);

export const prepareSocialDraftPackagesService = async (id: string): Promise<SocialPublicationPackage[]> => (
  unwrap(
    await postRequest<Record<string, never>, ApiResponse<SocialPublicationPackage[]>>(
      `/publications-reseaux-sociaux/drafts/${id}/packages`,
      {},
    ),
    'Préparation des packages impossible.',
  )
);
