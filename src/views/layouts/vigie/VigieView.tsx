import { ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { StylesConfig } from 'react-select';
import {
  IoAnalyticsOutline,
  IoBulbOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoEyeOutline,
  IoFlagOutline,
  IoPeopleOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoWarningOutline
} from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useCampagneAgents, useCampagnes } from '../../../hooks/useCampagnes';
import { useVigie } from '../../../hooks/useVigie';
import {
  cancelVigieActionService,
  createVigieActionService,
  createVigieManualPriorityService,
  createVigiePriorityBatchService,
  type CreateVigieActionData
} from '../../../API/services/vigie.service';
import type { Campagne } from '../../../utils/types/campagne.types';
import type {
  VigieAction,
  VigieDateRange,
  VigieRecommendation,
  VigieSegmentDimension
} from '../../../utils/types/vigie.types';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import './vigieView.scss';

interface SelectOption<T> {
  value: T;
  label: string;
}

type PeriodKey = 'today' | '7d' | '30d' | 'since-june';
type ActionMessageTone = 'success' | 'error' | 'info';

const PERIOD_OPTIONS: SelectOption<PeriodKey>[] = [
  { value: 'today', label: 'Aujourd’hui' },
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: 'since-june', label: 'Depuis le 1er juin 2026' }
];

const SEGMENT_LABELS: Record<VigieSegmentDimension, string> = {
  secteur: 'Secteurs / activités',
  source: 'Sources',
  departement: 'Départements',
  distance: 'Distance au client campagne',
  telephone: 'Types de téléphone',
  maturite: 'Maturité'
};

const ACTION_LABELS: Record<VigieAction['type_action'], string> = {
  validation_recommandation: 'Conseil validé',
  preparation_injection: 'Injection préparée',
  priorite_fiche: 'Priorité prochain appel'
};

const STATUS_LABELS: Record<VigieAction['statut'], string> = {
  validee: 'Active',
  annulee: 'Annulée',
  consommee: 'Consommée'
};

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDateRange = (period: PeriodKey): VigieDateRange => {
  const end = new Date();
  const start = new Date(end);
  if (period === 'today') return { dateDebut: toIsoDate(end), dateFin: toIsoDate(end) };
  if (period === 'since-june') return { dateDebut: '2026-06-01', dateFin: toIsoDate(end) };
  start.setDate(start.getDate() - (period === '30d' ? 29 : 6));
  return { dateDebut: toIsoDate(start), dateFin: toIsoDate(end) };
};

const formatNumber = (value: number): string => value.toLocaleString('fr-FR');
const formatPercent = (value: number | null): string => value === null
  ? '—'
  : `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
const formatPerThousand = (value: number | null): string => value === null
  ? '—'
  : value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
const formatCurrency = (value: number | null): string => value === null
  ? '—'
  : value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const formatDistance = (value: number | null): string => value === null
  ? 'distance inconnue'
  : `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
const formatDate = (value: string): string => new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR');
const formatDateTime = (value: string): string => new Date(value).toLocaleString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
});

const getPayloadLabel = (action: VigieAction): string | null => {
  const sector = action.payload.secteur;
  if (typeof sector === 'string' && sector.trim()) return sector;
  const recommendation = action.payload.titre;
  if (typeof recommendation === 'string' && recommendation.trim()) return recommendation;
  const manualLabel = action.payload.libelle;
  if (typeof manualLabel === 'string' && manualLabel.trim()) return manualLabel;
  return null;
};

