import './prospectsSignales.scss';
import type { ReactElement } from 'react';
import { useProspectsSignalesPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { ProspectsSignalesContent } from '../../components/index.ts';

function ProspectsSignales(): ReactElement {
  return <ProspectsSignalesContent viewModel={useProspectsSignalesPage()} />;
}

const ProspectsSignalesWithAuth = WithAuth(ProspectsSignales);
export default ProspectsSignalesWithAuth;
