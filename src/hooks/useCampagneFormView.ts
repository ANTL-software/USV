import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCampagneAgents,
  useCampagneForm,
  useCampagnes,
  useEmployes,
} from './index.ts';
import {
  buildCampaignEmployeOptions,
  buildTransferCampaignOptions,
  getAvailableCampaignEmployes,
  getCampaignAgentName,
  getTransferableCampaigns,
  sortCampaignAgents,
} from '../utils/scripts/index.ts';
import type { CampagneSelectOption } from '../utils/scripts/index.ts';

export function useCampagneFormView() {
  const navigate = useNavigate();
  const campaignForm = useCampagneForm();
  const campagneId = campaignForm.existing?.id_campagne ?? null;
  const campaignAgents = useCampagneAgents(campagneId);
  const { campagnes } = useCampagnes();
  const { employes, load: reloadEmployes, isLoading: employesLoading, error: employesError } = useEmployes();
  const [selectedAgent, setSelectedAgent] = useState<CampagneSelectOption | null>(null);
  const [transferDestinations, setTransferDestinations] = useState<Record<number, CampagneSelectOption | null>>({});

  const availableEmployes = useMemo(
    () => getAvailableCampaignEmployes(employes, campaignAgents.agents, campagneId),
    [campaignAgents.agents, campagneId, employes],
  );
  const transferableCampaigns = useMemo(
    () => getTransferableCampaigns(campagnes, campagneId),
    [campagneId, campagnes],
  );
  const sortedAgents = useMemo(
    () => sortCampaignAgents(campaignAgents.agents),
    [campaignAgents.agents],
  );
  const availableEmployeOptions = useMemo(
    () => buildCampaignEmployeOptions(availableEmployes, campagnes),
    [availableEmployes, campagnes],
  );
  const transferCampaignOptions = useMemo(
    () => buildTransferCampaignOptions(transferableCampaigns),
    [transferableCampaigns],
  );

  const navigateToCampaigns = useCallback((): void => {
    void navigate('/campagnes');
  }, [navigate]);

  const handleAddAgent = useCallback(async (): Promise<void> => {
    const employe = availableEmployes.find((item) => item.id_employe === Number(selectedAgent?.value));
    if (!employe) return;
    const source = employe.campagnesAssignees?.find((item) => item.date_fin_affectation === null);
    const sourceCampaign = campagnes.find((item) => item.id_campagne === source?.id_campagne);
    const success = await campaignAgents.addAgent(
      { id_employe: employe.id_employe },
      source ? { id_campagne: source.id_campagne, nom_campagne: source.campagne?.nom_campagne ?? sourceCampaign?.nom_campagne ?? `Campagne #${source.id_campagne}` } : undefined,
      `${employe.prenom} ${employe.nom}`.trim(),
      campaignForm.existing?.nom_campagne,
    );
    if (success) {
      setSelectedAgent(null);
      await reloadEmployes();
    }
  }, [availableEmployes, campaignAgents, campaignForm.existing, campagnes, reloadEmployes, selectedAgent]);

  const handleStartTransfer = useCallback((idEmploye: number): void => {
    campaignAgents.setTransferEnCours(idEmploye);
    setTransferDestinations((current) => ({ ...current, [idEmploye]: null }));
  }, [campaignAgents]);

  const setTransferDestination = useCallback((
    idEmploye: number,
    option: CampagneSelectOption | null,
  ): void => {
    setTransferDestinations((current) => ({ ...current, [idEmploye]: option }));
  }, []);

  const handleConfirmTransfer = useCallback((idEmploye: number, agentName: string): void => {
    const destinationId = Number(transferDestinations[idEmploye]?.value);
    const destination = transferableCampaigns.find(
      (campagne) => campagne.id_campagne === destinationId,
    );
    if (!destination) return;
    void campaignAgents.transferAgent(
      idEmploye,
      destinationId,
      agentName,
      destination.nom_campagne,
    ).then(reloadEmployes);
  }, [campaignAgents, reloadEmployes, transferDestinations, transferableCampaigns]);

  const handleRemoveAgent = useCallback((idEmploye: number, agentName: string): void => {
    void campaignAgents.removeAgent(idEmploye, agentName || 'cet agent').then(reloadEmployes);
  }, [campaignAgents, reloadEmployes]);

  const cancelTransfer = useCallback((): void => {
    campaignAgents.setTransferEnCours(null);
  }, [campaignAgents]);

  return {
    availableEmployeOptions,
    employesLoading,
    employesError,
    campaignAgents,
    campaignForm,
    cancelTransfer,
    getAgentName: getCampaignAgentName,
    handleAddAgent,
    handleConfirmTransfer,
    handleRemoveAgent,
    handleStartTransfer,
    navigateToCampaigns,
    selectedAgent,
    setSelectedAgent,
    setTransferDestination,
    sortedAgents,
    transferCampaignOptions,
    transferDestinations,
  };
}

export type CampagneFormViewModel = ReturnType<typeof useCampagneFormView>;
