import './commercialAgenda.scss';
import type { ReactElement } from 'react';
import { useCommercialAgenda } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { CommercialAgendaContent } from '../../components/index.ts';

function CommercialAgenda(): ReactElement {
  return <CommercialAgendaContent viewModel={useCommercialAgenda()} />;
}

const CommercialAgendaWithAuth = WithAuth(CommercialAgenda);
export default CommercialAgendaWithAuth;
