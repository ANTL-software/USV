import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useSupervision } from '../../hooks/useSupervision';
import { useCampagnes } from '../../hooks/useCampagnes';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import reactSelectStyles from '../../utils/styles/reactSelectStyles';
import type { QueueCount, AgentState, CallInProgress } from '../../utils/types/queue.types';
import type { Campagne } from '../../utils/types/campagne.types';
import { formatCallDuration, formatSince } from '../../utils/scripts/formatters';
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
  appel_sortant: '#6366f1',
  pause_apres_appel: '#f1c40f',
  pause: '#e67e22',
  hors_ligne: '#95a5a6'
};

const DIALER_STATUT_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  en_appel: 'En appel',
  appel_sortant: 'Appel sortant',
  pause_apres_appel: 'Pause après appel',
  pause: 'En pause',
  hors_ligne: 'Hors ligne',
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

const CallsTable = ({ calls }: { calls: CallInProgress[] }) => (
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
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          {calls.map(c => (
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
              <td className="calls-duration">{formatCallDuration(c.duree_secondes)}</td>
            </tr>
          ))}
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

const SupervisionView = () => {
  const navigate = useNavigate();
  const [selectedCampagne, setSelectedCampagne] = useState<number | null>(null);
  const { queueState, isLoading, error } = useSupervision(selectedCampagne);

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

  const counts = queueState?.queueCounts || [];
  const agents = queueState?.agents || [];
  const calls = queueState?.callsInProgress || [];

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
              {isLoading && !queueState && <Loader size="medium" message="Chargement de la supervision..." />}

              {error && <div className="supervisionView__error">{error}</div>}

              {queueState && (
                <div className="supervisionView__content">
                  <SummaryCards counts={counts} agents={visibleAgents} calls={calls} />

                  <section>
                    <h3>État de la file</h3>
                    <QueueCards counts={counts} />
                  </section>

                  <section>
                    <h3>Agents affectés ({visibleAgents.length})</h3>
                    <AgentList agents={visibleAgents} now={now} />
                  </section>

                  <section>
                    <h3>Appels en cours ({calls.length})</h3>
                    <CallsTable calls={calls} />
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
};

const SupervisionViewWithAuth = WithAuth(SupervisionView);
export default SupervisionViewWithAuth;
