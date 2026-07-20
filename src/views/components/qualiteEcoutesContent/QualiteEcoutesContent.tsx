import type { ReactElement } from 'react';
import type { QualiteEcoutesPageViewModel } from '../../../hooks/index.ts';
import { QualiteEcoutesFilters } from '../qualiteEcoutesFilters/index.ts';
import { QualiteEcoutesHeader } from '../qualiteEcoutesHeader/index.ts';
import { QualiteEcoutesPlayer } from '../qualiteEcoutesPlayer/index.ts';
import { QualiteEcoutesTable } from '../qualiteEcoutesTable/index.ts';

interface QualiteEcoutesContentProps { viewModel: QualiteEcoutesPageViewModel }

export function QualiteEcoutesContent({ viewModel }: QualiteEcoutesContentProps): ReactElement {
  return (
    <>
      <main><div className="qualiteEcoutes__container">
        <QualiteEcoutesHeader onBack={viewModel.navigateBack} totalCount={viewModel.totalCount} />
        <QualiteEcoutesFilters viewModel={viewModel} />
        {viewModel.error && <div className="qualiteEcoutes__error">{viewModel.error}</div>}
        <QualiteEcoutesTable viewModel={viewModel} />
      </div></main>
      {viewModel.activeRecording && <QualiteEcoutesPlayer recording={viewModel.activeRecording} getRecordingUrl={viewModel.getRecordingUrl} onClose={() => viewModel.setActiveRecording(null)} />}
    </>
  );
}
