import './alertesHistoryView.scss';

import type { ReactElement } from 'react';
import { useAlertesHistoryPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { AlertesHistoryContent, BackToTop, Header, SubNav } from '../../components/index.ts';

function AlertesHistoryView(): ReactElement {
  const viewModel = useAlertesHistoryPage();
  return <div id="alertesHistoryView"><Header /><SubNav /><main><AlertesHistoryContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const AlertesHistoryViewWithAuth = WithAuth(AlertesHistoryView);
export default AlertesHistoryViewWithAuth;
