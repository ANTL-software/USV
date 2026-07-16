import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteAbsenceRequestService,
  getActiveAbsenceRequestsService,
  getAllAbsenceRequestsService,
  getAllEmployesService,
  getPendingAbsenceRequestsService,
  updateAbsenceRequestService,
  updateAbsenceRequestStatusService,
} from '../API/services/index.ts';
import type { UserModel } from '../API/models/index.ts';
import type { AbsenceRequest, AbsenceRequestStatus, CreateAbsenceRequestPayload } from '../utils/types/index.ts';
import { useAlert } from './useAlert.ts';
import { useNotifications } from './useNotifications.ts';
import {
  buildAbsenceRequestView,
  getAbsenceEmptyMessage,
} from '../utils/scripts/index.ts';

export type AbsenceManagementTab = 'active' | 'pending' | 'all';
export type AbsenceManagementStatusFilter = 'all' | AbsenceRequestStatus;

export function useAbsenceManagement() {
  const { showError, showSuccess } = useAlert();
  const { refreshNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<AbsenceManagementTab>('active');
  const [activeRequests, setActiveRequests] = useState<AbsenceRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AbsenceRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AbsenceRequest[]>([]);
  const [employes, setEmployes] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<AbsenceManagementStatusFilter>('all');
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null);
  const [editDateDebut, setEditDateDebut] = useState('');
  const [editDateFin, setEditDateFin] = useState('');
  const [editHeureDebut, setEditHeureDebut] = useState('');
  const [editHeureFin, setEditHeureFin] = useState('');
  const [motifAnnulation, setMotifAnnulation] = useState('');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isCancellingMode, setIsCancellingMode] = useState(false);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [activeData, pendingData, allData, employesData] = await Promise.all([
        getActiveAbsenceRequestsService(),
        getPendingAbsenceRequestsService(),
        getAllAbsenceRequestsService(),
        getAllEmployesService(),
      ]);
      setActiveRequests(activeData);
      setPendingRequests(pendingData);
      setAllRequests(allData);
      setEmployes(employesData);
    } catch (loadError) {
      await showError(
        loadError instanceof Error ? loadError.message : 'Impossible de charger les demandes d’absence',
        'Erreur',
      );
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectRequest = useCallback((request: AbsenceRequest): void => {
    setSelectedRequest(request);
    setEditDateDebut(request.date_debut || '');
    setEditDateFin(request.date_fin || '');
    setEditHeureDebut(request.heure_debut?.slice(0, 5) || '');
    setEditHeureFin(request.heure_fin?.slice(0, 5) || '');
    setMotifAnnulation('');
    setIsEditingMode(false);
    setIsCancellingMode(false);
  }, []);

  const closeRequest = useCallback((): void => {
    setSelectedRequest(null);
    setIsEditingMode(false);
    setIsCancellingMode(false);
  }, []);

  const saveModifications = useCallback(async (): Promise<void> => {
    if (!selectedRequest) {
      return;
    }

    try {
      setIsLoading(true);
      const payload: CreateAbsenceRequestPayload = {
        motif_code: selectedRequest.motif_code,
        motif_label: selectedRequest.motif_label,
        description: selectedRequest.description,
        type_demande: selectedRequest.type_demande,
        date_debut: editDateDebut,
        date_fin: selectedRequest.type_demande === 'heures' ? editDateDebut : editDateFin,
        heure_debut: selectedRequest.type_demande === 'heures' ? editHeureDebut : null,
        heure_fin: selectedRequest.type_demande === 'heures' ? editHeureFin : null,
        justificatif_requis: selectedRequest.justificatif_requis,
      };
      await updateAbsenceRequestService(selectedRequest.id_demande, payload);
      await showSuccess("Demande d'absence modifiée avec succès.", 'Succès');
      closeRequest();
      await loadData();
      void refreshNotifications();
    } catch (saveError) {
      await showError(
        saveError instanceof Error ? saveError.message : 'Impossible de modifier la demande',
        'Erreur',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    closeRequest,
    editDateDebut,
    editDateFin,
    editHeureDebut,
    editHeureFin,
    loadData,
    refreshNotifications,
    selectedRequest,
    showError,
    showSuccess,
  ]);

  const confirmCancellation = useCallback(async (): Promise<void> => {
    if (!selectedRequest) {
      return;
    }
    if (!motifAnnulation.trim()) {
      await showError("Veuillez renseigner un motif d'annulation.", 'Erreur');
      return;
    }

    try {
      setIsLoading(true);
      await deleteAbsenceRequestService(selectedRequest.id_demande, motifAnnulation.trim());
      await showSuccess("Demande d'absence annulée avec succès.", 'Succès');
      closeRequest();
      await loadData();
      void refreshNotifications();
    } catch (cancelError) {
      await showError(
        cancelError instanceof Error ? cancelError.message : 'Impossible d’annuler la demande',
        'Erreur',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    closeRequest,
    loadData,
    motifAnnulation,
    refreshNotifications,
    selectedRequest,
    showError,
    showSuccess,
  ]);

  const updateStatus = useCallback(async (
    requestId: number,
    statut: 'validee' | 'refusee',
  ): Promise<void> => {
    try {
      setIsUpdating(requestId);
      await updateAbsenceRequestStatusService(requestId, statut);
      await showSuccess(
        `Demande ${statut === 'validee' ? 'validée' : 'refusée'} avec succès.`,
        'Absence',
      );
      await loadData();
      void refreshNotifications();
    } catch (updateError) {
      await showError(
        updateError instanceof Error ? updateError.message : 'Impossible de mettre à jour la demande',
        'Erreur',
      );
    } finally {
      setIsUpdating(null);
    }
  }, [loadData, refreshNotifications, showError, showSuccess]);

  const employeOptions = useMemo(() => [
    { value: null, label: 'Tous les employés' },
    ...employes
      .filter((employe) => employe.actif)
      .sort((first, second) => {
        const prenomCompare = first.prenom.localeCompare(second.prenom, 'fr', { sensitivity: 'base' });
        return prenomCompare !== 0
          ? prenomCompare
          : first.nom.localeCompare(second.nom, 'fr', { sensitivity: 'base' });
      })
      .map((employe) => ({
        value: employe.id_employe,
        label: `(${employe.id_employe}) ${employe.prenom} ${employe.nom}`,
      })),
  ], [employes]);

  const statusOptions = useMemo(() => ([
    { value: 'all', label: 'Tous les statuts' },
    { value: 'demandee', label: 'Demandée' },
    { value: 'validee', label: 'Validée' },
    { value: 'refusee', label: 'Refusée' },
  ]), []);

  const baseRequests = useMemo(() => {
    if (activeTab === 'active') {
      return activeRequests;
    }
    if (activeTab === 'pending') {
      return pendingRequests;
    }
    return allRequests;
  }, [activeRequests, activeTab, allRequests, pendingRequests]);

  const requests = useMemo(() => baseRequests.filter((request) => {
    if (statusFilter !== 'all' && request.statut !== statusFilter) {
      return false;
    }
    if (selectedEmployeId !== null && request.id_employe !== selectedEmployeId) {
      return false;
    }
    if (dateFrom && request.date_fin < dateFrom) {
      return false;
    }
    if (dateTo && request.date_debut > dateTo) {
      return false;
    }
    return true;
  }), [baseRequests, dateFrom, dateTo, selectedEmployeId, statusFilter]);

  const requestViews = useMemo(
    () => requests.map(buildAbsenceRequestView),
    [requests],
  );

  const selectedRequestView = useMemo(
    () => selectedRequest ? buildAbsenceRequestView(selectedRequest) : null,
    [selectedRequest],
  );

  const detailTitle = selectedRequest
    ? `Demande d’absence - ${selectedRequest.employe
      ? `${selectedRequest.employe.prenom} ${selectedRequest.employe.nom}`
      : `Employé #${selectedRequest.id_employe}`}`
    : 'Détail de la demande';

  return {
    activeTab,
    closeRequest,
    confirmCancellation,
    dateFrom,
    dateTo,
    detailTitle,
    editDateDebut,
    editDateFin,
    editHeureDebut,
    editHeureFin,
    employeOptions,
    isCancellingMode,
    isEditingMode,
    isLoading,
    isUpdating,
    motifAnnulation,
    emptyMessage: getAbsenceEmptyMessage(activeTab),
    requestViews,
    requests,
    saveModifications,
    selectedEmployeId,
    selectedRequest,
    selectedRequestView,
    selectRequest,
    setActiveTab,
    setDateFrom,
    setDateTo,
    setEditDateDebut,
    setEditDateFin,
    setEditHeureDebut,
    setEditHeureFin,
    setIsCancellingMode,
    setIsEditingMode,
    setMotifAnnulation,
    setSelectedEmployeId,
    setStatusFilter,
    statusFilter,
    statusOptions,
    updateStatus,
  };
}

export type AbsenceManagementState = ReturnType<typeof useAbsenceManagement>;
