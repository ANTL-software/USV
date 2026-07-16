import type { FormEvent, ReactElement } from 'react';
import { MdSearch } from 'react-icons/md';
import Select from 'react-select';
import type { GroupBase, SingleValue, StylesConfig } from 'react-select';
import type { QualiteEcoutesPageViewModel } from '../../../hooks/index.ts';
import { RECORDING_STATUS_OPTIONS } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import type { RecordingFilterOption } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

const selectStyles = reactSelectStyles as unknown as StylesConfig<RecordingFilterOption, false, GroupBase<RecordingFilterOption>>;

interface QualiteEcoutesFiltersProps { viewModel: QualiteEcoutesPageViewModel }

export function QualiteEcoutesFilters({ viewModel }: QualiteEcoutesFiltersProps): ReactElement {
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    viewModel.submitSearch();
  };

  return (
    <div className="qualiteEcoutes__filters-card">
      <form onSubmit={submit} className="qualiteEcoutes__filters-form">
        <div className="qualiteEcoutes__filters-row">
          <div className="qualiteEcoutes__filter-col">
            <label htmlFor="recording-search">Recherche globale</label>
            <div className="qualiteEcoutes__search-input-wrapper">
              <input id="recording-search" type="text" placeholder="Nom, entreprise, téléphone, ID prospect..." value={viewModel.recherche} onChange={(event) => viewModel.setRecherche(event.target.value)} />
              <button type="submit" aria-label="Rechercher"><MdSearch /></button>
            </div>
          </div>
          <div className="qualiteEcoutes__filter-col">
            <label htmlFor="recording-agent">Agent</label>
            <Select<RecordingFilterOption> inputId="recording-agent" options={viewModel.agents} value={viewModel.selectedAgent} onChange={(option: SingleValue<RecordingFilterOption>) => viewModel.selectAgent(option)} styles={selectStyles} placeholder="Tous les agents" isClearable />
          </div>
          <div className="qualiteEcoutes__filter-col">
            <label htmlFor="recording-campaign">Campagne</label>
            <Select<RecordingFilterOption> inputId="recording-campaign" options={viewModel.campaigns} value={viewModel.selectedCampaign} onChange={(option: SingleValue<RecordingFilterOption>) => viewModel.selectCampaign(option)} styles={selectStyles} placeholder="Toutes les campagnes" isClearable />
          </div>
          <div className="qualiteEcoutes__filter-col">
            <label htmlFor="recording-status">Statut</label>
            <Select<RecordingFilterOption> inputId="recording-status" options={RECORDING_STATUS_OPTIONS} value={viewModel.selectedStatus} onChange={(option: SingleValue<RecordingFilterOption>) => viewModel.selectStatus(option)} styles={selectStyles} placeholder="Tous les statuts" isClearable />
          </div>
        </div>
        <div className="qualiteEcoutes__filters-row">
          <label className="qualiteEcoutes__filter-col"><span>Date de début</span><input type="date" value={viewModel.dateDebut} onChange={(event) => viewModel.changeDateDebut(event.target.value)} /></label>
          <label className="qualiteEcoutes__filter-col"><span>Date de fin</span><input type="date" value={viewModel.dateFin} onChange={(event) => viewModel.changeDateFin(event.target.value)} /></label>
          <label className="qualiteEcoutes__filter-col"><span>Téléphone</span><input type="tel" placeholder="Ex: 04..., 06..., +334..." value={viewModel.telephone} onChange={(event) => viewModel.changeTelephone(event.target.value)} /></label>
          <div className="qualiteEcoutes__filter-col qualiteEcoutes__filter-col--buttons">
            <Button type="button" style="grey" onClick={viewModel.resetFilters}>Réinitialiser</Button>
            <Button type="submit" style="green">Filtrer</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
