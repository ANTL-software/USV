import './partenaireDocuments.scss';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartenaireDocuments } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PartenaireDocumentsContent } from '../../components/index.ts';

function PartenaireDocuments(): ReactElement {
  const navigate = useNavigate();
  return <div id="partnerDocuments"><Header /><PartenaireDocumentsContent viewModel={usePartenaireDocuments()} navigateBack={() => { void navigate(-1); }} /><BackToTop /></div>;
}

export default WithAuth(PartenaireDocuments);
