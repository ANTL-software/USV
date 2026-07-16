import type { ReactElement } from 'react';
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

import type { SupervisionViewModel } from '../../../hooks/index.ts';
import type { SupervisionSelectOption } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import {
  AppelsParHeureChart,
  AppelsParOrigineChart,
  DureeMoyenneChart,
  ExportButton,
  FilterPanel,
  Loader,
  PrintButton,
  StatutsAppelsChart,
  StatutsParHeureChart,
  TauxAboutiChart,
  TopRaisonsChart,
} from '../index.ts';

interface SupervisionPerformanceProps {
  viewModel: SupervisionViewModel;
}

const selectStyles = reactSelectStyles as StylesConfig<
  SupervisionSelectOption,
  false,
  GroupBase<SupervisionSelectOption>
>;

export function SupervisionPerformance({ viewModel }: SupervisionPerformanceProps): ReactElement {
  const {
    amdKpis,
    dateFilters,
    displayStats,
    employeOptions,
    exportData,
    handleEmployeeChange,
    performanceLoading,
    selectedEmploye,
    selectedEmployeeLabel,
    selectedEmployeeOption,
    setDateFilters,
    showGraphiques,
    supervisionAgents,
    toggleGraphiques,
  } = viewModel;
  const actionsDisabled = !displayStats || performanceLoading;

  return (
    <section className="supervisionView__graphiques">
      <div className="supervisionView__filters">
        <div className="supervisionView__selector supervisionView__selector--inline">
          <label>Filtrer par agent (optionnel)</label>
          <Select<SupervisionSelectOption>
            options={employeOptions}
            value={selectedEmployeeOption}
            onChange={handleEmployeeChange}
            styles={selectStyles}
            placeholder={supervisionAgents.isLoading ? 'Chargement...' : 'Choisir un agent...'}
            isClearable
            isDisabled={supervisionAgents.isLoading}
          />
        </div>
        <div className="supervisionView__filter-dates">
          <FilterPanel filters={dateFilters} onFiltersChange={setDateFilters} />
        </div>
      </div>

      <div className="supervisionView__section-header supervisionView__section-header--toggle">
        <h3>
          Graphiques de performance{selectedEmploye ? ` - ${selectedEmployeeLabel}` : ''}
        </h3>
        <div className="supervisionView__header-actions">
          <ExportButton data={exportData} disabled={actionsDisabled} />
          <PrintButton disabled={actionsDisabled} />
          <button
            className="supervisionView__toggle-btn"
            onClick={toggleGraphiques}
            aria-expanded={showGraphiques}
            type="button"
          >
            {showGraphiques ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      {showGraphiques && (
        <>
          {performanceLoading && <Loader message="Chargement des graphiques..." />}
          {!performanceLoading && displayStats && (
            <>
              <div className="supervisionView__graphiques-grid">
                <div className="supervisionView__graphique supervisionView__graphique--full">
                  <StatutsAppelsChart data={displayStats.appelsParStatut} />
                </div>
                <div className="supervisionView__graphique supervisionView__graphique--full">
                  <AppelsParHeureChart data={displayStats.appelsParHeure} />
                </div>
                <div className="supervisionView__graphique supervisionView__graphique--half">
                  <TauxAboutiChart data={displayStats.tauxAbouti} />
                </div>
                <div className="supervisionView__graphique supervisionView__graphique--half">
                  <DureeMoyenneChart data={displayStats.dureeMoyenne7j} />
                </div>
                <div className="supervisionView__graphique supervisionView__graphique--half">
                  <AppelsParOrigineChart data={displayStats.appelsParOrigine} />
                </div>
                <div className="supervisionView__graphique supervisionView__graphique--half">
                  <TopRaisonsChart data={displayStats.topRaisons} />
                </div>
                <div className="supervisionView__graphique supervisionView__graphique--full">
                  <StatutsParHeureChart data={displayStats.statutsParHeure} />
                </div>
              </div>

              <div className="supervisionView__historical-amd">
                <div className="supervisionView__section-header">
                  <h4>Qualification AMD / SVI sur la période</h4>
                </div>
                <div className="supervisionView__amd-kpis" role="status" aria-label="KPI qualification d'appel">
                  {amdKpis.map((kpi) => (
                    <div key={kpi.key} className={`amd-kpi-card ${kpi.className}`}>
                      <span className="amd-kpi-card__value">{kpi.value}</span>
                      <span className="amd-kpi-card__label">{kpi.label}</span>
                      <span className="amd-kpi-card__meta">{kpi.meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
