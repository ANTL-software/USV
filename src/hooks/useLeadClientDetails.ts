import { useCallback, useEffect, useState } from 'react';
import {
  getLeadClientByIdService,
  getLeadClientDocumentUrl,
  getLeadClientsByProspectService,
  getProspectAppelsService,
  updateLeadClientStatusService,
} from '../API/services/index.ts';
import {
  STATUT_RENDEZ_VOUS_LABELS,
  type Appel,
  type LeadClient,
  type StatutRendezVous,
} from '../utils/types/index.ts';
import { isLeadClientRendezVous } from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';

export function useLeadClientDetails(idLead: number) {
  const { showError, showSuccess } = useAlert();
  const [lead, setLead] = useState<LeadClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appels, setAppels] = useState<Appel[]>([]);
  const [appelsLoading, setAppelsLoading] = useState(false);
  const [appelsError, setAppelsError] = useState<string | null>(null);
  const [appelsPage, setAppelsPage] = useState(1);
  const [appelsTotalPages, setAppelsTotalPages] = useState(1);
  const [appelsTotal, setAppelsTotal] = useState(0);
  const [leadHistory, setLeadHistory] = useState<LeadClient[]>([]);
  const [leadHistoryLoading, setLeadHistoryLoading] = useState(false);
  const [leadHistoryError, setLeadHistoryError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<StatutRendezVous | null>(null);

  const loadLead = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(idLead) || idLead <= 0) {
      setError('ID de rendez-vous client invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getLeadClientByIdService(idLead);
      if (!isLeadClientRendezVous(result.motif)) {
        throw new Error('Ce rendez-vous ne correspond pas à un rendez-vous client MMA');
      }
      setLead(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de récupérer le rendez-vous client');
    } finally {
      setLoading(false);
    }
  }, [idLead]);

  const loadAppels = useCallback(async (page = 1): Promise<void> => {
    const prospectId = lead?.prospect?.id_prospect;
    const campagneId = lead?.id_campagne;
    if (!prospectId || !campagneId) {
      return;
    }

    try {
      setAppelsLoading(true);
      setAppelsError(null);
      const result = await getProspectAppelsService(prospectId, { page, limit: 5, campagne: campagneId });
      setAppels(result.appels);
      setAppelsPage(result.page);
      setAppelsTotalPages(result.totalPages);
      setAppelsTotal(result.total);
    } catch (loadError) {
      setAppelsError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des appels');
    } finally {
      setAppelsLoading(false);
    }
  }, [lead]);

  const loadLeadHistory = useCallback(async (): Promise<void> => {
    const prospectId = lead?.prospect?.id_prospect;
    const campagneId = lead?.id_campagne;
    if (!prospectId || !campagneId) {
      return;
    }

    try {
      setLeadHistoryLoading(true);
      setLeadHistoryError(null);
      const result = await getLeadClientsByProspectService(prospectId, { limit: 100, campagne: campagneId });
      setLeadHistory(result
        .filter((rendezVous) => rendezVous.id_lead !== lead.id_lead && isLeadClientRendezVous(rendezVous.motif))
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()));
    } catch (loadError) {
      setLeadHistoryError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLeadHistoryLoading(false);
    }
  }, [lead]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  useEffect(() => {
    if (lead) {
      void loadAppels(1);
      void loadLeadHistory();
    }
  }, [lead, loadAppels, loadLeadHistory]);

  const updateLeadStatus = useCallback(async (statut: StatutRendezVous): Promise<void> => {
    if (!lead || lead.statut === statut || statusUpdateLoading !== null) {
      return;
    }

    try {
      setStatusUpdateLoading(statut);
      const updatedLead = await updateLeadClientStatusService(lead.id_lead, statut);
      setLead(updatedLead);
      await showSuccess(`Rendez-vous client passé en "${STATUT_RENDEZ_VOUS_LABELS[statut]}".`);
    } catch (updateError) {
      await showError(updateError instanceof Error ? updateError.message : 'Erreur lors de la mise à jour du statut');
    } finally {
      setStatusUpdateLoading(null);
    }
  }, [lead, showError, showSuccess, statusUpdateLoading]);

  const printLeadDocument = useCallback((): void => {
    if (lead) {
      window.open(getLeadClientDocumentUrl(lead.id_lead), '_blank', 'noopener,noreferrer');
    }
  }, [lead]);

  return {
    appels,
    appelsError,
    appelsLoading,
    appelsPage,
    appelsTotal,
    appelsTotalPages,
    error,
    lead,
    leadHistory,
    leadHistoryError,
    leadHistoryLoading,
    loadAppels,
    loading,
    printLeadDocument,
    statusUpdateLoading,
    updateLeadStatus,
  };
}
