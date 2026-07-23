import type { ReactElement } from 'react';
import type { DevisPageViewModel } from '../../../hooks/index.ts';
import { DevisHeader } from '../devisHeader/index.ts';
import { DevisWorkflowSummary } from '../devisWorkflowSummary/index.ts';
import { DevisWorkspace } from '../devisWorkspace/index.ts';

interface DevisContentProps {
  viewModel: DevisPageViewModel;
}

export function DevisContent({ viewModel }: DevisContentProps): ReactElement {
  return (
    <div className="devisView__container">
      <DevisHeader
        campaignType={viewModel.campaignType}
        onBack={viewModel.navigateBack}
        progressPercent={viewModel.progressPercent}
        selectedTemplateTitle={viewModel.selectedTemplateTitle}
      />
      <DevisWorkflowSummary />
      <DevisWorkspace viewModel={viewModel} />
    </div>
  );
}
