import { useCallback, useMemo, useState } from 'react';
import {
  cancelVigieActionService,
  createVigieActionService,
  createVigieManualPriorityService,
  createVigiePriorityBatchService,
} from '../API/services/index.ts';
import type {
  Campagne,
  CreateVigieActionData,
  VigieAction,
  VigieRecommendation,
  VigieSegmentDimension,
} from '../utils/types/index.ts';
import {
  buildVigieDateRange,
  getTopVigieContactHours,
  type SelectOption,
  type VigieActionMessageTone,
  type VigiePeriodKey,
} from '../utils/scripts/index.ts';
import { useCampagneAgents, useCampagnes } from './useCampagnes.ts';
import { useVigie } from './useVigie.ts';

export function useVigieView() {
  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [period, setPeriod] = useState<VigiePeriodKey>('today');
  const [segmentDimension, setSegmentDimension] = useState<VigieSegmentDimension>('secteur');
  const [isScoringExpanded, setIsScoringExpanded] = useState(false);
  const [sectorToPrepare, setSectorToPrepare] = useState('');
  const [selectedProspectIds, setSelectedProspectIds] = useState<number[]>([]);
  const [priorityAgentId, setPriorityAgentId] = useState<number | null>(null);
  const [manualPriorityTelephone, setManualPriorityTelephone] = useState('');
  const [manualPriorityLabel, setManualPriorityLabel] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageTone, setActionMessageTone] = useState<VigieActionMessageTone>('info');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const range = useMemo(() => buildVigieDateRange(period), [period]);
  const { snapshot, actions, isLoading, error, actionsError, refresh } = useVigie(selectedCampaignId, range);
  const { agents: campaignAgents, isLoading: campaignAgentsLoading } = useCampagneAgents(selectedCampaignId);

  const campaignOptions = useMemo<SelectOption<number>[]>(() => campagnes
    .filter((campagne: Campagne) => campagne.statut === 'active')
    .map((campagne: Campagne) => ({ value: campagne.id_campagne, label: campagne.nom_campagne })), [campagnes]);

  const agentOptions = useMemo<SelectOption<number>[]>(() => campaignAgents
    .filter((affectation) => affectation.agent)
    .map((affectation) => ({
      value: affectation.id_employe,
      label: `${affectation.agent?.prenom || ''} ${(affectation.agent?.nom || '').toUpperCase()} (${affectation.id_employe})`.trim(),
    })), [campaignAgents]);

  const selectedSegments = useMemo(() => snapshot?.segments
    .filter((segment) => segment.dimension === segmentDimension) || [], [snapshot, segmentDimension]);

  const selectedCandidates = useMemo(() => snapshot?.scoring.candidats
    .filter((candidate) => selectedProspectIds.includes(candidate.id_prospect)) || [], [snapshot, selectedProspectIds]);

  const validatedRecommendationKeys = useMemo(() => new Set(actions
    .filter((action) => action.type_action === 'validation_recommandation' && action.statut !== 'annulee')
    .map((action) => action.recommendation_key)
    .filter((key): key is string => Boolean(key))), [actions]);
  const topContactHours = useMemo(
    () => getTopVigieContactHours(snapshot?.creneaux_horaires || []),
    [snapshot?.creneaux_horaires],
  );

  const selectCampaign = useCallback((idCampaign: number | null): void => {
    setSelectedCampaignId(idCampaign);
    setPriorityAgentId(null);
    setSelectedProspectIds([]);
    setActionMessage(null);
  }, []);

  const submitAction = useCallback(async (
    data: CreateVigieActionData,
    successMessage: string,
  ): Promise<boolean> => {
    if (!selectedCampaignId) return false;
    const actionKey = `${data.type_action}-${data.recommendation_key || 'manual'}`;
    try {
      setPendingAction(actionKey);
      setActionMessage(null);
      await createVigieActionService(selectedCampaignId, data);
      setActionMessage(successMessage);
      setActionMessageTone('success');
      await refresh();
      return true;
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’enregistrer cette action.');
      setActionMessageTone('error');
      return false;
    } finally {
      setPendingAction(null);
    }
  }, [refresh, selectedCampaignId]);

  const validateRecommendation = useCallback(async (recommendation: VigieRecommendation): Promise<void> => {
    await submitAction({
      type_action: 'validation_recommandation',
      recommendation_key: recommendation.key,
      payload: {
        titre: recommendation.titre,
        detail: recommendation.detail,
        preuve: recommendation.preuve,
        moteur: snapshot?.meta.assistant || 'inconnu',
      },
    }, 'Conseil validé et ajouté au journal de vigie.');
  }, [snapshot, submitAction]);

  const prepareRecommendation = useCallback((recommendation: VigieRecommendation): void => {
    if (recommendation.valeur_suggeree) setSectorToPrepare(recommendation.valeur_suggeree);
    setActionMessage('Le conseil a été repris dans le formulaire. Vérifiez-le avant de l’enregistrer.');
    setActionMessageTone('info');
    document.getElementById('vigie-actions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const toggleCandidate = useCallback((idProspect: number): void => {
    setSelectedProspectIds((currentIds) => currentIds.includes(idProspect)
      ? currentIds.filter((id) => id !== idProspect)
      : [...currentIds, idProspect]);
  }, []);

  const selectAllCandidates = useCallback((selected: boolean): void => {
    setSelectedProspectIds(selected ? snapshot?.scoring.candidats.map((candidate) => candidate.id_prospect) || [] : []);
  }, [snapshot]);

  const prepareInjection = useCallback(async (): Promise<void> => {
    const saved = await submitAction({
      type_action: 'preparation_injection',
      recommendation_key: 'preparation-injection',
      payload: { secteur: sectorToPrepare.trim(), source: 'vigie_humaine' },
    }, 'Préparation d’injection enregistrée sans lancement automatique.');
    if (saved) setSectorToPrepare('');
  }, [sectorToPrepare, submitAction]);

  const submitPriorityBatch = useCallback(async (): Promise<void> => {
    if (!selectedCampaignId || !priorityAgentId || selectedCandidates.length === 0) return;
    try {
      setPendingAction('priorite-lot');
      setActionMessage(null);
      await createVigiePriorityBatchService(selectedCampaignId, {
        id_agent_cible: priorityAgentId,
        id_prospects: selectedCandidates.map((candidate) => candidate.id_prospect),
      });
      setActionMessage(`${selectedCandidates.length} fiche(s) envoyée(s) dans la file prioritaire du commercial, dans l’ordre du classement.`);
      setActionMessageTone('success');
      setSelectedProspectIds([]);
      await refresh();
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’enregistrer le lot prioritaire.');
      setActionMessageTone('error');
    } finally {
      setPendingAction(null);
    }
  }, [priorityAgentId, refresh, selectedCampaignId, selectedCandidates]);

  const submitManualPriority = useCallback(async (): Promise<void> => {
    if (!selectedCampaignId || !priorityAgentId || !manualPriorityTelephone.trim()) return;
    try {
      setPendingAction('priorite-manuelle');
      setActionMessage(null);
      await createVigieManualPriorityService(selectedCampaignId, {
        id_agent_cible: priorityAgentId,
        telephone_prospect: manualPriorityTelephone.trim(),
        libelle_prospect: manualPriorityLabel.trim() || undefined,
      });
      setActionMessage('Numéro injecté : il sera appelé en priorité dès le prochain passage disponible du commercial, après les rappels échus.');
      setActionMessageTone('success');
      setManualPriorityTelephone('');
      setManualPriorityLabel('');
      await refresh();
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’injecter ce numéro.');
      setActionMessageTone('error');
    } finally {
      setPendingAction(null);
    }
  }, [manualPriorityLabel, manualPriorityTelephone, priorityAgentId, refresh, selectedCampaignId]);

  const cancelAction = useCallback(async (action: VigieAction): Promise<void> => {
    if (!selectedCampaignId) return;
    try {
      setPendingAction(`cancel-${action.id_vigie_action}`);
      await cancelVigieActionService(selectedCampaignId, action.id_vigie_action);
      setActionMessage('Priorité annulée. Elle ne sera plus distribuée au commercial.');
      setActionMessageTone('success');
      await refresh();
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’annuler cette action.');
      setActionMessageTone('error');
    } finally {
      setPendingAction(null);
    }
  }, [refresh, selectedCampaignId]);

  return {
    actionMessage,
    actionMessageTone,
    actions,
    actionsError,
    agentOptions,
    campaignAgentsLoading,
    campaignOptions,
    campagnesLoading,
    cancelAction,
    error,
    isLoading,
    isScoringExpanded,
    manualPriorityLabel,
    manualPriorityTelephone,
    pendingAction,
    period,
    prepareInjection,
    prepareRecommendation,
    priorityAgentId,
    refresh,
    sectorToPrepare,
    segmentDimension,
    selectAllCandidates,
    selectCampaign,
    selectedCampaignId,
    selectedCandidates,
    selectedProspectIds,
    selectedSegments,
    setIsScoringExpanded,
    setManualPriorityLabel,
    setManualPriorityTelephone,
    setPeriod,
    setPriorityAgentId,
    setSectorToPrepare,
    setSegmentDimension,
    setSelectedProspectIds,
    snapshot,
    submitManualPriority,
    submitPriorityBatch,
    toggleCandidate,
    topContactHours,
    validateRecommendation,
    validatedRecommendationKeys,
  };
}

export type VigieViewState = ReturnType<typeof useVigieView>;
