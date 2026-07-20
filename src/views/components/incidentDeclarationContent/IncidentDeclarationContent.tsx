import type { ReactElement } from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { IncidentDeclarationViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { IncidentDeclarationForm } from '../incidentDeclarationForm/index.ts';

interface IncidentDeclarationContentProps { viewModel: IncidentDeclarationViewModel }

export function IncidentDeclarationContent({ viewModel }: IncidentDeclarationContentProps): ReactElement {
  return (
    <div className="incidents__container">
      <div className="incidents__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button><h1><IoAlertCircleOutline /> Déclarer un incident</h1></div>
      {viewModel.error && <div className="incidents__error">{viewModel.error}</div>}
      {viewModel.createdResult && <div className="incidents__success"><span>Incident {viewModel.createdResult.incident.reference} déclaré.{viewModel.createdResult.meta?.emailNotification?.success === false && ' Notification email non envoyée.'}</span><button type="button" onClick={viewModel.navigateToCreatedIncident}>Consulter</button></div>}
      <IncidentDeclarationForm viewModel={viewModel} />
    </div>
  );
}
