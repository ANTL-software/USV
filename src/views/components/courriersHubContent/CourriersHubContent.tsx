import type { ReactElement } from 'react';
import type { CourriersHubViewModel } from '../../../hooks/index.ts';
import { CourriersHubActions } from '../courriersHubActions/index.ts';
import { CourriersHubStats } from '../courriersHubStats/index.ts';

interface CourriersHubContentProps { viewModel: CourriersHubViewModel }

export function CourriersHubContent({ viewModel }: CourriersHubContentProps): ReactElement {
  return (
    <main id="courriers" className="courriersMain"><div className="courriersContainer">
      <section className="courriersHeader" data-aos="fade-down"><h1 className="courriersTitle">Gestion des courriers</h1><p className="courriersSubtitle">Organisez et suivez vos courriers efficacement</p></section>
      {viewModel.error && <div className="courriersError">{viewModel.error}</div>}
      <CourriersHubActions viewModel={viewModel} />
      <CourriersHubStats viewModel={viewModel} />
    </div></main>
  );
}
