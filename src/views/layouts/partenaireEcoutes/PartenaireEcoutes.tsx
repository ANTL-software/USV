import './partenaireEcoutes.scss';
import type { ReactElement } from 'react';
import { usePartenaireEcoutesPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, QualiteEcoutesContent } from '../../components/index.ts';

function PartenaireEcoutes(): ReactElement {
  const viewModel = usePartenaireEcoutesPage();
  return <div id="partnerEcoutes"><Header /><QualiteEcoutesContent viewModel={viewModel} /><BackToTop /></div>;
}

export default WithAuth(PartenaireEcoutes);
