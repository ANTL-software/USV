import type { ReactElement } from 'react';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { MdRefresh, MdTune } from 'react-icons/md';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { QUALITE_PERIOD_OPTIONS } from '../../../utils/scripts/index.ts';
import type { QualitePeriodPreset, QualiteSelectOption } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { Button } from '../index.ts';

type QualiteStatsFiltersProps = Pick<
  QualiteStatsPageViewModel,
  | 'applyFilters'
  | 'campaignOptions'
  | 'campagnesLoading'
  | 'changePeriodPreset'
  | 'commercialOptions'
  | 'dateDebut'
  | 'dateFin'
  | 'employesLoading'
  | 'filterError'
  | 'periodeLabel'
  | 'resetFilters'
  | 'selectedCampaignOption'
  | 'selectedCommercialOption'
  | 'selectedPeriodOption'
  | 'setDateDebut'
  | 'setDateFin'
  | 'setSelectedCampagneId'
  | 'setSelectedEmployeId'
>;

const selectStyles = reactSelectStyles as StylesConfig<QualiteSelectOption, false>;

export function QualiteStatsFilters(props: QualiteStatsFiltersProps): ReactElement {
  return (
    <section className="qualiteStats__filter-card">
      <div className="qualiteStats__filter-title">
        <MdTune />
        <div><h2>Périmètre d’analyse</h2><p>Une campagne à la fois pour conserver la bonne signification des étapes.</p></div>
      </div>

      <div className="qualiteStats__filter-grid">
        <div className="qualiteStats__field qualiteStats__field--campaign">
          <label htmlFor="campaignSelect">Campagne</label>
          <Select<QualiteSelectOption, false>
            inputId="campaignSelect"
            options={props.campaignOptions}
            value={props.selectedCampaignOption}
            onChange={(option) => props.setSelectedCampagneId(option?.value ? Number(option.value) : null)}
            styles={selectStyles}
            isLoading={props.campagnesLoading}
            placeholder="Sélectionner une campagne"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
          />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="commercialSelect">Commercial</label>
          <Select<QualiteSelectOption, false>
            inputId="commercialSelect"
            options={props.commercialOptions}
            value={props.selectedCommercialOption}
            onChange={(option) => props.setSelectedEmployeId(option?.value ? Number(option.value) : null)}
            styles={selectStyles}
            isLoading={props.employesLoading}
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
          />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="periodPreset">Période rapide</label>
          <Select<QualiteSelectOption, false>
            inputId="periodPreset"
            options={QUALITE_PERIOD_OPTIONS}
            value={props.selectedPeriodOption}
            onChange={(option) => props.changePeriodPreset((option?.value as QualitePeriodPreset | undefined) || 'today')}
            styles={selectStyles}
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
          />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="dateDebut">Date minimum</label>
          <input id="dateDebut" type="date" value={props.dateDebut} onChange={(event) => props.setDateDebut(event.target.value)} max={props.dateFin} />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="dateFin">Date maximum</label>
          <input id="dateFin" type="date" value={props.dateFin} onChange={(event) => props.setDateFin(event.target.value)} min={props.dateDebut} />
        </div>
      </div>

      <div className="qualiteStats__filter-footer">
        <div className="qualiteStats__period-chip">{props.periodeLabel}</div>
        <div className="qualiteStats__filter-actions">
          <Button style="grey" onClick={props.resetFilters}>Réinitialiser</Button>
          <Button style="orange" onClick={props.applyFilters}><MdRefresh /><span>Afficher les statistiques</span></Button>
        </div>
      </div>
      {props.filterError && <p className="qualiteStats__filter-error">{props.filterError}</p>}
    </section>
  );
}
