import type { ReactElement } from 'react';
import type { DevisPageViewModel } from '../../../hooks/index.ts';
import { DevisClientContext } from '../devisClientContext/index.ts';
import { DevisCommercialTerms } from '../devisCommercialTerms/index.ts';
import { DevisOfferComposition } from '../devisOfferComposition/index.ts';
import { DevisPreview } from '../devisPreview/index.ts';
import { DevisTemplateSelection } from '../devisTemplateSelection/index.ts';

interface DevisWorkspaceProps {
  viewModel: DevisPageViewModel;
}

export function DevisWorkspace({ viewModel }: DevisWorkspaceProps): ReactElement {
  return (
    <section className="devisView__workspace">
      <div className="devisView__main">
        <DevisTemplateSelection
          familyFilter={viewModel.familyFilter}
          onFamilyFilterChange={viewModel.setFamilyFilter}
          onTemplateToggle={viewModel.handleTemplateToggle}
          selectedTemplateIds={viewModel.selectedTemplateIds}
          templates={viewModel.visibleTemplates}
        />
        <DevisClientContext form={viewModel.formState} onFormChange={viewModel.handleFormChange} />
        <DevisOfferComposition
          includedLines={viewModel.includedCatalogLines}
          lineSelection={viewModel.lineSelection}
          onLineToggle={viewModel.handleLineToggle}
          optionLines={viewModel.optionCatalogLines}
          selectedTemplatePromise={viewModel.selectedTemplatePromise}
        />
        <DevisCommercialTerms
          assumptions={viewModel.selectedAssumptions}
          form={viewModel.formState}
          onFormChange={viewModel.handleFormChange}
        />
      </div>

      <DevisPreview
        form={viewModel.formState}
        monthlySubtotal={viewModel.monthlySubtotal}
        oneShotSubtotal={viewModel.oneShotSubtotal}
        projectedTotal={viewModel.projectedTotal}
        selectedIncludedLines={viewModel.selectedIncludedLines}
        selectedOptionLines={viewModel.selectedOptionLines}
        selectedTemplatePromise={viewModel.selectedTemplatePromise}
        selectedTemplateTitle={viewModel.selectedTemplateTitle}
      />
    </section>
  );
}
