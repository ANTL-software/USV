import type { ReactElement } from 'react';
import { IoEyeOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';

import type { VigiePageViewModel } from '../../../hooks/index.ts';
import { VIGIE_PERIOD_OPTIONS } from '../../../utils/scripts/index.ts';
import type { SelectOption, VigiePeriodKey } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { Button } from '../index.ts';

interface VigieHeaderProps {
  viewModel: VigiePageViewModel;
}

export function VigieHeader({ viewModel }: VigieHeaderProps): ReactElement {
  const { vigie } = viewModel;
  return (
    <>
      <div className="vigieView__header">
        <Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /> Retour</Button>
        <div><span className="vigieView__eyebrow"><IoEyeOutline /> Vigie humaine</span><h1>Piloter la file en temps réel</h1><p>Observer la cadence, la qualité des fiches, les contacts humains et les résultats métier pour décider où concentrer les prochains appels.</p></div>
      </div>
      <section className="vigieView__intro" aria-label="Rôle de la vigie">
        <IoShieldCheckmarkOutline /><div><strong>Un assistant de décision, pas un pilote automatique</strong><span>Les conseils sont produits par des règles transparentes issues de l’analyse des données. Aucune injection ni priorité n’est exécutée sans confirmation humaine.</span></div>
      </section>
      <section className="vigieView__filters" aria-label="Filtres de la vigie">
        <div><label htmlFor="vigie-campaign">Campagne active à observer</label>
          <Select<SelectOption<number>, false>
            inputId="vigie-campaign" options={vigie.campaignOptions}
            value={vigie.campaignOptions.find(({ value }) => value === vigie.selectedCampaignId) || null}
            onChange={(option) => vigie.selectCampaign(option?.value ?? null)}
            styles={reactSelectStyles as StylesConfig<SelectOption<number>, false>}
            placeholder={vigie.campagnesLoading ? 'Chargement des campagnes...' : 'Choisir une campagne active...'}
            isLoading={vigie.campagnesLoading} isDisabled={vigie.campagnesLoading} isClearable
          />
        </div>
        <div><label htmlFor="vigie-period">Période d’analyse</label>
          <Select<SelectOption<VigiePeriodKey>, false>
            inputId="vigie-period" options={VIGIE_PERIOD_OPTIONS}
            value={VIGIE_PERIOD_OPTIONS.find(({ value }) => value === vigie.period)}
            onChange={(option) => vigie.setPeriod(option?.value || '7d')}
            styles={reactSelectStyles as StylesConfig<SelectOption<VigiePeriodKey>, false>}
            isSearchable={false}
          />
        </div>
      </section>
    </>
  );
}
