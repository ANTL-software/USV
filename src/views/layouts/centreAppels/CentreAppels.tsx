// styles
import './centreAppels.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useCentreAppelsPage } from '../../../hooks/index.ts';
import { CentreAppelsContent } from '../../components/index.ts';

function CentreAppels(): ReactElement {
  return <CentreAppelsContent viewModel={useCentreAppelsPage()} />;
}

const CentreAppelsWithAuth = WithAuth(CentreAppels);
export default CentreAppelsWithAuth;
