import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyProspectEnrichmentService,
  getAllProspectsService,
  getProspectEnrichmentSnapshotService,
  previewProspectEnrichmentService,
} from '../API/services/index.ts';
import type { Prospect, ProspectEnrichmentPreview, ProspectEnrichmentSnapshot } from '../utils/types/index.ts';
import { extractWebsiteAnalysis } from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';

const SEARCH_LIMIT = 12;

export function useProspectEnrichment() {
  const { showError, showSuccess } = useAlert();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Prospect[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<ProspectEnrichmentSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProspectEnrichmentPreview | null>(null);
  const [candidateWebsiteUrl, setCandidateWebsiteUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const loadSnapshot = useCallback(async (prospectId: number): Promise<void> => {
    try {
      setSnapshotLoading(true);
      setSnapshotError(null);
      setSnapshot(await getProspectEnrichmentSnapshotService(prospectId));
    } catch (loadError) {
      setSnapshotError(loadError instanceof Error ? loadError.message : 'Impossible de charger la fiche d’enrichissement');
      setSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  useEffect(() => {
    if (search.trim().length < 3) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);
        const response = await getAllProspectsService({
          page: 1,
          limit: SEARCH_LIMIT,
          search: search.trim(),
          include_total: false,
          fast_search: true,
        });
        setResults(response.data);
      } catch (loadError) {
        setSearchError(loadError instanceof Error ? loadError.message : 'Impossible de rechercher les prospects');
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (selectedProspectId) {
      void loadSnapshot(selectedProspectId);
    }
  }, [loadSnapshot, selectedProspectId]);

  const selectProspect = useCallback((prospectId: number): void => {
    setSelectedProspectId(prospectId);
    setPreview(null);
    setCandidateWebsiteUrl('');
  }, []);

  const clearPreview = useCallback((): void => setPreview(null), []);

  const previewEnrichment = useCallback(async (): Promise<void> => {
    if (!selectedProspectId) return;
    try {
      setPreviewLoading(true);
      setPreview(await previewProspectEnrichmentService(selectedProspectId, candidateWebsiteUrl));
    } catch (previewError) {
      await showError(
        previewError instanceof Error ? previewError.message : 'Impossible de générer la prévisualisation',
        'Erreur enrichissement',
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [candidateWebsiteUrl, selectedProspectId, showError]);

  const applyEnrichment = useCallback(async (): Promise<void> => {
    if (!selectedProspectId || !preview) return;
    try {
      setApplyLoading(true);
      setSnapshot(await applyProspectEnrichmentService(selectedProspectId, preview.proposal));
      setPreview(null);
      await showSuccess('La proposition d’enrichissement a été enregistrée.', 'Enrichissement validé');
    } catch (applyError) {
      await showError(
        applyError instanceof Error ? applyError.message : 'Impossible d’enregistrer l’enrichissement',
        'Erreur enrichissement',
      );
    } finally {
      setApplyLoading(false);
    }
  }, [preview, selectedProspectId, showError, showSuccess]);

  const selectedLabel = useMemo(() => {
    if (!snapshot?.prospect) return 'Aucun prospect sélectionné';
    return snapshot.prospect.raison_sociale || `${snapshot.prospect.nom} ${snapshot.prospect.prenom ?? ''}`.trim();
  }, [snapshot]);

  const websiteAnalysis = useMemo(() => snapshot ? extractWebsiteAnalysis(snapshot) : null, [snapshot]);

  return {
    applyEnrichment,
    applyLoading,
    candidateWebsiteUrl,
    clearPreview,
    preview,
    previewEnrichment,
    previewLoading,
    results,
    search,
    searchError,
    searchLoading,
    selectedLabel,
    selectedProspectId,
    selectProspect,
    setCandidateWebsiteUrl,
    setSearch,
    snapshot,
    snapshotError,
    snapshotLoading,
    websiteAnalysis,
  };
}

export type ProspectEnrichmentState = ReturnType<typeof useProspectEnrichment>;
