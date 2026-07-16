import './incidents.scss';

import type { ReactElement } from 'react';
import { useIncidentDeclarationView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, IncidentDeclarationContent, SubNav } from '../../components/index.ts';

function IncidentDeclaration(): ReactElement {
  const viewModel = useIncidentDeclarationView();
  return <div id="incidentDeclaration"><Header /><SubNav /><main><IncidentDeclarationContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const IncidentDeclarationWithAuth = WithAuth(IncidentDeclaration);
export default IncidentDeclarationWithAuth;
