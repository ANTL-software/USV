import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useSupervision } from '../../../hooks/useSupervision';
import { useCampagnes } from '../../../hooks/useCampagnes';
import { useGraphiques } from '../../../hooks/useGraphiques';
import { useWhisper } from '../../../hooks/useWhisper';
import WhisperPanel from '../../components/whisperPanel/WhisperPanel';
import { getRequest } from '../../../API/APICalls';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import AppelsParHeureChart from '../../../components/appelsParHeureChart/AppelsParHeureChart';
import TauxAboutiChart from '../../../components/tauxAboutiChart/TauxAboutiChart';
import DureeMoyenneChart from '../../../components/dureeMoyenneChart/DureeMoyenneChart';
import TopRaisonsChart from '../../../components/topRaisonsChart/TopRaisonsChart';
import StatutsAppelsChart from '../../../components/statutsAppelsChart/StatutsAppelsChart';
import StatutsParHeureChart from '../../../components/statutsParHeureChart/StatutsParHeureChart';
import AppelsParOrigineChart from '../../../components/appelsParOrigineChart/AppelsParOrigineChart';
import FilterPanel, { DateFilters } from '../../../components/filterPanel/FilterPanel';
import ExportButton from '../../../components/exportButton/ExportButton';
import PrintButton from '../../../components/printButton/PrintButton';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import type { QueueCount, AgentState, CallInProgress } from '../../../utils/types/queue.types';
import type { Campagne } from '../../../utils/types/campagne.types';
import type { AmdStats } from '../../../utils/types/graphiques.types';
import { formatCallDuration, formatSince } from '../../../utils/scripts/formatters';
import './supervisionView.scss';

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  assigne: 'Assigné',
  en_cours: 'En cours',
  traite: 'Traité',
  rappeler: 'À rappeler',
  refuse: 'Refusé / Max tentatives'
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: '#3498db',
  assigne: '#9b59b6',
  en_cours: '#2ecc71',
  traite: '#95a5a6',
  rappeler: '#f39c12',
  refuse: '#e74c3c'
};

const DIALER_STATUT_COLORS: Record<string, string> = {
  disponible: '#27ae60',
  en_appel: '#3498db',
  qualification_en_cours: '#7c3aed',
  svi_a_naviguer: '#f97316',
  appel_sortant: '#6366f1',
  pause_apres_appel: '#f1c40f',
  pause: '#e67e22',
  hors_ligne: '#95a5a6'
};

const DIALER_STATUT_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  en_appel: 'En appel',
  qualification_en_cours: 'Qualification en cours',
  svi_a_naviguer: 'SVI à naviguer',
  appel_sortant: 'Appel sortant',
  pause_apres_appel: 'Pause après appel',
  pause: 'En pause',
  hors_ligne: 'Hors ligne',
};

const CALL_CLASSIFICATION_LABELS: Record<string, string> = {
  qualification_en_cours: 'Qualification en cours',
  humain_detecte: 'Humain',
  svi_detecte: 'SVI',
  automate_filtre: 'Automate filtré',
  messagerie_detectee: 'Messagerie',
  fax_detecte: 'Fax',
  unknown_a_traiter: 'Unknown',
};

const CALL_CLASSIFICATION_COLORS: Record<string, string> = {
  qualification_en_cours: '#7c3aed',
  humain_detecte: '#27ae60',
  svi_detecte: '#f97316',
  automate_filtre: '#ea580c',
  messagerie_detectee: '#6b7280',
  fax_detecte: '#334155',
  unknown_a_traiter: '#0ea5e9',
};

const ORIGINE_LABELS: Record<string, string> = {
  auto: 'File',
  manuel: 'Manuel',
  rappel: 'Rappel',
};

const ORIGINE_COLORS: Record<string, string> = {
  auto: '#3498db',
  manuel: '#6366f1',
  rappel: '#f39c12',
};

const formatBridgeLabel = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    return 'Pas encore';
  }

  const date = new Date(isoDate);
  return `${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })} (${formatSince(isoDate)})`;
};

