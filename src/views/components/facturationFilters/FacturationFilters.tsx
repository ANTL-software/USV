import type { ReactElement } from 'react';
import { MdOutlineTune } from 'react-icons/md';

import type { FacturationState } from '../../../hooks/index.ts';
import { campaignBillingDisplayName, FACTURATION_PERIOD_OPTIONS } from '../../../utils/scripts/index.ts';
import type { FacturationPeriodPreset } from '../../../utils/types/index.ts';

interface FacturationFiltersProps {
  state: FacturationState;
}

export function FacturationFilters({ state }: FacturationFiltersProps): ReactElement {
  return (
    <section className="facturationView__panel facturationView__filters">
      <div className="facturationView__panel-header"><MdOutlineTune /><div><h2>Paramètres de génération</h2><p>Choisis la campagne et la période à facturer.</p></div></div>
      <div className="facturationView__filters-grid">
        <label className="facturationView__field">
          <span>Campagne</span>
          <select value={state.selectedCampagneId ?? ''} onChange={(event) => state.setRequestedCampagneId(Number(event.target.value))}>
            {state.activeCampagnes.map((campagne) => <option key={campagne.id_campagne} value={campagne.id_campagne}>{campaignBillingDisplayName(campagne)}</option>)}
          </select>
        </label>
        <label className="facturationView__field">
          <span>Période</span>
          <select value={state.periodPreset} onChange={(event) => state.setPeriodPreset(event.target.value as FacturationPeriodPreset)}>
            {FACTURATION_PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="facturationView__field"><span>Date de début</span><input type="date" value={state.resolvedPeriod.start} onChange={(event) => state.setDateStart(event.target.value)} /></label>
        <label className="facturationView__field"><span>Date de fin</span><input type="date" value={state.resolvedPeriod.end} onChange={(event) => state.setDateEnd(event.target.value)} /></label>
      </div>
    </section>
  );
}
