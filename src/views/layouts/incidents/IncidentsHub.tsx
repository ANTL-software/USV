import './incidents.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useIncidentsHubPage } from '../../../hooks/index.ts';
import { IncidentsHubContent } from '../../components/index.ts';

function IncidentsHub(): ReactElement {
  return <IncidentsHubContent viewModel={useIncidentsHubPage()} />;
}

const IncidentsHubWithAuth = WithAuth(IncidentsHub);
export default IncidentsHubWithAuth;
