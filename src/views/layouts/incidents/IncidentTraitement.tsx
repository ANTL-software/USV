import './incidents.scss';

import type { ReactElement } from 'react';
import { IoBuildOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useIncidentTreatmentView } from '../../../hooks/index.ts';
import {
  BackToTop,
  Button,
  Header,
  IncidentTreatmentContent,
  IncidentTreatmentSidebar,
  SubNav,
} from '../../components/index.ts';

function IncidentTraitement(): ReactElement {
  const viewModel = useIncidentTreatmentView();

  return (
    <div id="incidentTraitement">
      <Header />
      <SubNav />
      <main>
        <div className="incidents__container incidents__container--wide">
          <div className="incidents__header">
            <Button style="back" onClick={viewModel.navigateBack}>
              <MdArrowBack /><span>Retour</span>
            </Button>
            <h1><IoBuildOutline /> {viewModel.isReadOnlyHistoryView ? "Historique de l'incident" : 'Traitement des incidents'}</h1>
          </div>
          {viewModel.error && <div className="incidents__error">{viewModel.error}</div>}
          {viewModel.success && <div className="incidents__success">{viewModel.success}</div>}
          <div className="incidents__layout incidents__layout--detail">
            <IncidentTreatmentSidebar {...viewModel} />
            <IncidentTreatmentContent viewModel={viewModel} />
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedIncidentTraitement = WithAuth(IncidentTraitement);

export default function IncidentTraitementRoute(): ReactElement {
  return <AuthenticatedIncidentTraitement />;
}
