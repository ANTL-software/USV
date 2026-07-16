import './qualiteEcoutes.scss';

import type { ReactElement } from 'react';
import { useQualiteEcoutesPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, QualiteEcoutesContent, SubNav } from '../../components/index.ts';

function QualiteEcoutes(): ReactElement {
  const viewModel = useQualiteEcoutesPage();
  return <div id="qualiteEcoutes"><Header /><SubNav /><QualiteEcoutesContent viewModel={viewModel} /><BackToTop /></div>;
}

const QualiteEcoutesWithAuth = WithAuth(QualiteEcoutes);
export default QualiteEcoutesWithAuth;
