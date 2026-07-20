import type { ReactElement } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import type { LeadClientDetailsPageViewModel } from '../../../hooks/index.ts';
import { STATUT_RENDEZ_VOUS_LABELS } from '../../../utils/types/index.ts';
import { formatLeadClientReference, getLeadStatusBadgeClass } from '../../../utils/scripts/index.ts';
import { Button, LeadAppointmentsHistory, LeadCallsHistory, LeadClientSummary, LeadQualificationPanel, Loader } from '../index.ts';

interface LeadClientDetailsContentProps { viewModel: LeadClientDetailsPageViewModel }

export function LeadClientDetailsContent({ viewModel }: LeadClientDetailsContentProps): ReactElement {
  if (viewModel.loading) return <main className="commandeDetails__loading"><Loader message="Chargement du rendez-vous client..." /></main>;
  if (viewModel.error || !viewModel.lead) {
    return (
      <main><div className="commandeDetails__container"><div className="commandeDetails__header"><Button style="back" onClick={viewModel.navigateBack}><IoArrowBack /> Retour</Button></div><div className="commandeDetails__error"><h3>Erreur de chargement</h3><p>{viewModel.error || 'Rendez-vous introuvable'}</p><Button style="gradient" onClick={viewModel.navigateBack}>Retour aux rendez-vous</Button></div></div></main>
    );
  }
  const { lead } = viewModel;
  return (
    <main><div className="commandeDetails__container">
      <div className="commandeDetails__header">
        <Button style="back" onClick={viewModel.navigateBack}><IoArrowBack /> Retour</Button>
        <h2>Rendez-vous client {formatLeadClientReference(lead.id_lead)}</h2>
        <span className={getLeadStatusBadgeClass(lead.statut)}>{STATUT_RENDEZ_VOUS_LABELS[lead.statut]}</span>
      </div>
      <div className="commandeDetails__content">
        <div className="commandeDetails__left"><LeadClientSummary lead={lead} /><LeadCallsHistory {...viewModel} /><LeadAppointmentsHistory {...viewModel} /></div>
        <LeadQualificationPanel {...viewModel} />
      </div>
    </div></main>
  );
}
