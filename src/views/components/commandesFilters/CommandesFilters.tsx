import type { ReactElement } from 'react';
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

import type { CommandesListState, CommandesSelectOption } from '../../../hooks/index.ts';
import { COMMANDES_PERIOD_OPTIONS, COMMANDES_VIEW_OPTIONS } from '../../../utils/scripts/index.ts';
import type { CommandesPeriodPreset, CommandesViewMode } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import type { StatutRendezVous, StatutVente } from '../../../utils/types/index.ts';

interface CommandesFiltersProps {
  state: CommandesListState;
}

const commandesSelectStyles = reactSelectStyles as StylesConfig<
  CommandesSelectOption,
  false,
  GroupBase<CommandesSelectOption>
>;

export function CommandesFilters({ state }: CommandesFiltersProps): ReactElement {
  return (
    <div className="commandesList__filters">
      {!state.isLeadCampaign && <div className="commandesList__filter-group"><label>Vue</label><Select<CommandesSelectOption, false>
        options={[...COMMANDES_VIEW_OPTIONS]}
        value={COMMANDES_VIEW_OPTIONS.find(({ value }) => value === state.vueMode) ?? COMMANDES_VIEW_OPTIONS[0]}
        onChange={(option) => { if (option) state.handleVueModeChange(option.value as CommandesViewMode); }}
        styles={commandesSelectStyles} isSearchable={false}
      /></div>}

      {!state.isCorbeille && <div className="commandesList__filter-group"><label>Statut</label><Select<CommandesSelectOption, false>
        options={state.isLeadCampaign ? state.statutLeadOptions : state.statutVenteOptions}
        value={state.isLeadCampaign ? state.statutLeadOptions.find(({ value }) => value === state.localLeadStatut) ?? state.statutLeadOptions[0] : state.statutVenteOptions.find(({ value }) => value === state.localStatut) ?? state.statutVenteOptions[0]}
        onChange={(option) => { const value = option?.value ?? ''; if (state.isLeadCampaign) state.setLocalLeadStatut(value as StatutRendezVous | ''); else state.setLocalStatut(value as StatutVente | ''); }}
        styles={commandesSelectStyles} placeholder="Tous les statuts" isSearchable={false}
      /></div>}

      <div className="commandesList__filter-group"><label>Commercial</label><Select<CommandesSelectOption, false>
        options={state.agentOptions} value={state.agentOptions.find(({ value }) => value === String(state.localAgentId ?? '')) ?? state.agentOptions[0]}
        onChange={(option) => state.setLocalAgentId(option?.value ? Number(option.value) : null)} styles={commandesSelectStyles} placeholder="Tous les commerciaux" isSearchable={false}
      /></div>
      <div className="commandesList__filter-group"><label>Période</label><Select<CommandesSelectOption, false>
        options={COMMANDES_PERIOD_OPTIONS} value={COMMANDES_PERIOD_OPTIONS.find(({ value }) => value === state.periodPreset)}
        onChange={(option) => state.handlePeriodPresetChange((option?.value as CommandesPeriodPreset) ?? 'current_month')} styles={commandesSelectStyles} isSearchable={false}
      /></div>
      <div className="commandesList__filter-group"><label>Du</label><input type="date" value={state.localDateDebut} onChange={(event) => { state.setPeriodPreset('custom'); state.setLocalDateDebut(event.target.value); }} /></div>
      <div className="commandesList__filter-group"><label>Au</label><input type="date" value={state.localDateFin} onChange={(event) => { state.setPeriodPreset('custom'); state.setLocalDateFin(event.target.value); }} /></div>
      <div className="commandesList__filter-group"><label>Campagne</label><Select<CommandesSelectOption, false>
        options={state.campagneOptions} value={state.campagneOptions.find(({ value }) => value === String(state.filters.campagne)) ?? null}
        onChange={(option) => state.handleCampagneChange(option ? Number(option.value) : null)} styles={commandesSelectStyles} placeholder="Campagne..." isClearable
      /></div>
    </div>
  );
}
