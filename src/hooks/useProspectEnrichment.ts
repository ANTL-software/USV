import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyProspectEnrichmentService,
  cancelProspectEnrichmentRunService,
  createProspectEnrichmentRunService,
  deleteProspectEnrichmentRunService,
  getAllProspectsService,
  getProspectEnrichmentRunsService,
  getProspectEnrichmentSnapshotService,
  previewProspectEnrichmentService,
  startProspectEnrichmentRunService,
} from '../API/services/index.ts';
import type { Prospect, ProspectEnrichmentPreview, ProspectEnrichmentRun, ProspectEnrichmentSnapshot } from '../utils/types/index.ts';
import { extractWebsiteAnalysis } from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';
import { useCampagnes } from './useCampagnes.ts';
import { confirm } from '../utils/services/index.ts';

const SEARCH_LIMIT = 12;

export function useProspectEnrichment() {
  const { showError, showSuccess } = useAlert();
  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const [batchCampaignId, setBatchCampaignId] = useState<number | null>(null);
  const [batchReference, setBatchReference] = useState('');
  const [batchLimit, setBatchLimit] = useState(25);
  const [batchRuns, setBatchRuns] = useState<ProspectEnrichmentRun[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
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

  const loadBatchRuns = useCallback(async (): Promise<void> => {
    try {
      setBatchRuns(await getProspectEnrichmentRunsService());
    } catch {
      setBatchRuns([]);
    }
  }, []);

  useEffect(() => { void loadBatchRuns(); }, [loadBatchRuns]);

  useEffect(() => {
    if (!batchRuns.some((run) => run.statut === 'en_cours')) return undefined;
    const interval = window.setInterval(() => { void loadBatchRuns(); }, 3000);
    return () => window.clearInterval(interval);
  }, [batchRuns, loadBatchRuns]);

  const createBatchRun = useCallback(async (): Promise<void> => {
    if (!batchCampaignId) {
      await showError('Sélectionnez une campagne avant de créer le lot.', 'Campagne requise');
      return;
    }
    const reference = batchReference.trim();
    if (!reference) {
      await showError('Saisissez une référence de lot.', 'Référence requise');
      return;
    }
    if (!await confirm(`Créer le lot « ${reference} » pour la campagne sélectionnée ? Les fiches déjà enrichies seront exclues.`, 'Créer un lot ciblé')) return;
    try {
      setBatchLoading(true);
      const run = await createProspectEnrichmentRunService({ reference, id_campagne: batchCampaignId, limite_prospects: batchLimit });
      setBatchRuns((runs) => [run, ...runs.filter((item) => item.id_enrichissement_lot !== run.id_enrichissement_lot)]);
      setBatchReference('');
      await showSuccess(`Lot ${run.reference} créé pour ${run.nom_campagne}. Le worker le traitera séparément.`, 'Lot créé');
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de créer le lot', 'Erreur de lot');
    } finally {
      setBatchLoading(false);
    }
  }, [batchCampaignId, batchLimit, batchReference, showError, showSuccess]);

  const updateBatchRun = useCallback(async (id: number, action: 'start' | 'cancel' | 'delete'): Promise<void> => {
    const label = action === 'start' ? 'démarrer' : action === 'cancel' ? 'annuler' : 'supprimer';
    if (!await confirm(`Voulez-vous ${label} ce lot ?`, 'Confirmation')) return;
    try {
      setBatchLoading(true);
      if (action === 'delete') {
        await deleteProspectEnrichmentRunService(id);
        setBatchRuns((runs) => runs.filter((run) => run.id_enrichissement_lot !== id));
      } else {
        const run = action === 'start'
          ? await startProspectEnrichmentRunService(id)
          : await cancelProspectEnrichmentRunService(id);
        setBatchRuns((runs) => runs.map((item) => item.id_enrichissement_lot === id ? run : item));
      }
      const completion = action === 'delete' ? 'supprimé' : action === 'start' ? 'démarré' : 'annulé';
      await showSuccess(`Lot ${completion}.`, 'Lot mis à jour');
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de mettre à jour le lot', 'Erreur de lot');
    } finally {
      setBatchLoading(false);
    }
  }, [showError, showSuccess]);

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
    batchCampaignId,
    batchLimit,
    batchLoading,
    batchReference,
    batchRuns,
    campagnes,
    campagnesLoading,
    createBatchRun,
    updateBatchRun,
    setBatchCampaignId,
    setBatchLimit,
    setBatchReference,
  };
}

export type ProspectEnrichmentState = ReturnType<typeof useProspectEnrichment>;
