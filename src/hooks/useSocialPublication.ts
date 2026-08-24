import { useCallback, useEffect, useState } from 'react';
import {
  cancelSocialDraftService,
  createSocialDraftService,
  getSocialDraftsService,
  getSocialPublicationStatusService,
  getSocialVisualsService,
  deleteFailedSocialDraftService,
  prepareSocialDraftPackagesService,
  rescheduleSocialDraftService,
  retryFailedSocialDraftService,
  scheduleSocialDraftService,
  validateSocialDraftService,
  verifySocialDraftReadinessService,
} from '../API/services/index.ts';
import type {
  SocialDraftInput,
  SocialEditorialDraft,
  SocialPublicationStatus,
  SocialVisual,
} from '../utils/types/index.ts';

export function useSocialPublication() {
  const [drafts, setDrafts] = useState<SocialEditorialDraft[]>([]);
  const [visuals, setVisuals] = useState<SocialVisual[]>([]);
  const [status, setStatus] = useState<SocialPublicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingVisuals, setIsRefreshingVisuals] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualError, setVisualError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setVisualError(null);
    const [draftsResult, visualsResult, statusResult] = await Promise.allSettled([
      getSocialDraftsService(),
      getSocialVisualsService(),
      getSocialPublicationStatusService(),
    ]);

    if (draftsResult.status === 'fulfilled') setDrafts(draftsResult.value);
    if (visualsResult.status === 'fulfilled') setVisuals(visualsResult.value);
    if (statusResult.status === 'fulfilled') setStatus(statusResult.value);

    const criticalErrors = [draftsResult, statusResult]
      .filter((result) => result.status === 'rejected')
      .map((result) => result.status === 'rejected' && result.reason instanceof Error
        ? result.reason.message
        : 'Chargement impossible.');
    if (criticalErrors.length) setError(criticalErrors.join(' · '));
    if (visualsResult.status === 'rejected') {
      setVisualError(visualsResult.reason instanceof Error ? visualsResult.reason.message : 'Bibliothèque indisponible.');
    }
    setIsLoading(false);
  }, []);

  const refreshVisuals = useCallback(async () => {
    setIsRefreshingVisuals(true);
    setVisualError(null);
    try {
      setVisuals(await getSocialVisualsService());
    } catch (requestError: unknown) {
      setVisualError(requestError instanceof Error ? requestError.message : 'Bibliothèque indisponible.');
    } finally {
      setIsRefreshingVisuals(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createDraft = useCallback(async (payload: SocialDraftInput) => {
    await createSocialDraftService(payload);
    await refresh();
  }, [refresh]);

  const verifyReadiness = useCallback(async (id: string) => {
    await verifySocialDraftReadinessService(id);
    await refresh();
  }, [refresh]);

  const validateDraft = useCallback(async (id: string) => {
    await validateSocialDraftService(id);
    await refresh();
  }, [refresh]);

  const scheduleDraft = useCallback(async (id: string, publishAt: string) => {
    await scheduleSocialDraftService(id, publishAt);
    await refresh();
  }, [refresh]);

  const rescheduleDraft = useCallback(async (id: string, publishAt: string) => {
    await rescheduleSocialDraftService(id, publishAt);
    await refresh();
  }, [refresh]);

  const cancelDraft = useCallback(async (id: string) => {
    await cancelSocialDraftService(id);
    await refresh();
  }, [refresh]);

  const retryFailedDraft = useCallback(async (id: string) => {
    await retryFailedSocialDraftService(id);
    await refresh();
  }, [refresh]);

  const deleteFailedDraft = useCallback(async (id: string) => {
    await deleteFailedSocialDraftService(id);
    await refresh();
  }, [refresh]);

  const preparePackages = useCallback(async (id: string) => {
    await prepareSocialDraftPackagesService(id);
    await refresh();
  }, [refresh]);

  return {
    drafts,
    visuals,
    status,
    platforms: status?.platforms ?? {},
    isLoading,
    isRefreshingVisuals,
    error,
    visualError,
    refresh,
    refreshVisuals,
    createDraft,
    verifyReadiness,
    validateDraft,
    scheduleDraft,
    rescheduleDraft,
    cancelDraft,
    retryFailedDraft,
    deleteFailedDraft,
    preparePackages,
  };
}

export type SocialPublicationState = ReturnType<typeof useSocialPublication>;
