import { useCallback, useEffect, useState } from 'react';
import { cancelSocialDraftService, createSocialDraftService, getSocialDraftsService, getSocialPublicationStatusService, getSocialVisualsService, scheduleSocialDraftService, validateSocialDraftService } from '../API/services/index.ts';
import type { SocialDraftInput, SocialEditorialDraft, SocialPlatformStatus, SocialVisual } from '../utils/types/index.ts';

export function useSocialPublication() {
  const [drafts, setDrafts] = useState<SocialEditorialDraft[]>([]);
  const [visuals, setVisuals] = useState<SocialVisual[]>([]);
  const [platforms, setPlatforms] = useState<Record<string, SocialPlatformStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setIsLoading(true); setError(null); try { const [nextDrafts, nextVisuals, nextPlatforms] = await Promise.all([getSocialDraftsService(), getSocialVisualsService(), getSocialPublicationStatusService()]); setDrafts(nextDrafts); setVisuals(nextVisuals); setPlatforms(nextPlatforms); } catch (requestError: unknown) { setError(requestError instanceof Error ? requestError.message : 'Chargement impossible.'); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const createDraft = useCallback(async (payload: SocialDraftInput) => { await createSocialDraftService(payload); await refresh(); }, [refresh]);
  const validateDraft = useCallback(async (id: string) => { await validateSocialDraftService(id); await refresh(); }, [refresh]);
  const scheduleDraft = useCallback(async (id: string, publishAt: string) => { await scheduleSocialDraftService(id, publishAt); await refresh(); }, [refresh]);
  const cancelDraft = useCallback(async (id: string) => { await cancelSocialDraftService(id); await refresh(); }, [refresh]);
  return { drafts, visuals, platforms, isLoading, error, refresh, createDraft, validateDraft, scheduleDraft, cancelDraft };
}
export type SocialPublicationState = ReturnType<typeof useSocialPublication>;
