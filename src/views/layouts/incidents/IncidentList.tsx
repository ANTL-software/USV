import './incidents.scss';

import type { ReactElement } from 'react';
import { useIncidentListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, IncidentListContent, SubNav } from '../../components/index.ts';

function IncidentList(): ReactElement {
  const viewModel = useIncidentListView();
  return <div id="incidentList"><Header /><SubNav /><main><IncidentListContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const IncidentListWithAuth = WithAuth(IncidentList);
export default IncidentListWithAuth;
