import type { ReactElement } from 'react';
import { IoClipboardOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { IncidentQualificationViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { IncidentQualificationPanel } from '../incidentQualificationPanel/index.ts';
import { IncidentQualificationSidebar } from '../incidentQualificationSidebar/index.ts';

interface IncidentQualificationContentProps { viewModel: IncidentQualificationViewModel }

export function IncidentQualificationContent({ viewModel }: IncidentQualificationContentProps): ReactElement {
  return (
    <div className="incidents__container">
      <div className="incidents__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button><h1><IoClipboardOutline /> Qualification des incidents</h1></div>
      {viewModel.error && <div className="incidents__error">{viewModel.error}</div>}
      {viewModel.formError && <div className="incidents__error">{viewModel.formError}</div>}
      {viewModel.success && <div className="incidents__success">{viewModel.success}</div>}
      <div className="incidents__layout"><IncidentQualificationSidebar viewModel={viewModel} /><IncidentQualificationPanel viewModel={viewModel} /></div>
    </div>
  );
}
