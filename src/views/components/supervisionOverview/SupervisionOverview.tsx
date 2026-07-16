import type { ReactElement } from 'react';

import type { SupervisionViewModel } from '../../../hooks/index.ts';

interface SupervisionOverviewProps {
  viewModel: SupervisionViewModel;
}

export function SupervisionOverview({ viewModel }: SupervisionOverviewProps): ReactElement {
  const {
    agentRows,
    availableAgentCount,
    callRows,
    dialerSummary,
    originSummary,
    queueItems,
    queueSummary,
    runtimeSummary,
    visibleAgentCount,
  } = viewModel;

  return (
    <>
      <div className="supervisionView__summary" role="status" aria-label="Résumé supervision">
        <div
          className={`summary-card ${queueSummary.summaryClassName}`}
          role="status"
          aria-label={`${queueSummary.remaining.toLocaleString('fr-FR')} prospects restants`}
        >
          <span className="summary-card__value">{queueSummary.remaining.toLocaleString('fr-FR')}</span>
          <span className="summary-card__label">Prospects restants</span>
        </div>
        <div className="summary-card summary-card--info" role="status" aria-label={`${availableAgentCount} agents disponibles`}>
          <span className="summary-card__value">{availableAgentCount}</span>
          <span className="summary-card__label">Agents disponibles</span>
        </div>
        <div className="summary-card summary-card--call" role="status" aria-label={`${callRows.length} appels en cours`}>
          <span className="summary-card__value">{callRows.length}</span>
          <span className="summary-card__label">Appels en cours</span>
          {originSummary.length > 0 && (
            <div className="summary-card__origins">
              {originSummary.map((origin) => (
                <span
                  key={origin.key}
                  className="origin-badge origin-badge--sm"
                  style={{ backgroundColor: origin.color }}
                >
                  {origin.count} {origin.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="summary-card" role="status" aria-label={`${visibleAgentCount} agents affectés`}>
          <span className="summary-card__value">{visibleAgentCount}</span>
          <span className="summary-card__label">Agents affectés</span>
        </div>
      </div>

      <section>
        <div className="supervisionView__section-header"><h3>État de la file</h3></div>
        <div className="supervisionView__queue">
          <div className="supervisionView__queue__total">
            <div className={`supervisionView__queue__remaining ${queueSummary.stockLevel === 'normal' ? '' : queueSummary.stockLevel}`}>
              <span className="count">{queueSummary.remaining.toLocaleString('fr-FR')}</span>
              <span className="label">restants</span>
            </div>
            <span className="separator">/</span>
            <span className="total">{queueSummary.total.toLocaleString('fr-FR')} total</span>
            {queueSummary.stockLevel === 'danger' && <span className="alert-badge danger">Stock critique</span>}
            {queueSummary.stockLevel === 'warning' && <span className="alert-badge warning">Stock bas</span>}
          </div>
          <div className="supervisionView__queue__cards">
            {queueItems.map((item) => (
              <div key={item.key} className="queue-card" style={{ borderLeftColor: item.color }}>
                <span className="queue-card__count">{item.count.toLocaleString('fr-FR')}</span>
                <span className="queue-card__label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="supervisionView__section-header"><h3>Agents affectés ({visibleAgentCount})</h3></div>
        <div className="supervisionView__agents">
          <div className="supervisionView__agents__summary">
            {dialerSummary.map((item) => (
              <span key={item.key} className="stat-badge" style={{ backgroundColor: item.color }}>
                {item.count} {item.label}
              </span>
            ))}
            {runtimeSummary.mismatchCount > 0 && (
              <span className="stat-badge stat-badge--alert">{runtimeSummary.mismatchCount} runtime incohérent</span>
            )}
            {runtimeSummary.missingCount > 0 && (
              <span className="stat-badge stat-badge--warning">{runtimeSummary.missingCount} sans runtime</span>
            )}
          </div>
          <div className="supervisionView__agents__list">
            {agentRows.map((agent) => (
              <div key={agent.id} className="agent-row">
                <span className="agent-dot" style={{ backgroundColor: agent.statusColor }} />
                <span className="agent-name">{agent.name}</span>
                <span className="agent-statut">{agent.statusLabel}</span>
                {agent.sinceLabel && <span className="agent-since">{agent.sinceLabel}</span>}
                {agent.pauseReason && <span className="agent-pause">({agent.pauseReason})</span>}
                {agent.runtimeCampaign && <span className="agent-runtime-badge">Runtime: {agent.runtimeCampaign}</span>}
                {agent.hasMissingRuntime && <span className="agent-runtime-warning">Runtime manquant</span>}
                {agent.hasRuntimeMismatch && <span className="agent-runtime-alert">Runtime incohérent</span>}
              </div>
            ))}
            {agentRows.length === 0 && <p className="empty">Aucun agent affecté</p>}
          </div>
        </div>
      </section>
    </>
  );
}
