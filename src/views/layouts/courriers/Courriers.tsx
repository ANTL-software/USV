import './courriers.scss';

import type { ReactElement } from 'react';
import { useCourriersHubView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { CourriersHubContent, Header, SubNav } from '../../components/index.ts';

function Courriers(): ReactElement {
  const viewModel = useCourriersHubView();
  return <><Header /><SubNav /><CourriersHubContent viewModel={viewModel} /></>;
}

const CourriersWithAuth = WithAuth(Courriers);
export default CourriersWithAuth;
