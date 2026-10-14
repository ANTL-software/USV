import type { ReactElement } from 'react';
import type { DevisPageViewModel } from '../../../hooks/index.ts';
import { DevisDrafts } from '../devisDrafts/index.ts';
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
        isEditing={viewModel.drafts.mode === 'edit'}
        campaignType={viewModel.campaignType}
        onBack={viewModel.navigateBack}
        progressPercent={viewModel.progressPercent}
        selectedTemplateTitle={viewModel.selectedTemplateTitle}
      />
      <DevisDrafts viewModel={viewModel.drafts} />
      {viewModel.drafts.mode === 'edit' && <>
      <DevisWorkflowSummary />
      <fieldset className="devisView__draft-workspace" disabled={viewModel.drafts.isRestoring}>
        <legend className="devisView__draft-legend">Rédaction du devis</legend>
        <DevisWorkspace viewModel={viewModel} />
      </fieldset>
      </>}
    </div>
  );
}
