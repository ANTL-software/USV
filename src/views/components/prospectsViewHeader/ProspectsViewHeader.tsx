import type { ReactElement } from 'react';
import { IoAddCircleOutline, IoTrashOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import type { ProspectsViewPageViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

interface ProspectsViewHeaderProps { viewModel: ProspectsViewPageViewModel }

export function ProspectsViewHeader({ viewModel }: ProspectsViewHeaderProps): ReactElement {
  return (
    <>
      <div className="prospectsView__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div>
      <div className="prospectsView__header">
        <div className="prospectsView__title-section">
          <h1>Prospects</h1>
          {!viewModel.selectedCampagne && viewModel.totalProspectsDb !== null && <span className="prospectsView__total-pill">Total en base: {viewModel.totalProspectsDb.toLocaleString('fr-FR')}</span>}
          <Button style="grey" onClick={viewModel.navigateToEnrichment}><span>Enrichissement de donnée Prospect</span></Button>
          {viewModel.selectedCampagne && (
            <>
              <Button style="gradient" onClick={viewModel.navigateToInjection}><IoAddCircleOutline /><span>Injecter des prospects</span></Button>
              <Button style="red" onClick={() => void viewModel.purgeCampaign()} disabled={viewModel.isPurging} className="prospectsView__purge"><IoTrashOutline /><span>Vider la table d&apos;appel</span></Button>
            </>
          )}
        </div>
        <div className="prospectsView__filters">
          <div className="prospectsView__filter">
            <label htmlFor="campagne-select">Campagne :</label>
            <Select inputId="campagne-select" options={viewModel.campagneOptions} value={viewModel.selectedCampagneOption} onChange={(option) => viewModel.setSelectedCampagne(option?.value ?? null)} placeholder="Choisir..." isSearchable={false} classNamePrefix="reactSelect" />
          </div>
          <div className="prospectsView__search"><input type="text" placeholder="Rechercher..." value={viewModel.search} onChange={(event) => viewModel.setSearch(event.target.value)} /></div>
        </div>
      </div>
    </>
  );
}
