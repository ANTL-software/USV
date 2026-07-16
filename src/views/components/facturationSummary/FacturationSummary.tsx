import type { ReactElement } from 'react';

import type { FacturationState } from '../../../hooks/index.ts';

interface FacturationSummaryProps {
  state: FacturationState;
}

export function FacturationSummary({ state }: FacturationSummaryProps): ReactElement {
  return (
    <section className="facturationView__summary">
      {state.summaryCards.map((card) => (
        <article key={`${card.label}-${card.value}`} className={`facturationView__summary-card facturationView__summary-card--${card.tone}`}>
          <span>{card.label}</span><strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
