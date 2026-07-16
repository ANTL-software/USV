import './incidents.scss';

import type { ReactElement } from 'react';
import { useIncidentQualificationView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, IncidentQualificationContent, SubNav } from '../../components/index.ts';

function IncidentQualification(): ReactElement {
  const viewModel = useIncidentQualificationView();
  return <div id="incidentQualification"><Header /><SubNav /><main><IncidentQualificationContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const IncidentQualificationWithAuth = WithAuth(IncidentQualification);
export default IncidentQualificationWithAuth;
