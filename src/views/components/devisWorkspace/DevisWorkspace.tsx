import { useState } from 'react';
import type { ReactElement } from 'react';
import type { DevisPageViewModel } from '../../../hooks/index.ts';
import { DevisClientContext } from '../devisClientContext/index.ts';
import { DevisCommercialTerms } from '../devisCommercialTerms/index.ts';
import { DevisOfferComposition } from '../devisOfferComposition/index.ts';
import { DevisPreview } from '../devisPreview/index.ts';
import { DevisFlexibleServices } from '../devisFlexibleServices/index.ts';

interface DevisWorkspaceProps {
  viewModel: DevisPageViewModel;
}

export function DevisWorkspace({ viewModel }: DevisWorkspaceProps): ReactElement {
  const [openSections, setOpenSections] = useState({ conquete: true, conception: viewModel.isProjectQuote, flexible: viewModel.flexibleServices.length > 0 });
  const toggleSection = (section: keyof typeof openSections, open: boolean): void => {
    setOpenSections((previous) => previous[section] === open ? previous : { ...previous, [section]: open });
  };
  const offerProps = {
    conquestSectionTitle: viewModel.conquestSectionTitle,
    conquestBaseLineLabel: viewModel.conquestBaseLineLabel,
    conquestLineCount: viewModel.conquestQuoteLines.length,
    commercialCommissionDescription: viewModel.commercialCommissionDescription,
    onConquestSectionTitleChange: viewModel.setConquestSectionTitle,
    onConquestLineLabelChange: viewModel.setConquestLineLabel,
    onCommercialCommissionDescriptionChange: viewModel.setCommercialCommissionDescription,
    appointmentRate: viewModel.appointmentRate,
    appointmentDescription: viewModel.appointmentDescription,
    campaignType: viewModel.campaignType,
    commercialCommissionRate: viewModel.commercialCommissionRate,
    customClauses: viewModel.customClauses,
    panelNumber: 2,
    projectSections: viewModel.projectSections,
    thirdPartyServices: viewModel.thirdPartyServices,
    onAddCustomClause: viewModel.addCustomClause,
    onAddProjectLine: viewModel.addProjectLine,
    onAddProjectSection: viewModel.addProjectSection,
    onAddThirdPartyService: viewModel.addThirdPartyService,
    onAppointmentRateChange: viewModel.setAppointmentRate,
    onAppointmentDescriptionChange: viewModel.setAppointmentDescription,
    onCampaignTypeChange: viewModel.setCampaignType,
    onCommercialCommissionRateChange: viewModel.setCommercialCommissionRate,
    onRemoveCustomClause: viewModel.removeCustomClause,
    onRemoveProjectLine: viewModel.removeProjectLine,
    onRemoveThirdPartyService: viewModel.removeThirdPartyService,
    onUpdateCustomClause: viewModel.updateCustomClause,
    onUpdateProjectLine: viewModel.updateProjectLine,
    onUpdateProjectSectionTitle: viewModel.updateProjectSectionTitle,
    onUpdateThirdPartyService: viewModel.updateThirdPartyService,
  };
  return (
    <section className="devisView__workspace">
      <div className="devisView__main">
        <DevisClientContext form={viewModel.formState} onFormChange={viewModel.handleFormChange} />
        <article className="devisView__panel">
          <h2>2. Composition de l’offre</h2>
          <p>Dépliez les sections utiles et renseignez vos prestations. Une section vide est ignorée dans le devis. Refermer une section conserve son contenu.</p>
        </article>
        <details className="devisView__accordion" open={openSections.conquete} onToggle={(event) => toggleSection('conquete', event.currentTarget.open)}>
          <summary>Conquête <span>{viewModel.conquestQuoteLines.length} ligne(s) retenue(s)</span></summary>
          <DevisOfferComposition {...offerProps} isProjectQuote={false} />
        </details>
        <details className="devisView__accordion" open={openSections.conception} onToggle={(event) => toggleSection('conception', event.currentTarget.open)}>
          <summary>Conception <span>{viewModel.projectSections.length} phase(s) disponibles</span></summary>
          <DevisOfferComposition {...offerProps} isProjectQuote />
        </details>
        <details className="devisView__accordion" open={openSections.flexible} onToggle={(event) => toggleSection('flexible', event.currentTarget.open)}>
          <summary>Prestations libres et primes <span>{viewModel.flexibleQuoteLines.length} ligne(s) retenue(s)</span></summary>
          <DevisFlexibleServices sectionTitle={viewModel.flexibleSectionTitle} lineCount={viewModel.flexibleQuoteLines.length}
            onSectionTitleChange={viewModel.setFlexibleSectionTitle} services={viewModel.flexibleServices} onAdd={viewModel.addFlexibleService}
            onRemove={viewModel.removeFlexibleService} onUpdate={viewModel.updateFlexibleService} />
        </details>
        <DevisCommercialTerms assumptions={viewModel.selectedAssumptions} form={viewModel.formState} onFormChange={viewModel.handleFormChange} />
      </div>
      <DevisPreview form={viewModel.formState} campaignType={viewModel.campaignType}
        quoteLines={viewModel.quoteLines} selectedTemplatePromise={viewModel.selectedTemplatePromise} selectedTemplateTitle={viewModel.selectedTemplateTitle}
        fixedTotals={viewModel.fixedTotals} hasFixedLines={viewModel.hasFixedLines} hasConditionalLines={viewModel.hasConditionalLines}
        isGeneratingQuote={viewModel.isGeneratingQuote} onGenerateQuote={() => { void viewModel.generateQuote(); }} />
    </section>
  );
}
