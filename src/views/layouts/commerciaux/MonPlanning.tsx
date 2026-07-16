import './commerciaux.scss';
import type { ReactElement } from 'react';
import { useMonPlanningPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { MonPlanningContent } from '../../components/index.ts';

function MonPlanning(): ReactElement {
  return <MonPlanningContent viewModel={useMonPlanningPage()} />;
}

const MonPlanningWithAuth = WithAuth(MonPlanning);
export default MonPlanningWithAuth;
