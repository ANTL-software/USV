import './alertesConfigView.scss';

import type { ReactElement } from 'react';
import { useAlertesConfigPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { AlertesConfigContent, BackToTop, Header, SubNav } from '../../components/index.ts';

function AlertesConfigView(): ReactElement {
  const viewModel = useAlertesConfigPage();
  return <div id="alertesConfigView"><Header /><SubNav /><main><AlertesConfigContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const AlertesConfigViewWithAuth = WithAuth(AlertesConfigView);
export default AlertesConfigViewWithAuth;
