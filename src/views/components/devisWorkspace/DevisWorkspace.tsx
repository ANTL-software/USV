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
        {viewModel.isConquestQuote && (
          <DevisOfferComposition
            appointmentRate={viewModel.appointmentRate}
            campaignType={viewModel.campaignType}
            commercialCommissionRate={viewModel.commercialCommissionRate}
            customClauses={viewModel.customClauses}
            isProjectQuote={false}
            panelNumber={3}
            projectSections={viewModel.projectSections}
            thirdPartyServices={viewModel.thirdPartyServices}
            onAddCustomClause={viewModel.addCustomClause}
            onAddProjectLine={viewModel.addProjectLine}
            onAddThirdPartyService={viewModel.addThirdPartyService}
            onAppointmentRateChange={viewModel.setAppointmentRate}
            onCampaignTypeChange={viewModel.setCampaignType}
            onCommercialCommissionRateChange={viewModel.setCommercialCommissionRate}
            onRemoveCustomClause={viewModel.removeCustomClause}
            onRemoveProjectLine={viewModel.removeProjectLine}
            onRemoveThirdPartyService={viewModel.removeThirdPartyService}
            onUpdateCustomClause={viewModel.updateCustomClause}
            onUpdateProjectLine={viewModel.updateProjectLine}
            onUpdateProjectSectionTitle={viewModel.updateProjectSectionTitle}
            onUpdateThirdPartyService={viewModel.updateThirdPartyService}
          />
        )}
        {viewModel.isProjectQuote && (
          <DevisOfferComposition
            appointmentRate={viewModel.appointmentRate}
            campaignType={viewModel.campaignType}
            commercialCommissionRate={viewModel.commercialCommissionRate}
            customClauses={viewModel.customClauses}
            isProjectQuote
            panelNumber={viewModel.isConquestQuote ? 4 : 3}
            projectSections={viewModel.projectSections}
            thirdPartyServices={viewModel.thirdPartyServices}
            onAddCustomClause={viewModel.addCustomClause}
            onAddProjectLine={viewModel.addProjectLine}
            onAddThirdPartyService={viewModel.addThirdPartyService}
            onAppointmentRateChange={viewModel.setAppointmentRate}
            onCampaignTypeChange={viewModel.setCampaignType}
            onCommercialCommissionRateChange={viewModel.setCommercialCommissionRate}
            onRemoveCustomClause={viewModel.removeCustomClause}
            onRemoveProjectLine={viewModel.removeProjectLine}
            onRemoveThirdPartyService={viewModel.removeThirdPartyService}
            onUpdateCustomClause={viewModel.updateCustomClause}
            onUpdateProjectLine={viewModel.updateProjectLine}
            onUpdateProjectSectionTitle={viewModel.updateProjectSectionTitle}
            onUpdateThirdPartyService={viewModel.updateThirdPartyService}
          />
        )}
        {viewModel.isConquestQuote && (
          <DevisCommercialTerms
            assumptions={viewModel.selectedAssumptions}
            form={viewModel.formState}
            onFormChange={viewModel.handleFormChange}
          />
        )}
      </div>

      <DevisPreview
        form={viewModel.formState}
        campaignType={viewModel.campaignType}
        isProjectQuote={viewModel.isProjectQuote}
        quoteLines={viewModel.quoteLines}
        selectedTemplatePromise={viewModel.selectedTemplatePromise}
        selectedTemplateTitle={viewModel.selectedTemplateTitle}
        isGeneratingQuote={viewModel.isGeneratingQuote}
        onGenerateQuote={() => { void viewModel.generateQuote(); }}
      />
    </section>
  );
}
