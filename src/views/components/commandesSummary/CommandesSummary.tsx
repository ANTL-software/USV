import type { ReactElement } from 'react';

import type { CommandesListState } from '../../../hooks/index.ts';

interface CommandesSummaryProps {
  state: CommandesListState;
}

export function CommandesSummary({ state }: CommandesSummaryProps): ReactElement | null {
  const cards = state.isLeadCampaign
    ? state.leadStats.total > 0 ? state.leadSummaryCards : []
    : state.totalVentesCount > 0 && !state.isCorbeille ? state.saleSummaryCards : [];

  if (cards.length === 0) {
    return !state.isLeadCampaign && state.ventes.length > 0 && state.isCorbeille
      ? <div className="commandesList__corbeille-info"><span>{state.ventes.length} commande{state.ventes.length > 1 ? 's' : ''} supprimée{state.ventes.length > 1 ? 's' : ''} (soft delete)</span></div>
      : null;
  }
  return <div className="commandesList__summary">{cards.map((card) => <div key={card.label} className={`summary-card summary-card--${card.tone}`}><span className={`summary-card__value ${card.meta ? 'summary-card__value--split' : ''}`}><span>{card.value}</span>{card.meta && <span className="summary-card__meta">{card.meta}</span>}</span><span className="summary-card__label">{card.label}</span></div>)}</div>;
}