function VigieView(): ReactElement {
  const navigate = useNavigate();
  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const activeCampaigns = useMemo(
    () => campagnes.filter((campagne: Campagne) => campagne.statut === 'active'),
    [campagnes]
  );
  const campaignOptions = useMemo<SelectOption<number>[]>(
    () => activeCampaigns.map((campagne: Campagne) => ({
      value: campagne.id_campagne,
      label: campagne.nom_campagne
    })),
    [activeCampaigns]
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [period, setPeriod] = useState<PeriodKey>('today');
  const range = useMemo(() => buildDateRange(period), [period]);
  const [segmentDimension, setSegmentDimension] = useState<VigieSegmentDimension>('secteur');
  const [isScoringExpanded, setIsScoringExpanded] = useState(false);
  const [sectorToPrepare, setSectorToPrepare] = useState('');
  const [selectedProspectIds, setSelectedProspectIds] = useState<number[]>([]);
  const [priorityAgentId, setPriorityAgentId] = useState<number | null>(null);
  const [manualPriorityTelephone, setManualPriorityTelephone] = useState('');
  const [manualPriorityLabel, setManualPriorityLabel] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionMessageTone, setActionMessageTone] = useState<ActionMessageTone>('info');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { snapshot, actions, isLoading, error, actionsError, refresh } = useVigie(selectedCampaignId, range);
  const { agents: campaignAgents, isLoading: campaignAgentsLoading } = useCampagneAgents(selectedCampaignId);

  const agentOptions = useMemo<SelectOption<number>[]>(() => campaignAgents
    .filter((affectation) => affectation.agent)
    .map((affectation) => ({
      value: affectation.id_employe,
      label: `${affectation.agent?.prenom || ''} ${(affectation.agent?.nom || '').toUpperCase()} (${affectation.id_employe})`.trim()
    })), [campaignAgents]);

  const selectedSegments = useMemo(
    () => snapshot?.segments.filter((segment) => segment.dimension === segmentDimension) || [],
    [snapshot, segmentDimension]
  );

  const selectedCandidates = useMemo(() => snapshot?.scoring.candidats
    .filter((candidate) => selectedProspectIds.includes(candidate.id_prospect)) || [], [snapshot, selectedProspectIds]);

  const validatedRecommendationKeys = useMemo(() => new Set(actions
    .filter((action) => action.type_action === 'validation_recommandation' && action.statut !== 'annulee')
    .map((action) => action.recommendation_key)
    .filter((key): key is string => Boolean(key))), [actions]);

  const submitAction = async (data: CreateVigieActionData, successMessage: string): Promise<boolean> => {
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
    } catch (actionError: unknown) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’enregistrer cette action.');
      setActionMessageTone('error');
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const validateRecommendation = async (recommendation: VigieRecommendation): Promise<void> => {
    await submitAction({
      type_action: 'validation_recommandation',
      recommendation_key: recommendation.key,
      payload: {
        titre: recommendation.titre,
        detail: recommendation.detail,
        preuve: recommendation.preuve,
        moteur: snapshot?.meta.assistant || 'inconnu'
      }
    }, 'Conseil validé et ajouté au journal de vigie.');
  };

  const prepareRecommendation = (recommendation: VigieRecommendation): void => {
    if (recommendation.valeur_suggeree) setSectorToPrepare(recommendation.valeur_suggeree);
    setActionMessage('Le conseil a été repris dans le formulaire. Vérifiez-le avant de l’enregistrer.');
    setActionMessageTone('info');
    document.getElementById('vigie-actions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleCandidate = (idProspect: number): void => {
    setSelectedProspectIds((currentIds) => currentIds.includes(idProspect)
      ? currentIds.filter((id) => id !== idProspect)
      : [...currentIds, idProspect]);
  };

  const submitPriorityBatch = async (): Promise<void> => {
    if (!selectedCampaignId || !priorityAgentId || selectedCandidates.length === 0) return;
    try {
      setPendingAction('priorite-lot');
      setActionMessage(null);
      await createVigiePriorityBatchService(selectedCampaignId, {
        id_agent_cible: priorityAgentId,
        id_prospects: selectedCandidates.map((candidate) => candidate.id_prospect)
      });
      setActionMessage(`${selectedCandidates.length} fiche(s) envoyée(s) dans la file prioritaire du commercial, dans l’ordre du classement.`);
      setActionMessageTone('success');
      setSelectedProspectIds([]);
      await refresh();
    } catch (actionError: unknown) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’enregistrer le lot prioritaire.');
      setActionMessageTone('error');
    } finally {
      setPendingAction(null);
    }
  };

  const submitManualPriority = async (): Promise<void> => {
    if (!selectedCampaignId || !priorityAgentId || !manualPriorityTelephone.trim()) return;
    try {
      setPendingAction('priorite-manuelle');
      setActionMessage(null);
      await createVigieManualPriorityService(selectedCampaignId, {
        id_agent_cible: priorityAgentId,
        telephone_prospect: manualPriorityTelephone.trim(),
        libelle_prospect: manualPriorityLabel.trim() || undefined
      });
      setActionMessage('Numéro injecté : il sera appelé en priorité dès le prochain passage disponible du commercial, après les rappels échus.');
      setActionMessageTone('success');
      setManualPriorityTelephone('');
      setManualPriorityLabel('');
      await refresh();
    } catch (actionError: unknown) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’injecter ce numéro.');
      setActionMessageTone('error');
    } finally {
      setPendingAction(null);
    }
  };

  const cancelAction = async (action: VigieAction): Promise<void> => {
    if (!selectedCampaignId) return;
    try {
      setPendingAction(`cancel-${action.id_vigie_action}`);
      await cancelVigieActionService(selectedCampaignId, action.id_vigie_action);
      setActionMessage('Priorité annulée. Elle ne sera plus distribuée au commercial.');
      setActionMessageTone('success');
      await refresh();
    } catch (actionError: unknown) {
      setActionMessage(actionError instanceof Error ? actionError.message : 'Impossible d’annuler cette action.');
      setActionMessageTone('error');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div id="vigieView">
      <Header />
      <SubNav />
      <main>
        <div className="vigieView__container">
          <div className="vigieView__header">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack /> Retour
            </Button>
            <div>
              <span className="vigieView__eyebrow"><IoEyeOutline /> Vigie humaine</span>
              <h1>Piloter la file en temps réel</h1>
              <p>Observer la cadence, la qualité des fiches, les contacts humains et les résultats métier pour décider où concentrer les prochains appels.</p>
            </div>
          </div>

          <section className="vigieView__intro" aria-label="Rôle de la vigie">
            <IoShieldCheckmarkOutline />
            <div>
              <strong>Un assistant de décision, pas un pilote automatique</strong>
              <span>Les conseils sont produits par des règles transparentes issues de l’analyse des données. Aucune injection ni priorité n’est exécutée sans confirmation humaine.</span>
            </div>
          </section>

          <section className="vigieView__filters" aria-label="Filtres de la vigie">
            <div>
              <label htmlFor="vigie-campaign">Campagne active à observer</label>
              <Select<SelectOption<number>, false>
                inputId="vigie-campaign"
                options={campaignOptions}
                value={campaignOptions.find((option) => option.value === selectedCampaignId) || null}
                onChange={(option) => {
                  setSelectedCampaignId(option?.value ?? null);
                  setPriorityAgentId(null);
                  setSelectedProspectIds([]);
                  setActionMessage(null);
                }}
                styles={reactSelectStyles as StylesConfig<SelectOption<number>, false>}
                placeholder={campagnesLoading ? 'Chargement des campagnes...' : 'Choisir une campagne active...'}
                isLoading={campagnesLoading}
                isDisabled={campagnesLoading}
                isClearable
              />
            </div>
            <div>
              <label htmlFor="vigie-period">Période d’analyse</label>
              <Select<SelectOption<PeriodKey>, false>
                inputId="vigie-period"
                options={PERIOD_OPTIONS}
                value={PERIOD_OPTIONS.find((option) => option.value === period)}
                onChange={(option) => setPeriod(option?.value || '7d')}
                styles={reactSelectStyles as StylesConfig<SelectOption<PeriodKey>, false>}
                isSearchable={false}
              />
            </div>
          </section>

          {!selectedCampaignId && !campagnesLoading && (
            <section className="vigieView__empty">
              <IoStatsChartOutline />
              <h2>Choisissez une campagne pour ouvrir la vigie</h2>
              <p>Chaque campagne conserve ses propres résultats, statuts et recommandations afin de ne jamais mélanger Cigales et MMA.</p>
            </section>
          )}

          {selectedCampaignId && isLoading && !snapshot && <Loader message="Construction de la vigie opérationnelle..." />}
          {error && <div className="vigieView__error"><IoWarningOutline /> {error}</div>}

          {snapshot && (
            <div className="vigieView__content">
              <div className="vigieView__period">
                <div>
                  <strong>{snapshot.campagne.nom_campagne}</strong>
                  <span>Du {formatDate(snapshot.periode.date_debut)} au {formatDate(snapshot.periode.date_fin)} · actualisé à {new Date(snapshot.meta.donnees_actualisees_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {snapshot.campagne.code_postal_maison_mere && (
                    <span>Point de référence proximité : {snapshot.campagne.ville || 'siège client'} ({snapshot.campagne.code_postal_maison_mere})</span>
                  )}
                </div>
                <button className="vigieView__button vigieView__button--secondary" type="button" onClick={() => { void refresh(); }} disabled={isLoading}>
                  <IoRefreshOutline /> Actualiser
                </button>
              </div>

              <section className="vigieView__objective" aria-label="Objectif d’appels du jour">
                <div className="vigieView__objective-copy">
                  <span><IoFlagOutline /> Objectif du jour</span>
                  <strong>{formatNumber(snapshot.objectif.appels_aujourdhui)} / {formatNumber(snapshot.objectif.objectif_jour)} appels</strong>
                  <small>{snapshot.objectif.agents_ayant_appele} commercial(aux) actif(s) aujourd’hui · {snapshot.objectif.appels_par_agent} appels par commercial</small>
                </div>
                <div className="vigieView__progress" aria-label={`Objectif atteint à ${snapshot.objectif.taux_atteinte || 0}%`}>
                  <span style={{ width: `${Math.min(snapshot.objectif.taux_atteinte || 0, 100)}%` }} />
                </div>
                <b>{formatPercent(snapshot.objectif.taux_atteinte)}</b>
              </section>

              <section className="vigieView__kpis" aria-label="Indicateurs clés">
                <article><span>Appels analysés</span><strong>{formatNumber(snapshot.summary.appels)}</strong><small>{formatNumber(snapshot.summary.prospects_appeles)} prospects distincts</small></article>
                <article><span>Décrochés estimés</span><strong>{formatPercent(snapshot.summary.taux_decroche)}</strong><small>{formatNumber(snapshot.summary.decroches)} appels décrochés</small></article>
                <article><span>Contacts humains</span><strong>{formatPercent(snapshot.summary.taux_contact_humain)}</strong><small>{formatNumber(snapshot.summary.contacts_humains)} conversations</small></article>
                <article className="vigieView__kpi--result"><span>{snapshot.resultat_metier.libelle_pluriel}</span><strong>{formatNumber(snapshot.resultat_metier.total)}</strong><small>{formatPerThousand(snapshot.resultat_metier.pour_1000_appels)} pour 1 000 appels</small></article>
                <article><span>Fiches distribuables</span><strong>{formatNumber(snapshot.summary.fiches_pretes)}</strong><small>{snapshot.summary.jours_couverture_file === null ? 'couverture non calculable' : `≈ ${snapshot.summary.jours_couverture_file} jours de couverture`}</small></article>
                <article><span>Rappels réservés</span><strong>{formatNumber(snapshot.summary.rappels_reserves)}</strong><small>restent prioritaires à l’échéance</small></article>
              </section>

              <div className="vigieView__grid vigieView__grid--decision">
                <section className="vigieView__panel vigieView__panel--assistant">
                  <div className="vigieView__panel-title">
                    <IoBulbOutline />
                    <div><h2>Assistant Vigie</h2><p>Recommandations explicables à confirmer par le superviseur.</p></div>
                  </div>
                  <div className="vigieView__recommendations">
                    {snapshot.recommandations.map((recommendation) => {
                      const isValidated = validatedRecommendationKeys.has(recommendation.key);
                      return (
                        <article key={recommendation.key} className={`vigieView__recommendation vigieView__recommendation--${recommendation.niveau}`}>
                          <div className="vigieView__recommendation-heading">
                            <strong>{recommendation.titre}</strong>
                            <span>{recommendation.niveau}</span>
                          </div>
                          <p>{recommendation.detail}</p>
                          <small>{recommendation.preuve}</small>
                          <div className="vigieView__recommendation-footer">
                            <span>Aucune action automatique</span>
                            <div>
                              {recommendation.action_suggeree === 'preparation_injection' && (
                                <button className="vigieView__button vigieView__button--ghost" type="button" onClick={() => prepareRecommendation(recommendation)}>Reprendre</button>
                              )}
                              <button
                                className="vigieView__button vigieView__button--primary"
                                type="button"
                                disabled={isValidated || pendingAction === `validation_recommandation-${recommendation.key}`}
                                onClick={() => { void validateRecommendation(recommendation); }}
                              >
                                {isValidated ? <><IoCheckmarkCircleOutline /> Validé</> : 'Valider le conseil'}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="vigieView__panel vigieView__business">
                  <div className="vigieView__panel-title">
                    <IoAnalyticsOutline />
                    <div><h2>Résultat métier</h2><p>Le signal commercial distinct du simple statut d’appel.</p></div>
                  </div>
                  <div className="vigieView__business-main">
                    <span>{snapshot.resultat_metier.libelle_pluriel}</span>
                    <strong>{formatNumber(snapshot.resultat_metier.total)}</strong>
                    <small>{formatPerThousand(snapshot.resultat_metier.pour_1000_appels)} pour 1 000 appels</small>
                  </div>
                  {snapshot.resultat_metier.valeur_nominale !== null && (
                    <div className="vigieView__business-value"><span>Valeur nominale produite</span><strong>{formatCurrency(snapshot.resultat_metier.valeur_nominale)}</strong></div>
                  )}
                  <dl className="vigieView__business-stats">
                    <div><dt>Reliés à un appel</dt><dd>{formatPercent(snapshot.resultat_metier.taux_liaison_appel)}</dd></div>
                    {snapshot.resultat_metier.taux_validation !== null && <div><dt>Validés ensuite</dt><dd>{formatPercent(snapshot.resultat_metier.taux_validation)}</dd></div>}
                    {snapshot.resultat_metier.taux_envoi_trace !== null && <div><dt>Envoi horodaté</dt><dd>{formatPercent(snapshot.resultat_metier.taux_envoi_trace)}</dd></div>}
                  </dl>
                  <div className="vigieView__status-cloud">
                    {snapshot.resultat_metier.statuts.map((status) => <span key={status.statut}>{status.statut.replace(/_/g, ' ')} <b>{status.total}</b></span>)}
                  </div>
                  <p className="vigieView__business-rule">{snapshot.resultat_metier.regle_metier}</p>
                </section>
              </div>

              <section className="vigieView__panel vigieView__scoring">
                <div className="vigieView__panel-title vigieView__panel-title--split">
                  <IoStatsChartOutline />
                  <div><h2>Potentiel relatif des fiches</h2><p>{snapshot.scoring.disclaimer}</p></div>
                  <div className="vigieView__scoring-controls">
                    <span className="vigieView__version">{snapshot.scoring.version}</span>
                    <button
                      className="vigieView__disclosure"
                      type="button"
                      aria-expanded={isScoringExpanded}
                      aria-controls="vigie-scoring-detail"
                      onClick={() => setIsScoringExpanded((isExpanded) => !isExpanded)}
                    >
                      <span>{isScoringExpanded ? 'Masquer le détail' : 'Voir le détail'}</span>
                      {isScoringExpanded ? <IoChevronUpOutline aria-hidden="true" /> : <IoChevronDownOutline aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                {isScoringExpanded && (
                  <div id="vigie-scoring-detail" className="vigieView__scoring-detail">
                    <div className="vigieView__score-distribution">
                      {(['P1', 'P2', 'P3', 'P4', 'P5'] as const).map((scoreClass) => {
                        const distribution = snapshot.scoring.distribution.find((item) => item.classe === scoreClass);
                        return (
                          <article key={scoreClass} className={`vigieView__score-card vigieView__score-card--${scoreClass.toLowerCase()}`}>
                            <strong>{scoreClass}</strong>
                            <span>{formatNumber(distribution?.fiches || 0)} fiches</span>
                            <small>{distribution ? `score ${distribution.score_min}–${distribution.score_max}` : 'aucune fiche'}</small>
                          </article>
                        );
                      })}
                    </div>
                    <div className="vigieView__selection-bar">
                      <strong>{selectedCandidates.length} fiche(s) sélectionnée(s)</strong>
                      <span>L’ordre du classement P1–P5 devient l’ordre de distribution au commercial.</span>
                      <button
                        className="vigieView__button vigieView__button--ghost"
                        type="button"
                        disabled={selectedCandidates.length === 0}
                        onClick={() => setSelectedProspectIds([])}
                      >Vider la sélection</button>
                    </div>
                    <div className="vigieView__table-wrap">
                      <table>
                        <thead><tr>
                          <th className="vigieView__check-cell">
                            <input
                              type="checkbox"
                              aria-label="Sélectionner toutes les fiches proposées"
                              checked={snapshot.scoring.candidats.length > 0 && selectedCandidates.length === snapshot.scoring.candidats.length}
                              onChange={(event) => setSelectedProspectIds(event.target.checked
                                ? snapshot.scoring.candidats.map((candidate) => candidate.id_prospect)
                                : [])}
                            />
                          </th>
                          <th>Classe</th><th>Fiche</th><th>Segment / distance</th><th>Pourquoi</th><th>Score</th>
                        </tr></thead>
                        <tbody>
                          {snapshot.scoring.candidats.map((candidate) => (
                            <tr key={candidate.id_prospect} className={selectedProspectIds.includes(candidate.id_prospect) ? 'vigieView__candidate--selected' : undefined}>
                              <td className="vigieView__check-cell">
                                <input
                                  type="checkbox"
                                  aria-label={`Sélectionner ${candidate.raison_sociale}`}
                                  checked={selectedProspectIds.includes(candidate.id_prospect)}
                                  onChange={() => toggleCandidate(candidate.id_prospect)}
                                />
                              </td>
                              <td><span className={`vigieView__score-badge vigieView__score-badge--${candidate.classe.toLowerCase()}`}>{candidate.classe}</span></td>
                              <td><strong>{candidate.raison_sociale}</strong><small>{candidate.telephone_contact || candidate.telephone}</small></td>
                              <td>{candidate.segment}<small>{formatDistance(candidate.distance_km)} du client campagne</small></td>
                              <td>{candidate.raisons.join(' · ')}</td>
                              <td><b>{candidate.score}</b><small>+{candidate.score_proximite} proximité · {candidate.nb_tentatives} tentative(s)</small></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              <section id="vigie-actions" className="vigieView__panel vigieView__actions">
                <div className="vigieView__panel-title">
                  <IoEyeOutline />
                  <div><h2>Actions humaines tracées</h2><p>Préparer, confirmer puis suivre chaque décision prise depuis la vigie.</p></div>
                </div>
                <div className="vigieView__action-grid">
                  <div className="vigieView__prepare-action">
                    <div><span className="vigieView__step">01</span><h3>Préparer une injection ciblée</h3></div>
                    <p>La demande sera journalisée pour contrôle. Elle ne lance aucun import.</p>
                    <label htmlFor="vigie-sector">Segment, secteur ou critère souhaité</label>
                    <input id="vigie-sector" value={sectorToPrepare} onChange={(event) => setSectorToPrepare(event.target.value)} placeholder="Ex. Bâtiment – département 69" />
                    <button
                      className="vigieView__button vigieView__button--primary"
                      type="button"
                      disabled={!sectorToPrepare.trim() || pendingAction === 'preparation_injection-preparation-injection'}
                      onClick={() => {
                        void submitAction({
                          type_action: 'preparation_injection',
                          recommendation_key: 'preparation-injection',
                          payload: { secteur: sectorToPrepare.trim(), source: 'vigie_humaine' }
                        }, 'Préparation d’injection enregistrée sans lancement automatique.').then((saved) => {
                          if (saved) setSectorToPrepare('');
                        });
                      }}
                    >Préparer l’injection</button>
                  </div>

                  <div className="vigieView__prepare-action">
                    <div><span className="vigieView__step">02</span><h3>Envoyer un lot prioritaire</h3></div>
                    <p>Sélectionnez jusqu’à 30 fiches dans le classement. Elles expirent après 24 h et les rappels échus restent servis avant le lot.</p>
                    <div className="vigieView__selected-list">
                      {selectedCandidates.length === 0 ? (
                        <span>Sélectionnez les fiches à envoyer dans le tableau Potentiel.</span>
                      ) : selectedCandidates.map((candidate, index) => (
                        <button
                          key={candidate.id_prospect}
                          type="button"
                          onClick={() => toggleCandidate(candidate.id_prospect)}
                          title="Retirer de la sélection"
                        >
                          <b>{index + 1}</b>
                          <span>{candidate.raison_sociale}</span>
                          <small>{candidate.telephone_contact || candidate.telephone}</small>
                        </button>
                      ))}
                    </div>
                    <label htmlFor="vigie-priority-agent">Commercial affecté à la campagne</label>
                    <Select<SelectOption<number>, false>
                      inputId="vigie-priority-agent"
                      options={agentOptions}
                      value={agentOptions.find((option) => option.value === priorityAgentId) || null}
                      onChange={(option) => setPriorityAgentId(option?.value ?? null)}
                      styles={reactSelectStyles as StylesConfig<SelectOption<number>, false>}
                      placeholder={campaignAgentsLoading ? 'Chargement des agents...' : 'Choisir un commercial...'}
                      isLoading={campaignAgentsLoading}
                      isDisabled={campaignAgentsLoading}
                    />
                    <button
                      className="vigieView__button vigieView__button--primary"
                      type="button"
                      disabled={selectedCandidates.length === 0 || !priorityAgentId || pendingAction === 'priorite-lot'}
                      onClick={() => { void submitPriorityBatch(); }}
                    >Envoyer {selectedCandidates.length || ''} fiche(s) au commercial</button>
                    <div className="vigieView__manual-priority">
                      <div><span>ou</span><strong>Injecter un numéro manuel</strong></div>
                      <p>Pour un rappel transmis au superviseur : la fiche est créée ou rattachée à la campagne, puis servie en priorité au commercial choisi.</p>
                      <label htmlFor="vigie-manual-priority-phone">Numéro à appeler</label>
                      <input
                        id="vigie-manual-priority-phone"
                        type="tel"
                        value={manualPriorityTelephone}
                        onChange={(event) => setManualPriorityTelephone(event.target.value)}
                        placeholder="Ex. 06 12 34 56 78"
                      />
                      <label htmlFor="vigie-manual-priority-label">Nom ou société <em>facultatif</em></label>
                      <input
                        id="vigie-manual-priority-label"
                        value={manualPriorityLabel}
                        onChange={(event) => setManualPriorityLabel(event.target.value)}
                        placeholder="Ex. Mme Martin — rappel demandé"
                      />
                      <button
                        className="vigieView__button vigieView__button--secondary"
                        type="button"
                        disabled={!manualPriorityTelephone.trim() || !priorityAgentId || pendingAction === 'priorite-manuelle'}
                        onClick={() => { void submitManualPriority(); }}
                      >Injecter et prioriser ce numéro</button>
                    </div>
                  </div>
                </div>

                {actionMessage && <p className={`vigieView__action-message vigieView__action-message--${actionMessageTone}`}>{actionMessage}</p>}

                <div className="vigieView__journal">
                  <div className="vigieView__journal-title"><h3>Journal récent</h3><span>{actions.length} action(s)</span></div>
                  {actionsError && <p className="vigieView__inline-error">{actionsError}</p>}
                  {actions.length === 0 && !actionsError ? (
                    <p className="vigieView__empty-copy">Aucune action enregistrée pour cette campagne.</p>
                  ) : (
                    <div className="vigieView__journal-list">
                      {actions.map((action) => (
                        <article key={action.id_vigie_action}>
                          <div className="vigieView__journal-icon"><IoTimeOutline /></div>
                          <div>
                            <strong>{ACTION_LABELS[action.type_action]}</strong>
                            <span>
                              {getPayloadLabel(action) || action.prospect_raison_sociale || action.prospect_nom || action.prospect_telephone || 'Action de vigie'}
                              {action.agent_cible_nom ? ` · pour ${action.agent_cible_prenom || ''} ${action.agent_cible_nom}` : ''}
                            </span>
                            <small>{formatDateTime(action.created_at)} · par {action.createur_prenom} {action.createur_nom}</small>
                          </div>
                          <span className={`vigieView__action-status vigieView__action-status--${action.est_expiree ? 'annulee' : action.statut}`}>{action.est_expiree ? 'Expirée' : STATUS_LABELS[action.statut]}</span>
                          {action.type_action === 'priorite_fiche' && action.statut === 'validee' && !action.est_expiree && (
                            <button
                              className="vigieView__button vigieView__button--danger-link"
                              type="button"
                              disabled={pendingAction === `cancel-${action.id_vigie_action}`}
                              onClick={() => { void cancelAction(action); }}
                            >Annuler</button>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="vigieView__panel vigieView__segments">
                <div className="vigieView__panel-title">
                  <IoAnalyticsOutline />
                  <div><h2>Comparer les segments</h2><p>Repérer des écarts, sans conclure lorsque l’échantillon est trop petit.</p></div>
                </div>
                <div className="vigieView__tabs" role="tablist" aria-label="Dimensions de segmentation">
                  {(Object.keys(SEGMENT_LABELS) as VigieSegmentDimension[]).map((dimension) => (
                    <button
                      key={dimension}
                      type="button"
                      role="tab"
                      aria-selected={segmentDimension === dimension}
                      className={segmentDimension === dimension ? 'vigieView__tab--active' : ''}
                      onClick={() => setSegmentDimension(dimension)}
                    >{SEGMENT_LABELS[dimension]}</button>
                  ))}
                </div>
                <div className="vigieView__table-wrap">
                  <table>
                    <thead><tr><th>Segment</th><th>Prospects</th><th>Appels</th><th>Contact humain</th><th>{snapshot.resultat_metier.libelle_pluriel}</th><th>Pour 1 000 appels</th><th>File prête</th><th>Lecture</th></tr></thead>
                    <tbody>
                      {selectedSegments.map((segment) => (
                        <tr key={`${segment.dimension}-${segment.libelle}`}>
                          <td><strong>{segment.libelle}</strong></td>
                          <td>{formatNumber(segment.prospects)}</td>
                          <td>{formatNumber(segment.appels)}</td>
                          <td>{formatPercent(segment.taux_contact_humain)}</td>
                          <td>{formatNumber(segment.resultats)}</td>
                          <td>{formatPerThousand(segment.resultats_pour_1000_appels)}</td>
                          <td>{formatNumber(segment.fiches_pretes)}</td>
                          <td><span className={`vigieView__sample vigieView__sample--${segment.echantillon_suffisant ? 'ok' : 'limited'}`}>{segment.echantillon_suffisant ? 'Interprétable' : 'À confirmer'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="vigieView__grid vigieView__grid--quality">
                <section className="vigieView__panel">
                  <div className="vigieView__panel-title"><IoShieldCheckmarkOutline /><div><h2>Qualité du fichier</h2><p>Les champs réellement utiles au ciblage et au discours.</p></div></div>
                  <dl className="vigieView__quality-list">
                    <div><dt>Fiches campagne</dt><dd>{formatNumber(snapshot.qualite_fichier.fiches_file)}</dd></div>
                    <div><dt>Sans segment exploitable</dt><dd>{formatNumber(snapshot.qualite_fichier.sans_segment_exploitable)}</dd></div>
                    <div><dt>Sans contact nommé</dt><dd>{formatNumber(snapshot.qualite_fichier.sans_contact_nomme)}</dd></div>
                    <div><dt>Sans code NAF</dt><dd>{formatNumber(snapshot.qualite_fichier.sans_code_naf)}</dd></div>
                    <div><dt>Sans code postal</dt><dd>{formatNumber(snapshot.qualite_fichier.sans_code_postal)}</dd></div>
                    <div><dt>Sans maturité</dt><dd>{formatNumber(snapshot.qualite_fichier.sans_maturite)}</dd></div>
                    <div><dt>Mobiles identifiés</dt><dd>{formatNumber(snapshot.qualite_fichier.mobiles)}</dd></div>
                    <div><dt>Doublons / blacklist</dt><dd>{formatNumber(snapshot.qualite_fichier.doublons + snapshot.qualite_fichier.blacklists)}</dd></div>
                  </dl>
                  <p className="vigieView__quality-note">Le secteur brut manquant ({formatNumber(snapshot.qualite_fichier.sans_secteur_brut)}) est compensé lorsque l’activité ou le code NAF permet une segmentation exploitable.</p>
                </section>

                <section className="vigieView__panel">
                  <div className="vigieView__panel-title"><IoPeopleOutline /><div><h2>Cadence par commercial</h2><p>L’objectif de 200 appels reste complété par la qualité des contacts.</p></div></div>
                  <div className="vigieView__compact-list">
                    {snapshot.agents.map((agent) => (
                      <article key={agent.id_agent}>
                        <div><strong>{agent.prenom} {agent.nom.toUpperCase()}</strong><span>{formatPercent(agent.taux_contact_humain)} de contacts humains · {agent.resultats} résultat(s)</span></div>
                        <div><b>{formatNumber(agent.appels_aujourdhui)}</b><small>/ {snapshot.objectif.appels_par_agent} aujourd’hui</small></div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="vigieView__grid vigieView__grid--signals">
                <section className="vigieView__panel">
                  <div className="vigieView__panel-title"><IoTimeOutline /><div><h2>Créneaux de contact</h2><p>Taux de contact humain constaté par heure.</p></div></div>
                  <div className="vigieView__hour-grid">
                    {[...snapshot.creneaux_horaires]
                      .sort((left, right) => (right.taux_contact_humain || 0) - (left.taux_contact_humain || 0))
                      .slice(0, 6)
                      .map((hour) => (
                        <article key={hour.heure}><strong>{String(hour.heure).padStart(2, '0')}h–{String(hour.heure + 1).padStart(2, '0')}h</strong><span>{formatPercent(hour.taux_contact_humain)}</span><small>{formatNumber(hour.appels)} appels</small></article>
                      ))}
                  </div>
                </section>
                <section className="vigieView__panel">
                  <div className="vigieView__panel-title"><IoStatsChartOutline /><div><h2>Statuts d’appel</h2><p>Répartition exhaustive sur la période sélectionnée.</p></div></div>
                  <div className="vigieView__status-list">
                    {snapshot.statuts_appels.map((status) => (
                      <div key={status.statut}><span>{status.statut.replace(/_/g, ' ')}</span><strong>{formatNumber(status.total)}</strong><small>{formatPercent(status.taux ?? null)}</small></div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

export default WithAuth(VigieView);
