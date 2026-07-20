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
  const { employes } = useEmployes();
  const [selectedAgent, setSelectedAgent] = useState<CampagneSelectOption | null>(null);
  const [transferDestinations, setTransferDestinations] = useState<Record<number, CampagneSelectOption | null>>({});

  const availableEmployes = useMemo(
    () => getAvailableCampaignEmployes(employes, campaignAgents.agents),
    [campaignAgents.agents, employes],
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
    () => buildCampaignEmployeOptions(availableEmployes),
    [availableEmployes],
  );
  const transferCampaignOptions = useMemo(
    () => buildTransferCampaignOptions(transferableCampaigns),
    [transferableCampaigns],
  );

  const navigateToCampaigns = useCallback((): void => {
    void navigate('/campagnes');
  }, [navigate]);

  const handleAddAgent = useCallback((): void => {
    if (!selectedAgent) return;
    void campaignAgents.addAgent({ id_employe: Number(selectedAgent.value) });
    setSelectedAgent(null);
  }, [campaignAgents, selectedAgent]);

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
    );
  }, [campaignAgents, transferDestinations, transferableCampaigns]);

  const handleRemoveAgent = useCallback((idEmploye: number, agentName: string): void => {
    void campaignAgents.removeAgent(idEmploye, agentName || 'cet agent');
  }, [campaignAgents]);

  const cancelTransfer = useCallback((): void => {
    campaignAgents.setTransferEnCours(null);
  }, [campaignAgents]);

  return {
    availableEmployeOptions,
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