const QueueCards = ({ counts }: { counts: QueueCount[] }) => {
  const total = counts.reduce((acc, c) => acc + c.count, 0);
  const remaining = counts
    .filter(c => c.statut === 'en_attente' || c.statut === 'rappeler')
    .reduce((acc, c) => acc + c.count, 0);

  const lowStock = remaining < 500;
  const warningStock = remaining >= 500 && remaining < 1000;

  return (
    <div className="supervisionView__queue">
      <div className="supervisionView__queue__total">
        <div className={`supervisionView__queue__remaining ${lowStock ? 'danger' : warningStock ? 'warning' : ''}`}>
          <span className="count">{remaining.toLocaleString('fr-FR')}</span>
          <span className="label">restants</span>
        </div>
        <span className="separator">/</span>
        <span className="total">{total.toLocaleString('fr-FR')} total</span>
        {lowStock && <span className="alert-badge danger">Stock critique</span>}
        {warningStock && <span className="alert-badge warning">Stock bas</span>}
      </div>
      <div className="supervisionView__queue__cards">
        {counts.map(c => (
          <div key={c.statut} className="queue-card" style={{ borderLeftColor: STATUT_COLORS[c.statut] }}>
            <span className="queue-card__count">{c.count.toLocaleString('fr-FR')}</span>
            <span className="queue-card__label">{STATUT_LABELS[c.statut] || c.statut}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AgentList = ({ agents, now }: { agents: AgentState[]; now: number }) => {
  const summary = agents.reduce((acc, a) => {
    const s = a.statut_dialer || 'hors_ligne';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="supervisionView__agents">
      <div className="supervisionView__agents__summary">
        {Object.entries(summary).map(([statut, count]) => (
          <span key={statut} className="stat-badge" style={{ backgroundColor: DIALER_STATUT_COLORS[statut] }}>
            {count} {DIALER_STATUT_LABELS[statut] || statut}
          </span>
        ))}
      </div>
      <div className="supervisionView__agents__list">
        {agents.map(a => {
          const sinceSeconds = a.debut_statut
            ? Math.floor((now - new Date(a.debut_statut).getTime()) / 1000)
            : 0;
          return (
            <div key={a.id_employe} className="agent-row">
              <span className="agent-dot" style={{ backgroundColor: DIALER_STATUT_COLORS[a.statut_dialer || 'hors_ligne'] }} />
              <span className="agent-name">{a.nom} {a.prenom}</span>
              <span className="agent-statut">{DIALER_STATUT_LABELS[a.statut_dialer || 'hors_ligne'] || 'Hors ligne'}</span>
              {a.debut_statut && sinceSeconds > 0 && (
                <span className="agent-since">depuis {formatSince(a.debut_statut)}</span>
              )}
              {a.raison_pause && <span className="agent-pause">({a.raison_pause})</span>}
            </div>
          );
        })}
        {agents.length === 0 && <p className="empty">Aucun agent affecté</p>}
      </div>
    </div>
  );
};

const CallsTable = ({ 
  calls,
  onWhisper,
  activeAppelId,
  isAnyWhisperActive
}: { 
  calls: CallInProgress[]; 
  onWhisper: (call: CallInProgress) => void;
  activeAppelId: number | null;
  isAnyWhisperActive: boolean;
}) => (
  <div className="supervisionView__calls">
    {calls.length === 0 ? (
      <p className="empty">Aucun appel en cours</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Prospect</th>
            <th>Téléphone</th>
            <th>Origine</th>
            <th>Qualification</th>
            <th>Fin système</th>
            <th>Bridge agent</th>
            <th>Durée</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {calls.map(c => {
            const isCurrentWhisper = activeAppelId === c.id_appel;
            return (
              <tr key={c.id_appel}>
                <td>{c.agent_nom} {c.agent_prenom}</td>
                <td>{c.prospect_nom} {c.prospect_prenom}</td>
                <td>{c.telephone}</td>
                <td>
                  <span
                    className="origin-badge"
                    style={{ backgroundColor: ORIGINE_COLORS[c.origine_appel] || '#95a5a6' }}
                  >
                    {ORIGINE_LABELS[c.origine_appel] || c.origine_appel}
                  </span>
                </td>
                <td>
                  <span
                    className="origin-badge"
                    style={{ backgroundColor: CALL_CLASSIFICATION_COLORS[c.call_classification || 'qualification_en_cours'] || '#95a5a6' }}
                  >
                    {CALL_CLASSIFICATION_LABELS[c.call_classification || 'qualification_en_cours'] || c.call_classification || 'Qualification'}
                  </span>
                </td>
                <td>
                  {c.ended_by_system ? (
                    <span className="system-end-badge">
                      {c.end_reason || 'Auto'}
                    </span>
                  ) : (
                    'Non'
                  )}
                </td>
                <td className="calls-duration">
                  {formatBridgeLabel(c.bridged_to_agent_at)}
                </td>
                <td className="calls-duration">{formatCallDuration(c.duree_secondes)}</td>
                <td>
                  {!c.twilio_call_sid ? (
                    <span className="no-whisper-badge" title="Identifiant d'appel Twilio non disponible">Non connectable</span>
                  ) : !c.prospect_call_sid ? (
                    <button
                      className="whisper-btn pending"
                      disabled={true}
                      title="En attente que le prospect décroche"
                    >
                      ⏳ En attente décroché
                    </button>
                  ) : (
                    <button
                      className={`whisper-btn ${isCurrentWhisper ? 'active' : ''}`}
                      onClick={() => onWhisper(c)}
                      disabled={isAnyWhisperActive && !isCurrentWhisper}
                    >
                      {isCurrentWhisper ? '🎧 En coaching' : '🎙️ Souffler'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);

const SummaryCards = ({ counts, agents, calls }: {
  counts: QueueCount[];
  agents: AgentState[];
  calls: CallInProgress[];
}) => {
  const remaining = counts
    .filter(c => c.statut === 'en_attente' || c.statut === 'rappeler')
    .reduce((acc, c) => acc + c.count, 0);

  const dispoCount = agents.filter(a => a.statut_dialer === 'disponible').length;
  const inCallCount = calls.length;

  const remainingClass = remaining < 500 ? 'summary-card--danger'
    : remaining < 1000 ? 'summary-card--warning'
    : '';

  return (
    <div className="supervisionView__summary" role="status" aria-label="Résumé supervision">
      <div className={`summary-card ${remainingClass}`} role="status" aria-label={`${remaining.toLocaleString('fr-FR')} prospects restants`}>
        <span className="summary-card__value">{remaining.toLocaleString('fr-FR')}</span>
        <span className="summary-card__label">Prospects restants</span>
      </div>
      <div className="summary-card summary-card--info" role="status" aria-label={`${dispoCount} agents disponibles`}>
        <span className="summary-card__value">{dispoCount}</span>
        <span className="summary-card__label">Agents disponibles</span>
      </div>
      <div className="summary-card summary-card--call" role="status" aria-label={`${inCallCount} appels en cours`}>
        <span className="summary-card__value">{inCallCount}</span>
        <span className="summary-card__label">Appels en cours</span>
        {inCallCount > 0 && (
          <div className="summary-card__origins">
            {Object.entries(
              calls.reduce((acc, c) => {
                const o = c.origine_appel || 'auto';
                acc[o] = (acc[o] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([origin, count]) => (
              <span key={origin} className="origin-badge origin-badge--sm" style={{ backgroundColor: ORIGINE_COLORS[origin] || '#95a5a6' }}>
                {count} {ORIGINE_LABELS[origin] || origin}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="summary-card" role="status" aria-label={`${agents.length} agents affectés`}>
        <span className="summary-card__value">{agents.length}</span>
        <span className="summary-card__label">Agents affectés</span>
      </div>
    </div>
  );
};

const AmdKpiCards = ({ stats }: { stats: AmdStats }) => {
  const denominator = stats.qualifiedCalls || stats.totalCalls || 1;
  const formatRate = (count: number) => `${Math.round((count / denominator) * 100)}%`;

  return (
    <div className="supervisionView__amd-kpis" role="status" aria-label="KPI qualification d'appel">
      <div className="amd-kpi-card amd-kpi-card--human">
        <span className="amd-kpi-card__value">{stats.humanCount}</span>
        <span className="amd-kpi-card__label">Humains</span>
        <span className="amd-kpi-card__meta">{formatRate(stats.humanCount)}</span>
      </div>
      <div className="amd-kpi-card amd-kpi-card--svi">
        <span className="amd-kpi-card__value">{stats.sviCount}</span>
        <span className="amd-kpi-card__label">SVI</span>
        <span className="amd-kpi-card__meta">{formatRate(stats.sviCount)}</span>
      </div>
      <div className="amd-kpi-card amd-kpi-card--messaging">
        <span className="amd-kpi-card__value">{stats.filteredMachineStartCount}</span>
        <span className="amd-kpi-card__label">Automates filtrés</span>
        <span className="amd-kpi-card__meta">{formatRate(stats.filteredMachineStartCount)}</span>
      </div>
      <div className="amd-kpi-card amd-kpi-card--messaging">
        <span className="amd-kpi-card__value">{stats.messagingCount + stats.faxCount}</span>
        <span className="amd-kpi-card__label">Messagerie / Fax</span>
        <span className="amd-kpi-card__meta">{formatRate(stats.messagingCount + stats.faxCount)}</span>
      </div>
      <div className="amd-kpi-card amd-kpi-card--unknown">
        <span className="amd-kpi-card__value">{stats.unknownCount}</span>
        <span className="amd-kpi-card__label">Unknown</span>
        <span className="amd-kpi-card__meta">{formatRate(stats.unknownCount)}</span>
      </div>
      <div className="amd-kpi-card">
        <span className="amd-kpi-card__value">{formatCallDuration(stats.avgBridgeDelaySeconds || 0)}</span>
        <span className="amd-kpi-card__label">Délai moyen avant humain</span>
        <span className="amd-kpi-card__meta">{stats.bridgeCount} bridge(s)</span>
      </div>
      <div className="amd-kpi-card">
        <span className="amd-kpi-card__value">{formatCallDuration(stats.avgSviDurationSeconds || 0)}</span>
        <span className="amd-kpi-card__label">Durée moyenne appels SVI</span>
        <span className="amd-kpi-card__meta">{stats.sviDurationSampleCount} appel(s) SVI</span>
      </div>
      <div className="amd-kpi-card">
        <span className="amd-kpi-card__value">{stats.pendingCount}</span>
        <span className="amd-kpi-card__label">Qualification en cours</span>
        <span className="amd-kpi-card__meta">Dans la période</span>
      </div>
      <div className="amd-kpi-card">
        <span className="amd-kpi-card__value">{stats.systemEndedCount}</span>
        <span className="amd-kpi-card__label">Coupures système</span>
        <span className="amd-kpi-card__meta">Dans la période</span>
      </div>
    </div>
  );
};

const SupervisionView = () => {
  const navigate = useNavigate();
  const [selectedCampagne, setSelectedCampagne] = useState<number | null>(null);
  const [selectedEmploye, setSelectedEmploye] = useState<number | null>(null);
  const [showGraphiques, setShowGraphiques] = useState<boolean>(true);
  const [dateFilters, setDateFilters] = useState<DateFilters>({ dateDebut: null, dateFin: null });
  const [agentsList, setAgentsList] = useState<Array<{id_employe: number, nom: string, prenom: string, identifiant: string}>>([]);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const { queueState, isLoading, error } = useSupervision(selectedCampagne);
  
  // Custom hook pour le soufflé superviseur
  const {
    startWhisper,
    disconnectWhisper,
    toggleMute,
    isConnecting,
    isConnected,
    isMuted,
    duration,
    agentName,
    activeAppelId,
    error: whisperError,
    clearError
  } = useWhisper();
  
  // Utiliser useGraphiques seulement quand une campagne est sélectionnée et aucun employé
  // Pas besoin de condition complexe : si selectedCampagne existe, on passe les paramètres
  const { stats: graphiquesStats, isLoading: graphiquesLoading } = useGraphiques(
    selectedCampagne && !selectedEmploye ? selectedCampagne : undefined,
    selectedCampagne && !selectedEmploye ? dateFilters.dateDebut || undefined : undefined,
    selectedCampagne && !selectedEmploye ? dateFilters.dateFin || undefined : undefined,
    selectedCampagne && !selectedEmploye ? 60000 : 0
  );
  
  const [employeStats, setEmployeStats] = useState<any>(null);
  const [employeStatsLoading, setEmployeStatsLoading] = useState<boolean>(false);

  // Tick chaque seconde pour animer les chronomètres (durées statuts, etc.)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Charger les campagnes actives
  const { campagnes } = useCampagnes();
  const activeCampagnes = campagnes?.filter((c: Campagne) => c.statut === 'active') || [];
  const campagneOptions = activeCampagnes.map((c: Campagne) => ({
    value: String(c.id_campagne),
    label: c.nom_campagne
  }));

  // Charger les agents de la campagne sélectionnée
  useEffect(() => {
    if (!selectedCampagne) {
      setAgentsList([]);
      setSelectedEmploye(null);
      return;
    }

    const fetchAgents = async () => {
      try {
        setAgentsLoading(true);
        const response = await getRequest(`/supervision/campagne/${selectedCampagne}/agents`);
        setAgentsList(response.data.data || []);
      } catch (err) {
        console.error('[SupervisionView] Erreur chargement agents:', err);
        setAgentsList([]);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, [selectedCampagne]);

  // Charger les stats par employé si un employé est sélectionné
  useEffect(() => {
    if (!selectedEmploye || !selectedCampagne) {
      setEmployeStats(null);
      return;
    }

    const fetchEmployeStats = async () => {
      try {
        setEmployeStatsLoading(true);
        const params: Record<string, string> = {
          id_campagne: String(selectedCampagne),
          id_employe: String(selectedEmploye)
        };
        if (dateFilters.dateDebut) params.date_debut = dateFilters.dateDebut;
        if (dateFilters.dateFin) params.date_fin = dateFilters.dateFin;

        const response = await getRequest('/supervision/graphiques/employe', params);
        setEmployeStats(response.data.data);
      } catch (err) {
        console.error('[SupervisionView] Erreur chargement stats employé:', err);
        setEmployeStats(null);
      } finally {
        setEmployeStatsLoading(false);
      }
    };

    fetchEmployeStats();
  }, [selectedEmploye, selectedCampagne, dateFilters.dateDebut, dateFilters.dateFin]);

  const counts = queueState?.queueCounts || [];
  const agents = queueState?.agents || [];
  const calls = queueState?.callsInProgress || [];

  // Options pour le select des employés
  const employeOptions = [
    { value: 'all', label: 'Tous les agents' },
    ...agentsList.map(a => ({
      value: String(a.id_employe),
      label: `${a.nom} ${a.prenom} (${a.identifiant})`
    }))
  ];

  // Stats à afficher (soit globales, soit par employé)
  const displayStats = selectedEmploye ? employeStats : graphiquesStats;

  // Agents en appel = ceux présents dans callsInProgress → ne pas afficher dans "Agents affectés"
  const inCallAgentIds = new Set(calls.map(c => c.id_agent));
  const visibleAgents = agents.filter(a => !inCallAgentIds.has(a.id_employe));

  return (
    <div id="supervisionView">
      <Header />
      <SubNav />
      <main>
        <div className="supervisionView__container">
          <div className="supervisionView__header">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Supervision des campagnes</h2>
          </div>

          <div className="supervisionView__selector">
            <label>Sélectionner une campagne active</label>
            <Select
              options={campagneOptions}
              value={campagneOptions.find((o: { value: string }) => o.value === String(selectedCampagne)) || null}
              onChange={(option) => setSelectedCampagne(option ? Number((option as { value: string }).value) : null)}
              styles={reactSelectStyles}
              placeholder="Choisir une campagne..."
              isClearable
            />
          </div>

          {selectedCampagne && (
            <>
              {isLoading && !queueState && <Loader message="Chargement de la supervision..." />}

              {error && <div className="supervisionView__error">{error}</div>}

              {queueState && (
                <div className="supervisionView__content">
                  <SummaryCards counts={counts} agents={visibleAgents} calls={calls} />

                  <section>
                    <div className="supervisionView__section-header">
                      <h3>État de la file</h3>
                    </div>
                    <QueueCards counts={counts} />
                  </section>

                  <section>
                    <div className="supervisionView__section-header">
                      <h3>Agents affectés ({visibleAgents.length})</h3>
                    </div>
                    <AgentList agents={visibleAgents} now={now} />
                  </section>

                  <section>
                    <div className="supervisionView__section-header">
                      <h3>Appels en cours ({calls.length})</h3>
                    </div>
                    <CallsTable 
                      calls={calls} 
                      onWhisper={(c) => startWhisper(c.id_appel, `${c.agent_nom} ${c.agent_prenom}`)}
                      activeAppelId={activeAppelId}
                      isAnyWhisperActive={isConnecting || isConnected}
                    />
                  </section>

                  <section className="supervisionView__graphiques">
                    <div className="supervisionView__filters">
                      <div className="supervisionView__selector supervisionView__selector--inline">
                        <label>Filtrer par agent (optionnel)</label>
                        <Select
                          options={employeOptions}
                          value={selectedEmploye ? employeOptions.find((o: { value: string }) => o.value === String(selectedEmploye)) : employeOptions[0]}
                          onChange={(option) => {
                            if (option && (option as { value: string }).value === 'all') {
                              setSelectedEmploye(null);
                            } else {
                              setSelectedEmploye(option ? Number((option as { value: string }).value) : null);
                            }
                          }}
                          styles={reactSelectStyles}
                          placeholder={agentsLoading ? "Chargement..." : "Choisir un agent..."}
                          isClearable
                          isDisabled={agentsLoading}
                        />
                      </div>

                      <div className="supervisionView__filter-dates">
                        <FilterPanel
                          filters={dateFilters}
                          onFiltersChange={setDateFilters}
                        />
                      </div>
                    </div>
                    <div className="supervisionView__section-header supervisionView__section-header--toggle">
                      <h3>Graphiques de performance{selectedEmploye && agentsList.find(a => a.id_employe === selectedEmploye) ? ` - ${agentsList.find(a => a.id_employe === selectedEmploye)?.nom} ${agentsList.find(a => a.id_employe === selectedEmploye)?.prenom}` : ''}</h3>
                      <div className="supervisionView__header-actions">
                        <ExportButton
                          data={{
                            campagne: campagneOptions.find((o: { value: string }) => o.value === String(selectedCampagne))?.label,
                            employe: selectedEmploye ? agentsList.find(a => a.id_employe === selectedEmploye)?.nom + ' ' + agentsList.find(a => a.id_employe === selectedEmploye)?.prenom : 'Tous',
                            dateDebut: dateFilters.dateDebut || undefined,
                            dateFin: dateFilters.dateFin || undefined,
                            stats: displayStats || {
                              appelsParHeure: [],
                              tauxAbouti: { aboutis: 0, non_aboutis: 0, taux_abouti: 0 },
                              dureeMoyenne7j: [],
                              topRaisons: []
                            }
                          }}
                          disabled={!displayStats || (graphiquesLoading || employeStatsLoading)}
                        />
                        <PrintButton
                          disabled={!displayStats || (graphiquesLoading || employeStatsLoading)}
                        />
                        <button
                          className="supervisionView__toggle-btn"
                          onClick={() => setShowGraphiques(!showGraphiques)}
                          aria-expanded={showGraphiques}
                        >
                          {showGraphiques ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                    </div>

                    {showGraphiques && (
                      <>
                        {(graphiquesLoading || employeStatsLoading) && <Loader message="Chargement des graphiques..." />}

                        {!(graphiquesLoading || employeStatsLoading) && displayStats && (
                          <>
                            <div className="supervisionView__graphiques-grid">
                              <div className="supervisionView__graphique supervisionView__graphique--full">
                                <StatutsAppelsChart data={displayStats?.appelsParStatut || []} />
                              </div>

                              <div className="supervisionView__graphique supervisionView__graphique--full">
                                <AppelsParHeureChart data={displayStats?.appelsParHeure || []} />
                              </div>

                              <div className="supervisionView__graphique supervisionView__graphique--half">
                                <TauxAboutiChart data={displayStats?.tauxAbouti || { aboutis: 0, non_aboutis: 0, taux_abouti: 0 }} />
                              </div>

                              <div className="supervisionView__graphique supervisionView__graphique--half">
                                <DureeMoyenneChart data={displayStats?.dureeMoyenne7j || []} />
                              </div>

                              <div className="supervisionView__graphique supervisionView__graphique--half">
                                <AppelsParOrigineChart data={displayStats?.appelsParOrigine || []} />
                              </div>

                              <div className="supervisionView__graphique supervisionView__graphique--half">
                                <TopRaisonsChart data={displayStats?.topRaisons || []} />
                              </div>

                              <div className="supervisionView__graphique supervisionView__graphique--full">
                                <StatutsParHeureChart data={displayStats?.statutsParHeure || []} />
                              </div>
                            </div>

                            <div className="supervisionView__historical-amd">
                              <div className="supervisionView__section-header">
                                <h4>Qualification AMD / SVI sur la période</h4>
                              </div>
                              <AmdKpiCards stats={displayStats.amdStats} />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToTop />
      <WhisperPanel
        isConnected={isConnected}
        isConnecting={isConnecting}
        isMuted={isMuted}
        duration={duration}
        agentName={agentName}
        error={whisperError}
        onMuteToggle={toggleMute}
        onDisconnect={disconnectWhisper}
        onCloseError={clearError}
      />
    </div>
  );
};

const SupervisionViewWithAuth = WithAuth(SupervisionView);
export default SupervisionViewWithAuth;
