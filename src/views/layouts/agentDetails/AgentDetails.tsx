import './agentDetails.scss';

import type { ReactElement } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useEmployeeDetailsView } from '../../../hooks/index.ts';
import {
  AgentDetailsSidebar,
  AgentDocumentsTable,
  AgentDocumentUploadModal,
  AgentDocumentViewerModal,
  AgentPlanningModal,
  BackToTop,
  Button,
  Header,
  SubNav,
} from '../../components/index.ts';

function AgentDetails(): ReactElement {
  const viewModel = useEmployeeDetailsView();

  return (
    <div id="agentDetails">
      <Header />
      <SubNav />
      <main>
        <div className="agentDetails__container">
          <div className="agentDetails__header">
            <Button style="back" onClick={viewModel.navigateBack}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>{viewModel.pageTitle}</h1>
          </div>
          <div className="agentDetails__content">
            <AgentDocumentsTable {...viewModel} />
            <AgentDetailsSidebar {...viewModel} />
          </div>
        </div>
      </main>

      <AgentPlanningModal {...viewModel} />
      <AgentDocumentUploadModal {...viewModel} />
      <AgentDocumentViewerModal {...viewModel} />
      <BackToTop />
    </div>
  );
}

const AuthenticatedAgentDetails = WithAuth(AgentDetails);

export default function AgentDetailsRoute(): ReactElement {
  return <AuthenticatedAgentDetails />;
}
