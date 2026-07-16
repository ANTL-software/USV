import type { ReactElement } from 'react';
import type { ProspectEnrichmentViewModel } from '../../../hooks/index.ts';
import {
  ProspectEnrichmentOverview,
  ProspectEnrichmentPanels,
  ProspectEnrichmentPreview,
  ProspectWebsiteSignals,
} from '../index.ts';

interface ProspectEnrichmentContentProps {
  viewModel: ProspectEnrichmentViewModel;
}

export function ProspectEnrichmentContent({ viewModel }: ProspectEnrichmentContentProps): ReactElement {
  const {
    snapshot,
    snapshotError,
    snapshotLoading,
    websiteAnalysis,
  } = viewModel;

  if (snapshotLoading) {
    return <div className="prospectEnrichment__loading">Chargement de la fiche d’enrichissement...</div>;
  }

  if (!snapshot) {
    return (
      <>
        {snapshotError && <div className="prospectEnrichment__error">{snapshotError}</div>}
        <div className="prospectEnrichment__placeholder">Sélectionnez un prospect pour afficher la fiche consolidée d’enrichissement.</div>
      </>
    );
  }

  return (
    <>
      {snapshotError && <div className="prospectEnrichment__error">{snapshotError}</div>}
      <ProspectEnrichmentPreview {...viewModel} />
      <ProspectEnrichmentOverview snapshot={snapshot} />
      <section className="prospectEnrichment__grid">
        <ProspectEnrichmentPanels snapshot={snapshot} />
        <ProspectWebsiteSignals websiteAnalysis={websiteAnalysis} />
      </section>
    </>
  );
}
