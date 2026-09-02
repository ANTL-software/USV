import './partenaireDocuments.scss';
import type { ReactElement } from 'react';
import { usePartenaireDocuments } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PartenaireDocumentsContent } from '../../components/index.ts';

function PartenaireDocuments(): ReactElement {
  const viewModel = usePartenaireDocuments();
  return <div id="partnerDocuments"><Header /><PartenaireDocumentsContent viewModel={viewModel} /><BackToTop /></div>;
}

export default WithAuth(PartenaireDocuments);
