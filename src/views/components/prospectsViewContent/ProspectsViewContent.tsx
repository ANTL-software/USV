import type { ReactElement } from 'react';
import type { ProspectsViewPageViewModel } from '../../../hooks/index.ts';
import { ProspectDetailModal, ProspectsTable, ProspectsViewHeader, QueuePreview } from '../index.ts';

interface ProspectsViewContentProps { viewModel: ProspectsViewPageViewModel }

export function ProspectsViewContent({ viewModel }: ProspectsViewContentProps): ReactElement {
  return (
    <>
      <ProspectsViewHeader viewModel={viewModel} />
      {viewModel.error && <div className="prospectsView__error">{viewModel.error}</div>}
      {viewModel.selectedCampagne && <QueuePreview idCampagne={viewModel.selectedCampagne.id_campagne} onOpenProspect={viewModel.setSelectedProspect} refreshKey={viewModel.queueRefreshKey} />}
      <ProspectsTable viewModel={viewModel} />
      <ProspectDetailModal viewModel={viewModel.prospectDetail} />
    </>
  );
}
