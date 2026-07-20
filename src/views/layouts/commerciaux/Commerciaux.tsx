import './commerciaux.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useCommerciauxPage } from '../../../hooks/index.ts';
import { CommerciauxHubContent } from '../../components/index.ts';

function Commerciaux(): ReactElement {
  return <CommerciauxHubContent viewModel={useCommerciauxPage()} />;
}

const CommerciauxWithAuth = WithAuth(Commerciaux);
export default CommerciauxWithAuth;
