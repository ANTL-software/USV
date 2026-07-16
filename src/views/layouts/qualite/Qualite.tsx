// styles
import './qualite.scss';

// hooks | library
import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useQualitePage } from '../../../hooks/index.ts';
import { QualiteHubContent } from '../../components/index.ts';

function Qualite(): ReactElement {
  return <QualiteHubContent viewModel={useQualitePage()} />;
}

const QualiteWithAuth = WithAuth(Qualite);
export default QualiteWithAuth;
