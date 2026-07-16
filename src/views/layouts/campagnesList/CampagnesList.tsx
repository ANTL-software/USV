import './campagnesList.scss';
import type { ReactElement } from 'react';
import { useCampagnesListPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { CampagnesListContent } from '../../components/index.ts';

function CampagnesList(): ReactElement {
  return <CampagnesListContent viewModel={useCampagnesListPage()} />;
}

const CampagnesListWithAuth = WithAuth(CampagnesList);
export default CampagnesListWithAuth;
